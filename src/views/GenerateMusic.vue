<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAtlasState } from '@/composables/useAtlasState'

type GenerationState = 'idle' | 'submitting' | 'queued' | 'running' | 'succeeded' | 'failed'

interface StatusResponse {
  status: 'running' | 'succeeded' | 'failed'
  audioPath?: string
  seed?: string | null
  generationInfo?: string | null
  error?: string
}

const atlas = useAtlasState()
const prompt = ref('1940s wartime orchestral march, solemn brass, military snare drums, vintage mono recording, patriotic and cinematic, historically evocative')
const lyrics = ref('')
const duration = ref(30)
const bpm = ref(112)
const state = ref<GenerationState>('idle')
const serviceReady = ref(false)
const serviceMessage = ref('')
const errorMessage = ref('')
const audioUrl = ref('')
const seed = ref<string | null>(null)
const taskId = ref('')
let cancelled = false

const isZh = computed(() => atlas.language.value === 'zh')
const isBusy = computed(() => ['submitting', 'queued', 'running'].includes(state.value))

const presets = [
  {
    zh: '庄严进行曲',
    en: 'Solemn March',
    prompt: '1940s wartime orchestral march, solemn brass, military snare drums, vintage mono recording, patriotic and cinematic, historically evocative',
    bpm: 112,
  },
  {
    zh: '大乐队编制',
    en: 'Big-band texture',
    prompt: '1940s big band swing, warm brass section, walking bass, brushed drums, radio broadcast texture, bittersweet wartime dance hall atmosphere',
    bpm: 138,
  },
  {
    zh: '慢速管弦乐',
    en: 'Slow orchestral texture',
    prompt: 'slow 1940s orchestral elegy, mournful strings, distant bugle, restrained military drum, aged mono shellac recording, reflective and humane',
    bpm: 72,
  },
]

const stateLabel = computed(() => {
  const labels: Record<GenerationState, [string, string]> = {
    idle: ['等待生成', 'Ready'],
    submitting: ['正在提交', 'Submitting'],
    queued: ['已进入队列', 'Queued'],
    running: ['正在生成音乐', 'Generating music'],
    succeeded: ['生成完成', 'Generation complete'],
    failed: ['生成失败', 'Generation failed'],
  }
  return labels[state.value][isZh.value ? 0 : 1]
})

function applyPreset(preset: (typeof presets)[number]) {
  prompt.value = preset.prompt
  bpm.value = preset.bpm
}

async function checkService() {
  try {
    const response = await fetch('/api/music')
    if (!response.ok) throw new Error('Health check failed')
    const data = await response.json()
    serviceReady.value = Boolean(data.ready)
    serviceMessage.value = data.ready
      ? isZh.value ? '生成服务在线 · 声音特征模型已加载' : 'Generation service online · sound-feature model loaded'
      : isZh.value ? '模型正在启动，请稍候' : 'The model is starting'
  } catch {
    serviceReady.value = false
    serviceMessage.value = isZh.value ? '生成服务暂时离线' : 'Generation service is offline'
  }
}

async function pollTask(id: string) {
  for (let attempt = 0; attempt < 120 && !cancelled; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const response = await fetch('/api/music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status', taskId: id }),
    })
    const data = (await response.json()) as StatusResponse
    if (!response.ok) throw new Error(data.error || 'Status check failed')

    if (data.status === 'succeeded' && data.audioPath) {
      audioUrl.value = `/api/music?file=${encodeURIComponent(data.audioPath)}`
      seed.value = data.seed || null
      state.value = 'succeeded'
      return
    }
    if (data.status === 'failed') throw new Error(data.error || 'Generation failed')
    state.value = 'running'
  }
  throw new Error(isZh.value ? '生成超时，请稍后重试' : 'Generation timed out')
}

