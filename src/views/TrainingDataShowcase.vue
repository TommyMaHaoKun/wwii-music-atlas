<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { dispatchSourceAudioState } from '@/lib/audioBus'
import {
  aceDatasetProfiles,
  fineTuneModelHighlights,
  fineTuneSourceLinks,
  fineTuneWorkflowSteps,
  trainingFigures,
  trainingMetrics,
  trainingSamples,
  trainingWorkflowSteps,
  type LocalizedText,
  type TrainingSample,
} from '@/data/trainingData'

const atlas = useAtlasState()
const activeStepId = ref(trainingWorkflowSteps[0]?.id ?? '')
const brokenSampleIds = ref<string[]>([])

const activeStep = computed(() =>
  trainingWorkflowSteps.find((step) => step.id === activeStepId.value) ?? trainingWorkflowSteps[0],
)
const activeStepIndex = computed(() =>
  Math.max(0, trainingWorkflowSteps.findIndex((step) => step.id === activeStep.value.id)),
)
const playableSampleCount = computed(() => trainingSamples.filter((sample) => !brokenSampleIds.value.includes(sample.id)).length)
const trainingIntroStyle = computed<CSSProperties>(() => ({
  '--training-intro-figure': `url("${trainingFigures[0]?.src ?? ''}")`,
}))

function t(text: LocalizedText) {
  return atlas.language.value === 'zh' ? text.zh : text.en
}

function setActiveStep(stepId: string) {
  activeStepId.value = stepId
}

function formatDuration(seconds: number) {
  const rounded = Math.round(seconds)
  const minutes = Math.floor(rounded / 60)
  const nextSeconds = String(rounded % 60).padStart(2, '0')

  return `${minutes}:${nextSeconds}`
}

function getCategoryLabel(category: string) {
  const labels: Record<string, LocalizedText> = {
    cantata: { zh: '大合唱', en: 'Cantata' },
    home_front_song: { zh: '后方歌曲', en: 'Home front song' },
    march: { zh: '进行曲', en: 'March' },
    propaganda_song: { zh: '宣传歌曲', en: 'Propaganda song' },
    resistance_song: { zh: '抵抗歌曲', en: 'Resistance song' },
    wartime_popular_song: { zh: '战时流行歌曲', en: 'Wartime popular song' },
    youth_song: { zh: '青年歌曲', en: 'Youth song' },
  }

  return t(labels[category] ?? { zh: category, en: category.replaceAll('_', ' ') })
}

function getContextLabel(context: string) {
  const labels: Record<string, LocalizedText> = {
    Allied: { zh: '盟军', en: 'Allied' },
    Axis: { zh: '轴心国', en: 'Axis' },
    'Home Front': { zh: '后方', en: 'Home Front' },
    Resistance: { zh: '抵抗', en: 'Resistance' },
  }

  return t(labels[context] ?? { zh: context, en: context })
}

function canPlaySample(sample: TrainingSample) {
  return !brokenSampleIds.value.includes(sample.id)
}

function handleSamplePlay(sample: TrainingSample) {
  dispatchSourceAudioState({ active: true, clipId: sample.id })
}

function handleSampleStop(sample: TrainingSample) {
  dispatchSourceAudioState({ active: false, clipId: sample.id })
}

function handleSampleError(sample: TrainingSample) {
  if (!brokenSampleIds.value.includes(sample.id)) {
    brokenSampleIds.value = [...brokenSampleIds.value, sample.id]
  }

  dispatchSourceAudioState({ active: false, clipId: sample.id })
}
</script>

