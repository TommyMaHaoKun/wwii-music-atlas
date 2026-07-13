<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getPlayableBackgroundTracks } from '@/data/backgroundTracks'
import type { BackgroundTrack, Language } from '@/data/ww2MusicAtlas'
import { SOURCE_AUDIO_STATE_EVENT, type BackgroundAudioStateDetail, type SourceAudioStateDetail } from '@/lib/audioBus'

const props = withDefaults(defineProps<{
  language: Language
  tracks?: BackgroundTrack[]
}>(), {
  tracks: () => getPlayableBackgroundTracks(),
})

const emit = defineEmits<{
  'state-change': [detail: BackgroundAudioStateDetail]
}>()

const audioRef = ref<HTMLAudioElement | null>(null)
const currentIndex = ref(0)
const volume = ref(0.34)
const hasInteracted = ref(false)
const isPlaying = ref(false)
const userPaused = ref(false)
const playbackBlocked = ref(false)
const sourceAudioActive = ref(false)
const notice = ref('')
const brokenTrackIds = ref<string[]>([])

const currentTrack = computed(() => props.tracks[currentIndex.value] ?? props.tracks[0] ?? null)
const hasTracks = computed(() => props.tracks.length > 0)

const statusLabel = computed(() => {
  if (!hasTracks.value) {
    return props.language === 'zh' ? '暂无背景曲目' : 'No background tracks'
  }

  if (sourceAudioActive.value) {
    return props.language === 'zh' ? '资料音频播放中' : 'Paused for source audio'
  }

  if (isPlaying.value) {
    return props.language === 'zh' ? '背景轮播中' : 'Rolling soundtrack'
  }

  if (!hasInteracted.value) {
    return props.language === 'zh' ? '首次交互后启动' : 'Starts after first interaction'
  }

  if (playbackBlocked.value) {
    return props.language === 'zh' ? '点击播放即可继续' : 'Press play to continue'
  }

  if (userPaused.value) {
    return props.language === 'zh' ? '已手动暂停' : 'Paused by listener'
  }

  return props.language === 'zh' ? '待命' : 'Ready'
})

watch(volume, (nextVolume) => {
  if (audioRef.value) {
    audioRef.value.volume = nextVolume
  }
}, { immediate: true })

watch(
  [
    () => currentTrack.value?.id ?? null,
    () => currentTrack.value?.countryId ?? null,
    isPlaying,
    sourceAudioActive,
    playbackBlocked,
  ],
  () => emitPlaybackState(),
  { immediate: true },
)

watch(
  () => currentTrack.value?.src,
  async () => {
    if (!audioRef.value || !currentTrack.value) {
      return
    }

    audioRef.value.load()

    if (hasInteracted.value && !userPaused.value && !sourceAudioActive.value) {
      await nextTick()
      await attemptPlay()
    }
  },
)

function setFirstInteraction() {
  if (hasInteracted.value) {
    return
  }

  hasInteracted.value = true

  if (!userPaused.value && !sourceAudioActive.value) {
    void attemptPlay()
  }
}

function emitPlaybackState() {
  emit('state-change', {
    trackId: currentTrack.value?.id ?? null,
    countryId: currentTrack.value?.countryId ?? null,
    isPlaying: isPlaying.value,
    sourceAudioActive: sourceAudioActive.value,
    blocked: playbackBlocked.value,
  })
}

async function attemptPlay() {
  if (!audioRef.value || !currentTrack.value || sourceAudioActive.value) {
    return
  }

  notice.value = ''

  try {
    await audioRef.value.play()
    isPlaying.value = true
    playbackBlocked.value = false
  } catch {
    isPlaying.value = false
    playbackBlocked.value = true
    notice.value = props.language === 'zh'
      ? '浏览器阻止了自动播放，你可以手动开启背景音乐。'
      : 'Autoplay was blocked. Use play to start the soundtrack.'
  }
}

function syncPausedState() {
  isPlaying.value = false
}