async function generate() {
  if (isBusy.value || !serviceReady.value) return
  errorMessage.value = ''
  audioUrl.value = ''
  seed.value = null
  state.value = 'submitting'

  try {
    const response = await fetch('/api/music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate',
        prompt: prompt.value,
        lyrics: lyrics.value,
        duration: duration.value,
        bpm: bpm.value,
      }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Unable to submit generation')
    taskId.value = data.taskId
    state.value = 'queued'
    await pollTask(taskId.value)
  } catch (error) {
    state.value = 'failed'
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
}

onMounted(checkService)
onBeforeUnmount(() => {
  cancelled = true
})
</script>

<template>
  <main class="generator-page">
    <section class="generator-hero">
      <div class="eyebrow">{{ isZh ? '研究附录 · 现代声音生成' : 'RESEARCH APPENDIX · MODERN SOUND GENERATION' }}</div>
      <h1>{{ isZh ? '历史声音特征实验' : 'Historical sound-feature experiment' }}</h1>
      <p>
        {{ isZh
          ? '把研究中整理的编制、节奏、音色和媒介描述转化为一段现代生成声音，用于观察描述词如何影响结果。'
          : 'This experiment turns descriptions of instrumentation, rhythm, timbre and media texture into modern generated sound, testing how those descriptions affect the result.' }}
      </p>
      <div class="evidence-warning">
        <strong>{{ isZh ? '不是历史证据' : 'NOT HISTORICAL EVIDENCE' }}</strong>
        <p>{{ isZh ? '本页结果由现代AI生成，不是1931—1945年的历史录音，不是对战时声音的准确复原，也不能用于证明当时的人如何创作、演出或聆听音乐。' : 'Results are generated by modern AI. They are not recordings from 1931–1945, not accurate reconstructions of wartime sound, and cannot prove how people created, performed or heard music at the time.' }}</p>
      </div>
      <div class="service-pill" :class="{ ready: serviceReady }">
        <span></span>{{ serviceMessage || (isZh ? '正在检查生成服务' : 'Checking generation service') }}
        <button v-if="!serviceReady" type="button" @click="checkService">{{ isZh ? '重试' : 'Retry' }}</button>
      </div>
    </section>

    <section class="generator-grid">
      <form class="generator-form" @submit.prevent="generate">
        <div class="field-group">
          <div class="field-heading">
            <label for="music-prompt">{{ isZh ? '音乐描述' : 'Music prompt' }}</label>
            <span>{{ prompt.length }}/800</span>
          </div>
          <textarea id="music-prompt" v-model="prompt" maxlength="800" rows="6" required />
          <div class="preset-row">
            <button v-for="preset in presets" :key="preset.en" type="button" @click="applyPreset(preset)">
              {{ isZh ? preset.zh : preset.en }}
            </button>
          </div>
        </div>

        <div class="field-group">
          <div class="field-heading">
            <label for="music-lyrics">{{ isZh ? '歌词（可选）' : 'Lyrics (optional)' }}</label>
            <span>{{ isZh ? '留空即纯音乐' : 'Leave blank for instrumental' }}</span>
          </div>
          <textarea id="music-lyrics" v-model="lyrics" maxlength="3000" rows="4" :placeholder="isZh ? '可输入中文、英文或其他语言歌词' : 'Enter lyrics in any language'" />
        </div>

        <div class="controls-row">
          <label>
            <span>{{ isZh ? '时长' : 'Duration' }} · {{ duration }}s</span>
            <input v-model.number="duration" type="range" min="10" max="180" step="10" />
          </label>
          <label>
            <span>BPM</span>
            <input v-model.number="bpm" type="number" min="50" max="200" />
          </label>
        </div>

        <button class="generate-button" type="submit" :disabled="isBusy || !serviceReady || prompt.length < 8">
          <span v-if="isBusy" class="spinner"></span>
          {{ isBusy ? stateLabel : (isZh ? '开始声音特征实验' : 'Run sound-feature experiment') }}
        </button>
        <p class="form-note">
          {{ isZh ? '当前每次生成 1 首，时长 10 秒至 3 分钟。请勿提交违法、仇恨或侵权内容。' : 'One track per request, from 10 seconds to 3 minutes. Do not submit illegal, hateful, or infringing content.' }}
        </p>
      </form>

      <aside class="result-panel">
        <div class="result-header">
          <span>{{ isZh ? '生成结果' : 'Generation result' }}</span>
          <strong :class="state">{{ stateLabel }}</strong>
        </div>

        <div v-if="audioUrl" class="audio-result">
          <div class="record-art" aria-hidden="true"><span></span></div>
          <h2>{{ isZh ? '现代生成结果' : 'Modern generated result' }}</h2>
          <p>{{ duration }}s · {{ bpm }} BPM<span v-if="seed"> · Seed {{ seed }}</span></p>
          <audio :src="audioUrl" controls autoplay preload="metadata" />
          <a :href="audioUrl" download="wwii-ai-music.mp3">{{ isZh ? '下载 MP3' : 'Download MP3' }}</a>
        </div>

        <div v-else-if="isBusy" class="waiting-result">
          <div class="wave-bars" aria-hidden="true"><i v-for="n in 9" :key="n"></i></div>
          <h2>{{ stateLabel }}</h2>
          <p>{{ isZh ? '通常只需数秒，请保持页面打开。' : 'This normally takes only a few seconds. Keep this page open.' }}</p>
        </div>

        <div v-else class="empty-result">
          <div class="archive-mark">EXPERIMENT · NOT ARCHIVE</div>
          <h2>{{ isZh ? '等待实验结果' : 'Waiting for an experiment result' }}</h2>
          <p>{{ isZh ? '选择预设或编写自己的音乐描述。' : 'Choose a preset or write your own musical direction.' }}</p>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </aside>
    </section>
  </main>
</template>

<style scoped>
.generator-page {
  min-height: 100vh;
  padding: 8.5rem clamp(1rem, 4vw, 4rem) 4rem;
}

.generator-hero {
  max-width: 74rem;
  margin: 0 auto 2.4rem;
}

.eyebrow {
  color: var(--atlas-accent);
  font-size: 0.72rem;
  letter-spacing: 0.25em;
}

.generator-hero h1 {
  max-width: 58rem;
  margin: 0.65rem 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: clamp(2.2rem, 5vw, 4.8rem);
  font-weight: 500;
  line-height: 1.04;
}

.generator-hero > p {
  max-width: 48rem;
  color: var(--atlas-muted);
  font-size: 1.05rem;
}

.evidence-warning {
  display: grid;
  gap: 0.45rem;
  max-width: 56rem;
  margin-top: 1.2rem;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(214, 177, 112, 0.35);
  border-left: 2px solid var(--atlas-accent);
  background: rgba(214, 177, 112, 0.055);
}

.evidence-warning strong {
  color: var(--atlas-accent);
  font-size: 0.67rem;
  letter-spacing: 0.13em;
}

.evidence-warning p {
  margin: 0;
  color: var(--atlas-muted);
  font-size: 0.82rem;
  line-height: 1.6;
}

.service-pill {
  display: inline-flex;
  gap: 0.55rem;
  align-items: center;
  margin-top: 0.7rem;
  padding: 0.48rem 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--atlas-line);
  font-size: 0.78rem;
}