<template>
  <main class="training-page" data-testid="training-data-page">
    <section class="training-intro" :style="trainingIntroStyle" aria-labelledby="training-title">
      <div class="intro-copy">
        <p class="kicker">{{ atlas.language.value === 'zh' ? 'AI 数据实验' : 'AI data experiment' }}</p>
        <h1 id="training-title">{{ atlas.language.value === 'zh' ? 'AI 训练数据小实验' : 'My AI Data Experiment' }}</h1>
        <p>
          {{
            atlas.language.value === 'zh'
              ? '这一页记录我怎么把二战音乐档案整理成 ACE STEP 1.5 的练习数据。AI 帮我做初步分类，我再看来源、标签和试听样本有没有问题。'
              : 'This page records how I turned WWII music archive material into practice data for ACE STEP 1.5. AI helped with the first pass, and I checked the sources, labels, and preview clips.'
          }}
        </p>
      </div>

      <div class="metric-rack" aria-label="Dataset metrics">
        <article v-for="metric in trainingMetrics" :key="metric.id" data-testid="training-metric">
          <strong>{{ metric.value }}</strong>
          <span>{{ t(metric.label) }}</span>
          <small>{{ t(metric.detail) }}</small>
        </article>
      </div>
    </section>

    <section class="workflow-surface" data-testid="training-workflow" aria-labelledby="workflow-title">
      <div class="section-head">
        <p class="kicker">{{ atlas.language.value === 'zh' ? '整理过程' : 'Sorting path' }}</p>
        <h2 id="workflow-title">{{ atlas.language.value === 'zh' ? '我怎么把原始包整理成样本' : 'How I turned raw files into samples' }}</h2>
      </div>

      <div class="workflow-layout">
        <nav class="step-rail" aria-label="Training workflow steps">
          <button
            v-for="(step, index) in trainingWorkflowSteps"
            :key="step.id"
            type="button"
            :class="{ active: step.id === activeStep.id }"
            @click="setActiveStep(step.id)"
          >
            <span>{{ step.stepNumber }}</span>
            <strong>{{ t(step.title) }}</strong>
            <small>{{ String(index + 1).padStart(2, '0') }}</small>
          </button>
        </nav>

        <article class="lab-output" data-testid="training-lab-output">
          <div class="output-title">
            <p class="kicker">{{ atlas.language.value === 'zh' ? '当前步骤' : 'Current step' }} {{ activeStepIndex + 1 }}/{{ trainingWorkflowSteps.length }}</p>
            <h3>{{ t(activeStep.title) }}</h3>
            <p>{{ t(activeStep.summary) }}</p>
          </div>

          <code>{{ activeStep.command }}</code>

          <div class="artifact-grid">
            <div>
              <span>{{ atlas.language.value === 'zh' ? '输入' : 'Inputs' }}</span>
              <ul>
                <li v-for="item in activeStep.inputs" :key="`input-${item}`">{{ item }}</li>
              </ul>
            </div>
            <div>
              <span>{{ atlas.language.value === 'zh' ? '输出' : 'Outputs' }}</span>
              <ul>
                <li v-for="item in activeStep.outputs" :key="`output-${item}`">{{ item }}</li>
              </ul>
            </div>
          </div>

          <div class="step-stats">
            <span v-for="stat in activeStep.stats" :key="`${activeStep.id}-${t(stat.label)}`">
              <small>{{ t(stat.label) }}</small>
              <strong>{{ stat.value }}</strong>
            </span>
          </div>
        </article>
      </div>
    </section>

    <section class="fine-tune-surface" data-testid="fine-tune-section" aria-labelledby="fine-tune-title">
      <div class="section-head wide">
        <div>
          <p class="kicker">{{ atlas.language.value === 'zh' ? '模型微调' : 'Model fine-tuning' }}</p>
          <h2 id="fine-tune-title">{{ atlas.language.value === 'zh' ? '用 ACE-Step 1.5 微调二战音乐风格' : 'Fine-tuning ACE-Step 1.5 for WWII music style' }}</h2>
        </div>
        <p>
          {{
            atlas.language.value === 'zh'
              ? 'ACE-Step 1.5 的官方介绍强调开源、商用友好、合规训练数据、LM+DiT 架构和低显存本地运行。我把这次清洗出的二战音乐切片做成小样本 LoKr 适配器，用来测试模型能不能更稳定地捕捉 1940 年代军乐、合唱和广播质感。'
              : 'ACE-Step 1.5 is presented as an open, commercial-friendly, legally grounded music model with an LM+DiT architecture and low-VRAM local use. I turned the cleaned WWII clips into a small LoKr adapter to test whether it can better hold 1940s march, chorus, and broadcast textures.'
          }}
        </p>
      </div>

      <div class="model-highlight-grid" aria-label="ACE-Step 1.5 highlights">
        <article v-for="highlight in fineTuneModelHighlights" :key="highlight.id" data-testid="fine-tune-highlight">
          <span>{{ highlight.value }}</span>
          <strong>{{ t(highlight.label) }}</strong>
          <p>{{ t(highlight.detail) }}</p>
        </article>
      </div>

      <div class="model-source-links" aria-label="ACE-Step 1.5 source links">
        <a v-for="link in fineTuneSourceLinks" :key="link.id" :href="link.href" target="_blank" rel="noreferrer">
          {{ t(link.label) }}
        </a>
      </div>

      <div class="fine-tune-timeline">
        <article v-for="step in fineTuneWorkflowSteps" :key="step.id" class="fine-tune-step" data-testid="fine-tune-step">
          <div class="fine-tune-copy">
            <span>{{ step.stepNumber }}</span>
            <h3>{{ t(step.title) }}</h3>
            <p>{{ t(step.summary) }}</p>
            <ul>
              <li v-for="note in step.notes" :key="`${step.id}-${t(note)}`">{{ t(note) }}</li>
            </ul>
          </div>

          <figure class="fine-tune-image">
            <img :src="step.src" :alt="t(step.alt)" loading="lazy">
            <figcaption>{{ step.stepNumber }} · {{ t(step.title) }}</figcaption>
          </figure>
        </article>
      </div>
    </section>

    <section class="profiles-surface" aria-labelledby="profiles-title">
      <div class="section-head">
        <p class="kicker">{{ atlas.language.value === 'zh' ? 'ACE 分组' : 'ACE groups' }}</p>
        <h2 id="profiles-title">{{ atlas.language.value === 'zh' ? '四种查看训练集的方法' : 'Four ways I checked the set' }}</h2>
      </div>
      <div class="profile-grid">
        <article v-for="profile in aceDatasetProfiles" :key="profile.id" data-testid="training-profile">
          <span>{{ profile.sampleCount }}</span>
          <strong>{{ t(profile.label) }}</strong>
          <small>{{ profile.id }}</small>
          <p>{{ t(profile.filters) }}</p>
        </article>
      </div>
    </section>

    <section class="samples-surface" data-testid="training-samples" aria-labelledby="samples-title">
      <div class="section-head wide">
        <div>
          <p class="kicker">{{ atlas.language.value === 'zh' ? '试听检查' : 'Listening check' }}</p>
          <h2 id="samples-title">{{ atlas.language.value === 'zh' ? '8 个 cleaned_audio 试听样本' : '8 cleaned_audio samples I checked' }}</h2>
        </div>
        <p>
          {{
            atlas.language.value === 'zh'
              ? `当前可播放 ${playableSampleCount} 个预览；敏感历史材料保留明确语境。`
              : `${playableSampleCount} previews are currently playable; sensitive historical material keeps explicit context.`
          }}
        </p>
      </div>

      <div class="sample-list">
        <article
          v-for="sample in trainingSamples"
          :key="sample.id"
          class="sample-row"
          :class="{ sensitive: sample.sensitive }"
          data-testid="training-sample"
        >
          <div class="sample-main">
            <div class="sample-heading">
              <span>{{ t(sample.country) }}</span>
              <h3>{{ t(sample.title) }}</h3>
              <small>{{ sample.id }} · {{ sample.songId }}</small>
            </div>

            <div class="sample-tags">
              <span>{{ getCategoryLabel(sample.category) }}</span>
              <span>{{ getContextLabel(sample.context) }}</span>
              <span>{{ formatDuration(sample.durationSec) }}</span>
              <span>Q{{ sample.qualityScore }}</span>
              <span v-if="sample.sensitive" class="sensitivity-label" data-testid="sensitive-sample-label">
                {{ sample.sensitivityLabel ? t(sample.sensitivityLabel) : atlas.language.value === 'zh' ? '敏感历史材料' : 'Sensitive historical material' }}
              </span>
            </div>

            <p>{{ t(sample.caption) }}</p>

            <p v-if="sample.sensitive" class="research-note">
              {{
                atlas.language.value === 'zh'
                  ? '该样本仅用于历史音乐数据研究和模型数据集说明，不代表认同其中政治内容。'
                  : 'This sample is included only for historical music-data research and dataset transparency, not endorsement of its political content.'
              }}
            </p>
          </div>

          <div class="sample-player">
            <audio
              v-if="canPlaySample(sample)"
              controls
              preload="none"
              :src="sample.audioSrc"
              :aria-label="t(sample.title)"
              @play="handleSamplePlay(sample)"
              @pause="handleSampleStop(sample)"
              @ended="handleSampleStop(sample)"
              @error="handleSampleError(sample)"
            />
            <p v-else class="player-error" data-testid="training-audio-error">
              {{ atlas.language.value === 'zh' ? '预览音频不可用，请打开来源记录。' : 'Preview audio failed. Open the source record instead.' }}
            </p>
            <div class="sample-links">
              <a :href="sample.sourceUrl" target="_blank" rel="noreferrer">
                {{ atlas.language.value === 'zh' ? '来源记录' : 'Source record' }}
              </a>
              <span>{{ sample.cleanedPath }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="figures-surface" aria-labelledby="figures-title">
      <div class="section-head">
        <p class="kicker">{{ atlas.language.value === 'zh' ? '图表检查' : 'Chart check' }}</p>
        <h2 id="figures-title">{{ atlas.language.value === 'zh' ? '这些图表帮我检查数据' : 'Charts I used to check the data' }}</h2>
      </div>
      <div class="figure-grid">
        <figure v-for="figure in trainingFigures" :key="figure.id" data-testid="training-figure">
          <img :src="figure.src" :alt="t(figure.alt)" loading="lazy">
          <figcaption>{{ t(figure.title) }}</figcaption>
        </figure>
      </div>
    </section>
  </main>
</template>

<style scoped>
.training-page {
  min-height: 100vh;
  padding: 6.5rem 1rem 1.4rem;
  overflow-x: hidden;
}

.training-intro,
.workflow-surface,
.fine-tune-surface,
.profiles-surface,
.samples-surface,
.figures-surface {
  position: relative;
  z-index: 1;
  max-width: 82rem;
  margin: 0 auto 1rem;
  background: rgba(28, 28, 30, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
}

.training-intro {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(26rem, 1.05fr);
  gap: 1rem;
  align-items: end;
  min-height: 25rem;
  padding: 1.25rem;
  background:
    linear-gradient(120deg, rgba(8, 12, 18, 0.94), rgba(8, 12, 18, 0.7) 56%, rgba(8, 12, 18, 0.92)),
    var(--training-intro-figure) right 2rem center / min(34rem, 48%) auto no-repeat,
    rgba(28, 28, 30, 0.78);
  animation: surface-in 420ms ease both;
}

.intro-copy {
  display: grid;
  gap: 0.8rem;
  align-self: center;
  max-width: 34rem;
}

.kicker {
  margin: 0;
  color: var(--atlas-accent);
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

h1,
h2,
h3 {
  margin: 0;
  color: var(--atlas-text);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  line-height: 1;
}

h1 {
  font-size: 3.8rem;
}

h2 {
  font-size: 2.15rem;
}

h3 {
  font-size: 1.55rem;
}

p {
  margin: 0;
  color: var(--atlas-muted);
  line-height: 1.62;
}

.metric-rack {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: stretch;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.035);
}

.metric-rack article {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
  padding: 0.85rem;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.metric-rack article:first-child {
  border-left: 0;
}

.metric-rack strong {
  color: var(--atlas-text);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 1.9rem;
  line-height: 1;
}

.metric-rack span,
.profile-grid strong,
.sample-heading h3 {
  overflow-wrap: anywhere;
}

.metric-rack span {
  color: var(--atlas-text);
  font-weight: 600;
}

.metric-rack small,
.profile-grid small,
.sample-heading small,
.sample-tags span,
.sample-links span {
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.35;
}

.workflow-surface,
.fine-tune-surface,
.profiles-surface,
.samples-surface,
.figures-surface {
  display: grid;
  gap: 1rem;
  padding: 1.1rem;
}

.section-head {
  display: grid;
  gap: 0.45rem;
}

.section-head.wide {
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem);
  align-items: end;
}

.workflow-layout {
  display: grid;
  grid-template-columns: minmax(16rem, 21rem) minmax(0, 1fr);
  gap: 1rem;
  align-items: stretch;
}

.step-rail {
  display: grid;
  gap: 0.45rem;
  align-content: start;
}

.step-rail button {
  display: grid;
  grid-template-columns: 3.2rem minmax(0, 1fr) auto;
  gap: 0.55rem;
  align-items: center;
  min-height: 3.4rem;
  padding: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.035);
  color: var(--atlas-text);
  text-align: left;
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.step-rail button:hover,
.step-rail button:focus-visible,
.step-rail button.active {
  background: rgba(41, 151, 255, 0.14);
  border-color: rgba(41, 151, 255, 0.38);
  transform: translateX(0.12rem);
}

.step-rail span,
.step-stats strong,
.profile-grid span {
  color: var(--atlas-accent);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.step-rail strong {
  min-width: 0;
  font-size: 0.95rem;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.lab-output {
  display: grid;
  gap: 1rem;
  min-width: 0;
  padding: 1rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02)),
    rgba(0, 0, 0, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.output-title {
  display: grid;
  gap: 0.45rem;
}

code {
  display: block;
  min-width: 0;
  padding: 0.75rem;
  overflow: auto;
  color: #f6d19c;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.artifact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.artifact-grid div {
  min-width: 0;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.artifact-grid span {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--atlas-accent);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

ul {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding-left: 1rem;
  color: var(--atlas-muted);
}

li {
  overflow-wrap: anywhere;
}

.step-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.step-stats span {
  display: grid;
  gap: 0.2rem;
  padding-top: 0.55rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.step-stats small {
  color: rgba(255, 255, 255, 0.56);
}

.model-highlight-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
}

.model-highlight-grid article {
  display: grid;
  gap: 0.42rem;
  min-width: 0;
  padding: 0.85rem;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.model-highlight-grid span,
.fine-tune-copy span {
  color: var(--atlas-accent);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.model-highlight-grid span {
  font-size: 1.45rem;
  line-height: 1;
  overflow-wrap: anywhere;
}

.model-highlight-grid strong {
  color: var(--atlas-text);
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.model-highlight-grid p {
  font-size: 0.9rem;
}

.model-source-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.model-source-links a {
  padding: 0.45rem 0.65rem;
  color: var(--atlas-text);
  text-decoration: none;
  background: rgba(41, 151, 255, 0.12);
  border: 1px solid rgba(41, 151, 255, 0.28);
}

.fine-tune-timeline {
  display: grid;
  gap: 0.85rem;
}

.fine-tune-step {
  display: grid;
  grid-template-columns: minmax(18rem, 0.8fr) minmax(0, 1.2fr);
  gap: 1rem;
  align-items: start;
  min-width: 0;
  padding: 0.95rem;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.09);
}

.fine-tune-copy {
  display: grid;
  gap: 0.55rem;
  min-width: 0;
}

.fine-tune-copy span {
  font-size: 1.7rem;
  line-height: 1;
}

.fine-tune-copy ul {
  padding-left: 1.05rem;
}

.fine-tune-image {
  min-width: 0;
}

.fine-tune-image img {
  aspect-ratio: 16 / 9;
  min-height: 15rem;
  max-height: 27rem;
  object-fit: contain;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
}

.profile-grid article {
  display: grid;
  gap: 0.42rem;
  min-width: 0;
  padding: 0.85rem;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 180ms ease, border-color 180ms ease;
}

.profile-grid article:hover {
  border-color: rgba(41, 151, 255, 0.34);
  transform: translateY(-0.1rem);
}

.profile-grid span {
  font-size: 1.65rem;
  line-height: 1;
}

.profile-grid p {
  font-size: 0.9rem;
}

.sample-list {
  display: grid;
  gap: 0.7rem;
}

.sample-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 26rem);
  gap: 1rem;
  align-items: start;
  min-width: 0;
  padding: 0.95rem;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.09);
  transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.sample-row:hover,
.sample-row:focus-within {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(41, 151, 255, 0.34);
  transform: translateY(-0.08rem);
}

.sample-row.sensitive {
  background: rgba(122, 68, 51, 0.14);
  border-color: rgba(214, 122, 86, 0.26);
}

.sample-main,
.sample-player,
.sample-heading {
  display: grid;
  gap: 0.55rem;
  min-width: 0;
}

.sample-heading span {
  width: fit-content;
  padding: 0.16rem 0.45rem;
  color: var(--atlas-text);
  background: rgba(41, 151, 255, 0.14);
  font-size: 0.72rem;
}

.sample-heading h3 {
  font-size: 1.35rem;
}

.sample-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.sample-tags span {
  padding: 0.2rem 0.48rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.035);
}

.sample-tags .sensitivity-label {
  color: #ffd1bd;
  background: rgba(214, 122, 86, 0.16);
  border-color: rgba(214, 122, 86, 0.34);
}

.research-note,
.player-error {
  color: rgba(255, 209, 189, 0.86);
}

.sample-player audio {
  width: 100%;
}

.sample-links {
  display: grid;
  gap: 0.4rem;
}

.sample-links a {
  width: fit-content;
  color: var(--atlas-text);
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.24);
}

.sample-links span {
  display: block;
  overflow-wrap: anywhere;
  font-size: 0.76rem;
}

.figure-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

figure {
  display: grid;
  gap: 0.45rem;
  margin: 0;
}

figure img {
  width: 100%;
  min-height: 16rem;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

figcaption {
  color: var(--atlas-muted);
  font-size: 0.9rem;
}

@keyframes surface-in {
  from {
    opacity: 0;
    transform: translateY(0.45rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1180px) {
  .training-page {
    padding-top: 8.6rem;
  }

  .training-intro,
  .workflow-layout,
  .fine-tune-step,
  .sample-row,
  .section-head.wide {
    grid-template-columns: 1fr;
  }

  .training-intro {
    min-height: auto;
    background:
      linear-gradient(180deg, rgba(8, 12, 18, 0.94), rgba(8, 12, 18, 0.76)),
      var(--training-intro-figure) right 1rem bottom 1rem / 22rem auto no-repeat,
      rgba(28, 28, 30, 0.78);
  }

  .step-rail {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-rack,
  .model-highlight-grid,
  .profile-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-rack article:nth-child(odd) {
    border-left: 0;
  }
}

@media (max-width: 760px) {
  .training-page {
    padding: 12rem 0.75rem 1rem;
  }

  .training-intro,
  .workflow-surface,
  .fine-tune-surface,
  .profiles-surface,
  .samples-surface,
  .figures-surface {
    margin-bottom: 0.8rem;
    padding: 0.9rem;
  }

  .training-intro {
    background:
      linear-gradient(180deg, rgba(8, 12, 18, 0.95), rgba(8, 12, 18, 0.82)),
      rgba(28, 28, 30, 0.78);
  }

  h1 {
    font-size: 2.35rem;
  }

  h2 {
    font-size: 1.65rem;
  }

  h3,
  .sample-heading h3 {
    font-size: 1.2rem;
  }

  .metric-rack,
  .model-highlight-grid,
  .profile-grid,
  .artifact-grid,
  .step-stats,
  .figure-grid {
    grid-template-columns: 1fr;
  }

  .fine-tune-step {
    padding: 0.8rem;
  }

  .fine-tune-image img {
    min-height: 11rem;
    max-height: 20rem;
  }

  .metric-rack article,
  .metric-rack article:nth-child(odd) {
    border-left: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .metric-rack article:first-child {
    border-top: 0;
  }

  .step-rail {
    display: flex;
    gap: 0.55rem;
    margin-right: -0.9rem;
    padding-right: 0.9rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }

  .step-rail button {
    flex: 0 0 13.5rem;
    scroll-snap-align: start;
  }

  .step-rail button:hover,
  .step-rail button:focus-visible,
  .step-rail button.active,
  .profile-grid article:hover,
  .sample-row:hover,
  .sample-row:focus-within {
    transform: none;
  }

  .sample-row {
    padding: 0.8rem;
  }

  figure img {
    min-height: 11rem;
  }
}
</style>