function pausePlayback(manual = false) {
  if (!audioRef.value) {
    return
  }

  if (manual) {
    userPaused.value = true
  }

  audioRef.value.pause()
  isPlaying.value = false
}

function getNextIndex() {
  if (props.tracks.length <= 1) {
    return currentIndex.value
  }

  for (let offset = 1; offset <= props.tracks.length; offset += 1) {
    const candidate = (currentIndex.value + offset) % props.tracks.length
    const track = props.tracks[candidate]
    if (track && !brokenTrackIds.value.includes(track.id)) {
      return candidate
    }
  }

  return currentIndex.value
}

function moveToNextTrack(manual = false) {
  if (!hasTracks.value) {
    return
  }

  if (manual) {
    userPaused.value = false
    hasInteracted.value = true
  }

  currentIndex.value = getNextIndex()
}

function handleEnded() {
  moveToNextTrack()
}

function handleError() {
  if (!currentTrack.value) {
    return
  }

  if (!brokenTrackIds.value.includes(currentTrack.value.id)) {
    brokenTrackIds.value = [...brokenTrackIds.value, currentTrack.value.id]
  }

  isPlaying.value = false
  notice.value = props.language === 'zh'
    ? '已跳过当前不可用曲目。'
    : 'Skipped an unavailable background track.'

  if (brokenTrackIds.value.length >= props.tracks.length) {
    playbackBlocked.value = true
    notice.value = props.language === 'zh'
      ? '当前曲库暂时不可播放。'
      : 'The current background playlist is unavailable.'
    return
  }

  moveToNextTrack()
}

function togglePlayback() {
  if (!hasTracks.value) {
    return
  }

  hasInteracted.value = true

  if (isPlaying.value) {
    pausePlayback(true)
    return
  }

  userPaused.value = false
  void attemptPlay()
}

function handleSourceAudioState(event: Event) {
  const detail = (event as CustomEvent<SourceAudioStateDetail>).detail
  sourceAudioActive.value = detail?.active ?? false

  if (sourceAudioActive.value) {
    pausePlayback()
    return
  }

  if (hasInteracted.value && !userPaused.value) {
    void attemptPlay()
  }
}