.service-pill > span {
  width: 0.5rem;
  height: 0.5rem;
  background: #8c5d49;
  border-radius: 50%;
}

.service-pill.ready > span {
  background: #7fa071;
  box-shadow: 0 0 0.8rem rgba(127, 160, 113, 0.65);
}

.service-pill button {
  padding: 0;
  color: var(--atlas-accent);
  background: none;
  border: 0;
  cursor: pointer;
}

.generator-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(22rem, 0.92fr);
  max-width: 74rem;
  margin: auto;
  overflow: hidden;
  background: rgba(9, 13, 18, 0.72);
  border: 1px solid var(--atlas-line);
  box-shadow: var(--atlas-shadow);
  backdrop-filter: blur(24px);
}

.generator-form,
.result-panel {
  padding: clamp(1.3rem, 3vw, 2.4rem);
}

.generator-form {
  display: grid;
  gap: 1.35rem;
}

.field-group,
.controls-row label {
  display: grid;
  gap: 0.55rem;
}

.field-heading,
.result-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
}

.field-heading label,
.controls-row span,
.result-header > span {
  font-weight: 650;
  letter-spacing: 0.04em;
}

.field-heading span,
.form-note,
.audio-result p,
.waiting-result p,
.empty-result p {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.78rem;
}

textarea,
input[type='number'] {
  width: 100%;
  color: var(--atlas-text);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 0;
  outline: none;
  transition: border-color 160ms ease, background 160ms ease;
}