onMounted(() => {
  window.addEventListener('pointerdown', setFirstInteraction, { once: true })
  window.addEventListener('keydown', setFirstInteraction, { once: true })
  window.addEventListener(SOURCE_AUDIO_STATE_EVENT, handleSourceAudioState as EventListener)

  if (audioRef.value) {
    audioRef.value.volume = volume.value
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', setFirstInteraction)
  window.removeEventListener('keydown', setFirstInteraction)
  window.removeEventListener(SOURCE_AUDIO_STATE_EVENT, handleSourceAudioState as EventListener)
})
</script>

<template>
  <section class="background-player" data-testid="background-player">
    <audio
      v-if="currentTrack"
      ref="audioRef"
      :src="currentTrack.src"
      preload="none"
      @ended="handleEnded"
      @error="handleError"
      @pause="syncPausedState"
    />

    <div class="player-copy">
      <p class="eyebrow">{{ language === 'zh' ? '背景音乐' : 'Background soundtrack' }}</p>
      <div class="player-title-row">
        <h2 data-testid="background-player-track">
          {{ currentTrack ? (language === 'zh' ? currentTrack.titleZh : currentTrack.titleEn) : (language === 'zh' ? '暂无曲目' : 'No tracks') }}
        </h2>
        <span class="status-pill" data-testid="background-player-status">{{ statusLabel }}</span>
      </div>
      <p class="track-meta" v-if="currentTrack">
        <span>{{ currentTrack.yearLabel }}</span>
        <span>{{ currentTrack.credit }}</span>
      </p>
      <p class="track-note" v-if="currentTrack">
        {{ language === 'zh' ? currentTrack.noteZh : currentTrack.noteEn }}
      </p>
      <p v-if="notice" class="player-notice" data-testid="background-player-notice">{{ notice }}</p>
    </div>

    <div class="player-controls">
      <button
        class="player-button primary"
        type="button"
        data-testid="background-player-toggle"
        :disabled="!hasTracks"
        @click="togglePlayback"
      >
        {{ isPlaying ? (language === 'zh' ? '暂停' : 'Pause') : language === 'zh' ? '播放' : 'Play' }}
      </button>
      <button
        class="player-button"
        type="button"
        data-testid="background-player-next"
        :disabled="!hasTracks"
        @click="moveToNextTrack(true)"
      >
        {{ language === 'zh' ? '下一首' : 'Next' }}
      </button>
      <label class="volume-control">
        <span>{{ language === 'zh' ? '音量' : 'Volume' }}</span>
        <input
          v-model="volume"
          data-testid="background-player-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
        >
      </label>
    </div>

    <div v-if="currentTrack" class="player-links">
      <a class="card-link" :href="currentTrack.sourceUrl" target="_blank" rel="noreferrer">
        {{ language === 'zh' ? '原始来源' : 'Source' }}
      </a>
      <a v-if="currentTrack.licenseUrl" class="card-link ghost" :href="currentTrack.licenseUrl" target="_blank" rel="noreferrer">
        {{ language === 'zh' ? '授权说明' : 'License' }}
      </a>
      <span class="license-copy">{{ currentTrack.licenseLabel }}</span>
    </div>
  </section>
</template>

<style scoped>
.background-player {
  display: grid;
  gap: 0.85rem;
  width: min(26rem, calc(100vw - 2rem));
  padding: 0.95rem 1rem;
  background:
    linear-gradient(180deg, rgba(9, 14, 20, 0.94), rgba(9, 14, 20, 0.8)),
    radial-gradient(circle at top right, rgba(201, 143, 88, 0.12), transparent 42%);
  border: 1px solid rgba(239, 228, 208, 0.12);
  box-shadow: var(--atlas-shadow);
  backdrop-filter: blur(18px);
}

.eyebrow {
  margin: 0;
  color: var(--atlas-accent);
  font-size: 0.72rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.player-copy {
  display: grid;
  gap: 0.45rem;
}

.player-title-row {
  display: flex;
  gap: 0.8rem;
  align-items: start;
  justify-content: space-between;
}

.player-title-row h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
  font-size: 1.22rem;
  line-height: 1.1;
}

.status-pill {
  flex: none;
  padding: 0.2rem 0.48rem;
  border: 1px solid rgba(239, 228, 208, 0.12);
  color: rgba(239, 228, 208, 0.78);
  font-size: 0.72rem;
  text-transform: uppercase;
}

.track-meta,
.player-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
}

.track-meta,
.track-note,
.player-notice,
.license-copy {
  margin: 0;
  color: var(--atlas-muted);
  line-height: 1.5;
}

.track-meta {
  font-size: 0.8rem;
}

.player-notice {
  color: rgba(239, 228, 208, 0.82);
}

.player-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
}

.player-button {
  padding: 0.66rem 0.9rem;
  border: 1px solid rgba(239, 228, 208, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: var(--atlas-text);
  cursor: pointer;
}

.player-button.primary {
  border-color: rgba(201, 143, 88, 0.34);
  background: rgba(201, 143, 88, 0.14);
}

.player-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.volume-control {
  display: grid;
  gap: 0.2rem;
  margin-left: auto;
  min-width: 7.5rem;
  color: rgba(239, 228, 208, 0.68);
  font-size: 0.8rem;
}

.volume-control input {
  width: 100%;
}

.card-link {
  width: fit-content;
  color: var(--atlas-text);
  text-decoration: none;
  border-bottom: 1px solid rgba(239, 228, 208, 0.22);
}

.card-link.ghost {
  color: rgba(239, 228, 208, 0.68);
}

@media (max-width: 760px) {
  .background-player {
    width: 100%;
    padding: 0.85rem 0.9rem;
  }

  .player-title-row {
    display: grid;
    gap: 0.5rem;
  }

  .volume-control {
    margin-left: 0;
    width: 100%;
  }
}
</style>