textarea {
  resize: vertical;
  min-height: 6rem;
  padding: 0.9rem;
  line-height: 1.55;
}

textarea:focus,
input[type='number']:focus {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(41, 151, 255, 0.7);
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.preset-row button {
  padding: 0.42rem 0.65rem;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(41, 151, 255, 0.08);
  border: 1px solid rgba(41, 151, 255, 0.25);
  cursor: pointer;
}

.controls-row {
  display: grid;
  grid-template-columns: 1fr 8rem;
  gap: 1rem;
}

input[type='range'] {
  width: 100%;
  accent-color: var(--atlas-accent);
}

input[type='number'] {
  padding: 0.55rem 0.7rem;
}

.generate-button {
  display: flex;
  justify-content: center;
  gap: 0.7rem;
  align-items: center;
  min-height: 3.3rem;
  color: #050506;
  background: linear-gradient(135deg, #dca66f, #b97843);
  border: 0;
  font-weight: 750;
  letter-spacing: 0.08em;
  cursor: pointer;
}

.generate-button:disabled {
  cursor: not-allowed;
  filter: grayscale(0.6);
  opacity: 0.55;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(18, 15, 12, 0.25);
  border-top-color: #050506;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.form-note {
  margin: -0.65rem 0 0;
  text-align: center;
}

.result-panel {
  position: relative;
  min-height: 32rem;
  background:
    linear-gradient(rgba(14, 20, 27, 0.84), rgba(14, 20, 27, 0.9)),
    repeating-linear-gradient(90deg, transparent 0 28px, rgba(255, 255, 255, 0.025) 29px 30px);
  border-left: 1px solid var(--atlas-line);
}

.result-header strong {
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.result-header strong.succeeded { color: #9ebc90; }
.result-header strong.failed { color: #d38672; }

.audio-result,
.waiting-result,
.empty-result {
  display: grid;
  place-items: center;
  align-content: center;
  min-height: 27rem;
  text-align: center;
}

.record-art {
  display: grid;
  place-items: center;
  width: min(13rem, 60vw);
  aspect-ratio: 1;
  background: repeating-radial-gradient(circle, #1d2024 0 4px, #111418 5px 8px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  box-shadow: 0 1.4rem 3rem rgba(0, 0, 0, 0.45);
  animation: spin 9s linear infinite;
}

.record-art span {
  width: 27%;
  aspect-ratio: 1;
  background: #a96f43;
  border: 0.35rem solid #d4a170;
  border-radius: 50%;
}

.audio-result h2,
.waiting-result h2,
.empty-result h2 {
  margin: 1.5rem 0 0.2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 1.4rem;
}

.audio-result audio {
  width: min(100%, 27rem);
  margin: 1.1rem 0;
}

.audio-result a {
  color: var(--atlas-accent);
  font-size: 0.85rem;
  text-underline-offset: 0.25rem;
}

.archive-mark {
  padding: 1rem 1.3rem;
  color: rgba(255, 255, 255, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-family: Georgia, serif;
  font-size: 1.7rem;
  letter-spacing: 0.15em;
  transform: rotate(-3deg);
}

.wave-bars {
  display: flex;
  gap: 0.35rem;
  align-items: center;
  height: 5rem;
}

.wave-bars i {
  width: 0.28rem;
  height: 22%;
  background: var(--atlas-accent);
  animation: wave 1.1s ease-in-out infinite alternate;
}

.wave-bars i:nth-child(2n) { animation-delay: -0.7s; }
.wave-bars i:nth-child(3n) { animation-delay: -0.35s; }

.error-message {
  margin: 0;
  padding: 0.8rem;
  color: #e5a18e;
  background: rgba(159, 70, 51, 0.12);
  border: 1px solid rgba(211, 119, 95, 0.25);
  font-size: 0.85rem;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes wave { to { height: 90%; opacity: 0.4; } }

@media (max-width: 900px) {
  .generator-page { padding-top: 10.5rem; }
  .generator-grid { grid-template-columns: 1fr; }
  .result-panel { border-top: 1px solid var(--atlas-line); border-left: 0; }
}

@media (max-width: 560px) {
  .controls-row { grid-template-columns: 1fr; }
  .generator-form, .result-panel { padding: 1.15rem; }
}

/* Focused studio layout */
.generator-page {
  width: min(100%, var(--page-width));
  margin: 0 auto;
  padding: 7.5rem 1.25rem 4rem;
}

.generator-hero {
  max-width: none;
  margin-bottom: 2rem;
}

.eyebrow {
  letter-spacing: 0.12em;
}

.generator-hero h1 {
  max-width: 48rem;
  font-size: clamp(2.3rem, 4.8vw, 4.25rem);
  font-weight: 540;
}

.generator-hero > p {
  max-width: 42rem;
  font-size: 0.96rem;
  line-height: 1.6;
}

.service-pill {
  padding: 0.4rem 0;
  background: transparent;
  border: 0;
}

.service-pill.ready > span {
  box-shadow: none;
}

.generator-grid {
  grid-template-columns: minmax(0, 1.1fr) minmax(20rem, 0.9fr);
  max-width: none;
  background: transparent;
  border: 1px solid var(--atlas-line);
  border-radius: var(--atlas-radius);
  box-shadow: none;
  backdrop-filter: none;
}

.generator-form,
.result-panel {
  padding: clamp(1.3rem, 3vw, 2rem);
}

textarea,
input[type='number'] {
  background: #101012;
  border-color: var(--atlas-line);
  border-radius: 6px;
}

textarea:focus,
input[type='number']:focus {
  background: #121214;
  border-color: var(--atlas-accent);
}

.preset-row button {
  padding: 0.38rem 0.6rem;
  color: var(--atlas-muted);
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--atlas-line);
  cursor: pointer;
}

.preset-row button:hover {
  color: var(--atlas-accent);
  border-color: var(--atlas-accent);
}

.generate-button {
  min-height: 3rem;
  color: #17130d;
  background: var(--atlas-accent);
  border-radius: 6px;
}

.result-panel {
  min-height: 28rem;
  background: #101012;
  border-left-color: var(--atlas-line);
}

.audio-result,
.waiting-result,
.empty-result {
  min-height: 23rem;
}

.record-art {
  width: min(10rem, 50vw);
  background: #171719;
  box-shadow: none;
}

.record-art span {
  background: #7e6744;
  border-color: var(--atlas-accent);
}

.archive-mark {
  padding: 0.75rem 1rem;
  border-color: var(--atlas-line);
  font-size: 1.35rem;
  transform: none;
}

@media (max-width: 900px) {
  .generator-page {
    padding-top: 11.5rem;
  }

  .generator-grid {
    grid-template-columns: 1fr;
  }
}
</style>
