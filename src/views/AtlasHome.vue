<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import BackgroundMusicPlayer from '@/components/BackgroundMusicPlayer.vue'
import { navigateTo } from '@/router'
import { useAtlasState } from '@/composables/useAtlasState'
import { getPlayableBackgroundTracks } from '@/data/backgroundTracks'
import {
  getArtistRole,
  getArtistWorkNote,
  getChapterSummary,
  getChapterTitle,
  getCountryName,
  getEventDescription,
  getEventTitle,
  getFeaturedArtistsForContext,
  getChapterForYear,
} from '@/lib/atlas'
import type { BackgroundAudioStateDetail } from '@/lib/audioBus'
import type { ArtistMarker } from '@/data/atlasMarkers'
import { YEAR_MAX, YEAR_MIN, type ChapterEvidencePoint, type ChapterScene, type HistoricEvent, type LayerKey, type RelatedSong } from '@/data/ww2MusicAtlas'

const GlobeStage = defineAsyncComponent(() => import('@/components/GlobeStage.vue'))
const atlas = useAtlasState()
const isMobile = useMediaQuery('(max-width: 760px)')
const showEvidenceModal = ref(false)
const processChapter = ref<ChapterScene | null>(null)
const processEventId = ref<string | null>(null)
const previewEventId = ref<string | null>(null)
const hoveredEventId = ref<string | null>(null)
const soundtrackState = ref<BackgroundAudioStateDetail>({
  trackId: null,
  countryId: null,
  isPlaying: false,
  sourceAudioActive: false,
  blocked: false,
})

let previewClearTimer: number | null = null

const backgroundTracks = getPlayableBackgroundTracks()
const layers: LayerKey[] = ['styles', 'events', 'influence']
const soundtrackEventByTrackId: Record<string, string> = {
  'marines-hymn-usmc-band': 'pearl-harbor',
  'british-grenadiers': 'europe-war',
  'la-marseillaise': 'liberation-paris',
  'farewell-of-slavianka': 'barbarossa',
}

const evidenceArtists = computed(() =>
  getFeaturedArtistsForContext({
    activeEvent: atlas.activeEvent.value,
    countryDetails: atlas.countryDetails.value,
    activeYear: atlas.activeYear.value,
    limit: 5,
  }),
)

const activeProcessChapter = computed(() => processChapter.value ?? atlas.activeChapter.value)
const processEvents = computed(() =>
  activeProcessChapter.value.focusEventIds
    .map((eventId) => atlas.historicEvents.find((event) => event.id === eventId))
    .filter((event): event is NonNullable<typeof event> => Boolean(event)),
)
const processEvent = computed(() => findEvent(processEventId.value))
const previewEvent = computed(() => findEvent(previewEventId.value))
const previewChapter = computed(() => (previewEvent.value ? getChapterForEvent(previewEvent.value.id) : null))
const timelineProgress = computed(() => `${((atlas.activeYear.value - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100}%`)
const playheadEvent = computed(() => {
  const selectedExactEvent = atlas.historicEvents.find((event) =>
    event.year === atlas.activeYear.value &&
    event.affectedCountryIds.some((countryId) => atlas.selectedCountryIds.value.includes(countryId)),
  )

  if (selectedExactEvent) {
    return selectedExactEvent
  }

  const exactEvent = atlas.historicEvents.find((event) => event.year === atlas.activeYear.value)
  if (exactEvent) {
    return exactEvent
  }

  return [...atlas.historicEvents]
    .filter((event) => event.year <= atlas.activeYear.value)
    .sort((left, right) => right.year - left.year)[0] ?? atlas.historicEvents[0] ?? null
})
const soundtrackTrack = computed(() =>
  backgroundTracks.find((track) => track.id === soundtrackState.value.trackId) ?? null,
)
const soundtrackCountry = computed(() => {
  const countryId = soundtrackTrack.value?.countryId ?? soundtrackState.value.countryId
  return countryId ? atlas.countries.find((country) => country.id === countryId) ?? null : null
})
const soundtrackEvent = computed(() => {
  if (!soundtrackTrack.value && !soundtrackState.value.countryId) {
    return null
  }

  const mappedEvent = soundtrackTrack.value ? findEvent(soundtrackEventByTrackId[soundtrackTrack.value.id] ?? null) : null
  return mappedEvent ?? findNearestCountryEvent(soundtrackState.value.countryId)
})
const linkedEventId = computed(() =>
  previewEventId.value ??
  hoveredEventId.value ??
  (atlas.isPlaying.value ? playheadEvent.value?.id ?? null : null) ??
  (soundtrackState.value.isPlaying ? soundtrackEvent.value?.id ?? null : null) ??
  atlas.selectedEventId.value,
)
const linkedEvent = computed(() => findEvent(linkedEventId.value))

function findEvent(eventId: string | null) {
  if (!eventId) {
    return null
  }

  return atlas.historicEvents.find((event) => event.id === eventId) ?? null
}

function getChapterForEvent(eventId: string) {
  const event = findEvent(eventId)
  const linkedChapter = atlas.chapterScenes.find((chapter) => chapter.focusEventIds.includes(eventId))

  return linkedChapter ?? (event ? getChapterForYear(atlas.chapterScenes, event.year) : atlas.activeChapter.value)
}

function findNearestCountryEvent(countryId: string | null | undefined) {
  if (!countryId) {
    return null
  }

  return [...atlas.historicEvents]
    .filter((event) => event.affectedCountryIds.includes(countryId))
    .sort((left, right) => Math.abs(left.year - atlas.activeYear.value) - Math.abs(right.year - atlas.activeYear.value))[0] ?? null
}

function openEventPage(eventId: string) {
  showEvidenceModal.value = false
  atlas.selectEvent(eventId)
  navigateTo({
    path: '/events',
    query: {
      year: atlas.activeYear.value,
      event: eventId,
      countries: atlas.selectedCountryIds.value.join(','),
      lang: atlas.language.value,
    },
  })
}

function openProcess(chapter = atlas.activeChapter.value, eventId: string | null = null) {
  processChapter.value = chapter
  processEventId.value = eventId
  showEvidenceModal.value = true
  previewEventId.value = null
}

function openProcessForEvent(eventId: string) {
  atlas.selectEvent(eventId)
  openProcess(getChapterForEvent(eventId), eventId)
}

function closeProcessModal() {
  showEvidenceModal.value = false
}

function handlePreviewEvent(eventId: string | null) {
  if (previewClearTimer) {
    window.clearTimeout(previewClearTimer)
    previewClearTimer = null
  }

  if (eventId) {
    previewEventId.value = eventId
    return
  }

  previewClearTimer = window.setTimeout(() => {
    previewEventId.value = null
    previewClearTimer = null
  }, 180)
}

function handleRailPreview(eventId: string | null) {
  hoveredEventId.value = eventId
  handlePreviewEvent(eventId)
}

function handleBackgroundStateChange(detail: BackgroundAudioStateDetail) {
  soundtrackState.value = detail
}

function focusSoundtrackEvent() {
  if (!soundtrackEvent.value) {
    return
  }

  atlas.selectEvent(soundtrackEvent.value.id)
  handlePreviewEvent(soundtrackEvent.value.id)
}

function keepPreviewOpen() {
  if (previewClearTimer) {
    window.clearTimeout(previewClearTimer)
    previewClearTimer = null
  }
}

function isActiveEvent(event: HistoricEvent) {
  return event.id === atlas.selectedEventId.value
}

function isCurrentYearEvent(event: HistoricEvent) {
  return event.year === atlas.activeYear.value
}

function isLinkedEvent(event: HistoricEvent) {
  return event.id === linkedEventId.value
}

function openArtist(artistId: string) {
  atlas.selectArtist(artistId)
}

function getPrimaryWorkLine(artist: ArtistMarker) {
  const work = artist.representativeWorks[0]
  if (!work) {
    return ''
  }

  return `${work.title} · ${getArtistWorkNote(work, atlas.language.value)}`
}

function getChapterDetail(chapter: ChapterScene) {
  return atlas.language.value === 'zh' ? chapter.detailZh : chapter.detailEn
}

function getEvidenceLabel(point: ChapterEvidencePoint) {
  return atlas.language.value === 'zh' ? point.labelZh : point.labelEn
}

function getEvidenceTitle(point: ChapterEvidencePoint) {
  return atlas.language.value === 'zh' ? point.titleZh : point.titleEn
}

function getEvidenceBody(point: ChapterEvidencePoint) {
  return atlas.language.value === 'zh' ? point.bodyZh : point.bodyEn
}

function getEventLongDescription(event: HistoricEvent) {
  return atlas.language.value === 'zh'
    ? event.longDescriptionZh ?? event.descriptionZh
    : event.longDescriptionEn ?? event.descriptionEn
}

function getEventMusicImpact(event: HistoricEvent) {
  return atlas.language.value === 'zh' ? event.musicImpactZh : event.musicImpactEn
}

function getEventImageAlt(event: HistoricEvent) {
  if (!event.image) {
    return ''
  }

  return atlas.language.value === 'zh' ? event.image.altZh : event.image.altEn
}

function getEventCountryLine(event: HistoricEvent) {
  return event.affectedCountryIds
    .map((countryId) => atlas.countries.find((country) => country.id === countryId))
    .filter((country): country is NonNullable<typeof country> => Boolean(country))
    .map((country) => getCountryName(country, atlas.language.value))
    .join(' / ')
}

function getSongNote(song: RelatedSong) {
  return atlas.language.value === 'zh' ? song.noteZh : song.noteEn
}

onBeforeUnmount(() => {
  if (previewClearTimer) {
    window.clearTimeout(previewClearTimer)
  }
})
</script>

<template>
  <main class="home-page">
    <section class="home-hero" aria-label="3D globe atlas">
      <div class="hero-stage">
        <Suspense>
          <GlobeStage
            chrome="minimal"
            :active-year="atlas.activeYear.value"
            :countries="atlas.countries"
            :enabled-layers="atlas.enabledLayers.value"
            :events="atlas.historicEvents"
            :focus-pose="atlas.focusPose.value"
            :highlighted-event-id="linkedEventId"
            :language="atlas.language.value"
            :selected-artist-id="atlas.selectedArtistId.value"
            :selected-country-ids="atlas.selectedCountryIds.value"
            :timeline-playing="atlas.isPlaying.value"
            @preview-event="handlePreviewEvent"
            @select-artist="openArtist"
            @select-country="atlas.toggleCountry"
            @select-event="openProcessForEvent"
          />
          <template #fallback>
            <div class="stage-loading">{{ atlas.language.value === 'zh' ? '正在载入地球舞台' : 'Loading globe stage' }}</div>
          </template>
        </Suspense>
      </div>

      <aside class="story-panel" data-testid="home-story-panel">
        <p class="kicker">{{ atlas.language.value === 'zh' ? '高中生 AI 学习项目' : 'HIGH SCHOOL AI STUDY PROJECT' }}</p>
        <h1>{{ atlas.language.value === 'zh' ? '我用 AI 做的二战音乐地图' : 'My AI Study Map of WWII Music' }}</h1>
        <p class="lead">
          {{
            atlas.language.value === 'zh'
              ? '用 AI 梳理 1931–1949 年的事件、歌曲与音乐家，再逐条核对来源——看战争年代的人为什么唱这些歌。'
              : 'Using AI to map the events, songs, and musicians of 1931–1949, then checking each source — why people sang these songs during the war.'
          }}
        </p>

        <div class="panel-tools">
          <button type="button" class="play-button" data-testid="timeline-play" @click="atlas.togglePlay">
            <span class="play-glyph" aria-hidden="true">{{ atlas.isPlaying.value ? '❙❙' : '▶' }}</span>
            {{ atlas.isPlaying.value ? (atlas.language.value === 'zh' ? '暂停' : 'Pause') : atlas.language.value === 'zh' ? '播放' : 'Play' }}
          </button>
          <label>
            <span>{{ atlas.activeYear.value }}</span>
            <input
              data-testid="timeline-range"
              type="range"
              :min="YEAR_MIN"
              :max="YEAR_MAX"
              :value="atlas.activeYear.value"
              @input="atlas.setYear(Number(($event.target as HTMLInputElement).value))"
            >
          </label>
        </div>

        <div class="sync-bridge" data-testid="home-sync-bridge">
          <span class="sync-line" :style="{ '--sync-progress': timelineProgress }" />
          <p>{{ atlas.isPlaying.value ? (atlas.language.value === 'zh' ? '动画播放中' : 'Playback running') : (atlas.language.value === 'zh' ? '当前聚焦' : 'Current focus') }}</p>
          <strong v-if="linkedEvent">{{ linkedEvent.year }} · {{ getEventTitle(linkedEvent, atlas.language.value) }}</strong>
          <strong v-else>{{ atlas.activeYear.value }}</strong>
          <small v-if="soundtrackTrack">
            {{ atlas.language.value === 'zh' ? '音乐线索' : 'Sound cue' }} ·
            {{ atlas.language.value === 'zh' ? soundtrackTrack.titleZh : soundtrackTrack.titleEn }}
          </small>
        </div>

        <div class="layer-row" aria-label="Globe layers">
          <button
            v-for="layer in layers"
            :key="layer"
            type="button"
            :class="{ active: atlas.enabledLayers.value.includes(layer) }"
            @click="atlas.toggleLayer(layer)"
          >
            {{
              layer === 'styles'
                ? atlas.language.value === 'zh' ? '风格' : 'Styles'
                : layer === 'events'
                  ? atlas.language.value === 'zh' ? '事件' : 'Events'
                  : atlas.language.value === 'zh' ? '影响' : 'Influence'
            }}
          </button>
        </div>
      </aside>

      <aside
        v-if="previewEvent && previewChapter"
        class="event-preview"
        data-testid="event-preview"
        @pointerenter="keepPreviewOpen"
        @pointerleave="handlePreviewEvent(null)"
        @focusin="keepPreviewOpen"
        @focusout="handlePreviewEvent(null)"
      >
        <p class="kicker">{{ previewEvent.year }}</p>
        <h2>{{ getEventTitle(previewEvent, atlas.language.value) }}</h2>
        <p>{{ getChapterSummary(previewChapter, atlas.language.value) }}</p>
        <button
          type="button"
          class="preview-open-button"
          @pointerenter="keepPreviewOpen"
          @pointerleave="handlePreviewEvent(null)"
          @focus="keepPreviewOpen"
          @blur="handlePreviewEvent(null)"
          @click="openProcessForEvent(previewEvent.id)"
        >
          {{ atlas.language.value === 'zh' ? '展开发展过程' : 'View process' }}
        </button>
      </aside>

      <div class="scroll-cue" aria-hidden="true">
        <span>{{ atlas.language.value === 'zh' ? '向下浏览' : 'Scroll' }}</span>
        <i>↓</i>
      </div>
    </section>

    <section class="band events-section" data-testid="home-event-rail" aria-label="Key event timeline">
      <header v-reveal class="section-head">
        <p class="kicker">{{ atlas.language.value === 'zh' ? '关键事件时间轴' : 'Key Event Timeline' }}</p>
        <h2>{{ atlas.language.value === 'zh' ? '重大事件' : 'Key Events' }}</h2>
      </header>
      <div class="events-timeline">
        <button
          v-for="event in atlas.historicEvents"
          :key="event.id"
          v-reveal
          type="button"
          class="event-card"
          :class="{
            active: isActiveEvent(event),
            current: isCurrentYearEvent(event),
            linked: isLinkedEvent(event),
          }"
          @blur="handleRailPreview(null)"
          @click="openProcessForEvent(event.id)"
          @focus="handleRailPreview(event.id)"
          @pointerenter="handleRailPreview(event.id)"
          @pointerleave="handleRailPreview(null)"
        >
          <span class="event-card__year">{{ event.year }}</span>
          <span class="event-card__node" aria-hidden="true" />
          <span class="event-card__body">
            <strong>{{ getEventTitle(event, atlas.language.value) }}</strong>
            <small>{{ getEventDescription(event, atlas.language.value) }}</small>
          </span>
        </button>
      </div>
    </section>

    <section class="band process-section" data-testid="home-connection-chain" aria-label="Development process">
      <header v-reveal class="section-head">
        <p class="kicker">{{ atlas.language.value === 'zh' ? '发展过程' : 'Development Process' }}</p>
        <h2>{{ atlas.language.value === 'zh' ? '从事件到声音' : 'From events to sound' }}</h2>
      </header>

      <div class="chapter-row" role="tablist">
        <button
          v-for="(chapter, index) in atlas.chapterScenes"
          :key="chapter.id"
          v-reveal="index * 60"
          type="button"
          :class="{ active: chapter.id === atlas.activeChapter.value.id }"
          @click="atlas.jumpChapter(chapter.id)"
        >
          <em>{{ String(index + 1).padStart(2, '0') }}</em>
          <span>{{ getChapterTitle(chapter, atlas.language.value) }}</span>
          <small>{{ chapter.yearRange[0] }}–{{ chapter.yearRange[1] }}</small>
        </button>
      </div>

      <p v-reveal class="chapter-detail">{{ getChapterDetail(atlas.activeChapter.value) }}</p>

      <div class="chain-steps">
        <article v-for="(point, index) in atlas.activeChapter.value.evidencePoints" :key="point.kind" v-reveal="index * 90">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <small>{{ getEvidenceLabel(point) }}</small>
          <strong>{{ getEvidenceTitle(point) }}</strong>
          <em>{{ getEvidenceBody(point) }}</em>
        </article>
      </div>

      <button
        type="button"
        class="evidence-trigger"
        data-testid="open-evidence-modal"
        @click="openProcess()"
      >
        {{ atlas.language.value === 'zh' ? '展开发展过程' : 'View development process' }}
      </button>
    </section>

    <section class="band artists-section" data-testid="home-artist-dock" aria-label="Linked artists">
      <header v-reveal class="section-head">
        <p class="kicker">{{ atlas.language.value === 'zh' ? '相关音乐家' : 'Linked Artists' }}</p>
        <h2>{{ atlas.language.value === 'zh' ? '谁在唱，谁在写' : 'Who sang, who wrote' }}</h2>
      </header>
      <div class="artist-grid">
        <button
          v-for="(artist, index) in evidenceArtists"
          :key="artist.id"
          v-reveal="index * 60"
          type="button"
          :class="{ active: artist.id === atlas.selectedArtistId.value }"
          @click="openArtist(artist.id)"
        >
          <img :src="artist.portrait.src" :alt="atlas.language.value === 'zh' ? artist.portrait.altZh : artist.portrait.altEn">
          <span>
            <strong>{{ atlas.language.value === 'zh' ? artist.nameZh : artist.nameEn }}</strong>
            <small>{{ getArtistRole(artist, atlas.language.value) }}</small>
            <em>{{ getPrimaryWorkLine(artist) }}</em>
          </span>
        </button>
      </div>
    </section>

    <section class="band sound-section" data-testid="home-sound-sync" aria-label="Soundtrack link">
      <header v-reveal class="section-head">
        <p class="kicker">{{ atlas.language.value === 'zh' ? '声音' : 'Soundtrack' }}</p>
        <h2>{{ atlas.language.value === 'zh' ? '让画面听得见' : 'Hear the map' }}</h2>
      </header>
      <div v-reveal class="sound-layout">
        <BackgroundMusicPlayer
          v-if="!isMobile"
          :language="atlas.language.value"
          :tracks="backgroundTracks"
          @state-change="handleBackgroundStateChange"
        />
        <div v-if="soundtrackTrack && soundtrackEvent" class="sound-bridge">
          <p class="kicker">{{ atlas.language.value === 'zh' ? '声画联动' : 'Sound Link' }}</p>
          <strong>{{ atlas.language.value === 'zh' ? soundtrackTrack.titleZh : soundtrackTrack.titleEn }}</strong>
          <span>
            <template v-if="soundtrackCountry">{{ getCountryName(soundtrackCountry, atlas.language.value) }} · </template>
            {{ soundtrackEvent.year }} {{ getEventTitle(soundtrackEvent, atlas.language.value) }}
          </span>
          <button type="button" data-testid="soundtrack-focus-event" @click="focusSoundtrackEvent">
            {{ atlas.language.value === 'zh' ? '定位事件' : 'Focus event' }}
          </button>
        </div>
        <p v-else class="sound-hint">
          {{ atlas.language.value === 'zh' ? '播放背景曲目后，这里会显示对应的历史事件。' : 'Play a background track and the matching historic event appears here.' }}
        </p>
      </div>
    </section>

    <div
      v-if="showEvidenceModal"
      class="evidence-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="atlas.language.value === 'zh' ? '章节发展过程详情' : 'Chapter development process details'"
      data-testid="evidence-modal"
    >
      <div class="evidence-backdrop" @click="closeProcessModal" />
      <section class="evidence-card">
        <header class="evidence-head">
          <figure>
            <img
              :src="activeProcessChapter.thumbnail.src"
              :alt="atlas.language.value === 'zh' ? activeProcessChapter.thumbnail.altZh : activeProcessChapter.thumbnail.altEn"
            >
          </figure>
          <div>
            <p class="kicker">{{ activeProcessChapter.yearRange[0] }}-{{ activeProcessChapter.yearRange[1] }}</p>
            <h2>{{ getChapterTitle(activeProcessChapter, atlas.language.value) }}</h2>
            <p>{{ getChapterDetail(activeProcessChapter) }}</p>
            <p v-if="processEvent" class="focused-event-line">
              {{ getEventTitle(processEvent, atlas.language.value) }}
            </p>
          </div>
          <button class="evidence-close" type="button" @click="closeProcessModal">
            {{ atlas.language.value === 'zh' ? '关闭' : 'Close' }}
          </button>
        </header>

        <div class="evidence-section">
          <p class="kicker">{{ atlas.language.value === 'zh' ? '阅读路径' : 'Reading Path' }}</p>
          <div class="modal-evidence-grid">
            <article v-for="point in activeProcessChapter.evidencePoints" :key="`modal-${point.kind}`">
              <small>{{ getEvidenceLabel(point) }}</small>
              <strong>{{ getEvidenceTitle(point) }}</strong>
              <p>{{ getEvidenceBody(point) }}</p>
            </article>
          </div>
        </div>

        <div class="evidence-section">
          <p class="kicker">{{ atlas.language.value === 'zh' ? '关联事件与声音证据' : 'Linked Events and Sound Evidence' }}</p>
          <div class="modal-event-list">
            <article
              v-for="event in processEvents"
              :key="`modal-${event.id}`"
              :class="{ focused: processEvent?.id === event.id }"
            >
              <img v-if="event.image" :src="event.image.src" :alt="getEventImageAlt(event)" loading="lazy">
              <div class="modal-event-copy">
                <div class="modal-event-meta">
                  <span>{{ event.year }}</span>
                  <small>{{ getEventCountryLine(event) }}</small>
                </div>
                <h3>{{ getEventTitle(event, atlas.language.value) }}</h3>
                <p>{{ getEventLongDescription(event) }}</p>
                <p v-if="getEventMusicImpact(event)" class="music-impact">{{ getEventMusicImpact(event) }}</p>
                <div v-if="event.relatedSongs?.length" class="song-evidence-list">
                  <span v-for="song in event.relatedSongs.slice(0, 3)" :key="`${event.id}-${song.title}`">
                    <strong>{{ song.title }}</strong>
                    <small>{{ song.performer }} · {{ song.year }}</small>
                    <em>{{ getSongNote(song) }}</em>
                  </span>
                </div>
                <button type="button" class="event-open-button" @click="openEventPage(event.id)">
                  {{ atlas.language.value === 'zh' ? '进入事件页' : 'Open event page' }}
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.home-page {
  position: relative;
  min-height: 100svh;
  overflow-x: hidden;
  background: #000000;
}

/* ---------- Hero ---------- */
.home-hero {
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  overflow: hidden;
}

.hero-stage {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.stage-loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--atlas-muted);
}

.story-panel {
  position: absolute;
  top: 6.4rem;
  left: clamp(1rem, 4vw, 3rem);
  z-index: 3;
  width: min(22rem, calc(100vw - 2rem));
  display: grid;
  gap: 0.9rem;
  padding: 1.6rem 1.5rem;
  background: rgba(22, 22, 24, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--atlas-radius);
  backdrop-filter: saturate(180%) blur(30px);
  -webkit-backdrop-filter: saturate(180%) blur(30px);
  box-shadow: var(--atlas-shadow);
}

.kicker {
  margin: 0;
  color: var(--atlas-accent);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

h1 {
  margin: 0;
  font-size: clamp(1.6rem, 2vw, 2.1rem);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
}

.lead {
  margin: 0;
  color: var(--atlas-muted);
  font-size: 0.92rem;
  line-height: 1.5;
}

.panel-tools {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.9rem;
  align-items: center;
  margin-top: 0.2rem;
}

.play-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.15rem;
  border: 0;
  border-radius: 980px;
  background: var(--atlas-accent);
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: background 200ms ease;
}

.play-button:hover {
  background: #4aa3ff;
}

.play-glyph {
  font-size: 0.7rem;
}

.panel-tools label {
  display: grid;
  gap: 0.35rem;
}

.panel-tools label span {
  font-size: 1.4rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.sync-bridge {
  position: relative;
  display: grid;
  gap: 0.24rem;
  padding: 0.85rem 0.9rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
}

.sync-line {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--sync-progress);
  height: 2px;
  background: linear-gradient(90deg, rgba(41, 151, 255, 0.35), rgba(124, 192, 255, 0.92));
  transition: width 320ms ease;
}

.sync-bridge p,
.sync-bridge strong,
.sync-bridge small {
  position: relative;
  margin: 0;
}

.sync-bridge p {
  color: var(--atlas-accent);
  font-size: 0.68rem;
  font-weight: 600;
}

.sync-bridge strong {
  font-size: 0.9rem;
  line-height: 1.28;
  overflow-wrap: anywhere;
}

.sync-bridge small {
  color: var(--atlas-faint);
  font-size: 0.74rem;
  line-height: 1.35;
}

.layer-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.layer-row button {
  padding: 0.4rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 980px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--atlas-muted);
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 200ms ease, color 200ms ease, border-color 200ms ease;
}

.layer-row button:hover {
  color: var(--atlas-text);
}

.layer-row button.active {
  color: #fff;
  background: var(--atlas-accent-soft);
  border-color: rgba(41, 151, 255, 0.5);
}

.event-preview {
  position: absolute;
  right: clamp(1rem, 4vw, 3rem);
  bottom: 3.2rem;
  z-index: 3;
  width: min(21rem, calc(100vw - 2rem));
  display: grid;
  gap: 0.6rem;
  padding: 1.3rem 1.25rem;
  background: rgba(22, 22, 24, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--atlas-radius);
  backdrop-filter: saturate(180%) blur(30px);
  -webkit-backdrop-filter: saturate(180%) blur(30px);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.event-preview h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.event-preview p {
  margin: 0;
  color: var(--atlas-muted);
  font-size: 0.86rem;
  line-height: 1.5;
}

.preview-open-button {
  justify-self: start;
  padding: 0.5rem 1.1rem;
  border: 1px solid rgba(41, 151, 255, 0.4);
  border-radius: 980px;
  background: var(--atlas-accent-soft);
  color: var(--atlas-text);
  cursor: pointer;
  pointer-events: auto;
}

.scroll-cue {
  position: absolute;
  left: 50%;
  bottom: 1.5rem;
  z-index: 2;
  display: grid;
  justify-items: center;
  gap: 0.3rem;
  transform: translateX(-50%);
  color: var(--atlas-faint);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  pointer-events: none;
}

.scroll-cue i {
  font-style: normal;
  animation: cue-bounce 1.8s ease-in-out infinite;
}

@keyframes cue-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50% { transform: translateY(4px); opacity: 1; }
}

/* ---------- Scroll bands ---------- */
.band {
  position: relative;
  z-index: 1;
  max-width: 72rem;
  margin: 0 auto;
  padding: clamp(4rem, 9vh, 7rem) clamp(1.2rem, 5vw, 3rem);
}

.section-head {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 2.4rem;
}

.section-head h2 {
  margin: 0;
  font-size: clamp(1.8rem, 3.4vw, 2.9rem);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.02em;
}

/* Events timeline */
.events-timeline {
  position: relative;
  display: grid;
  gap: 0.7rem;
  max-width: 44rem;
  margin: 0 auto;
  padding-left: 1.4rem;
}

.events-timeline::before {
  content: '';
  position: absolute;
  top: 0.6rem;
  bottom: 0.6rem;
  left: 0.32rem;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.16), transparent);
}

.event-card {
  position: relative;
  display: grid;
  grid-template-columns: 3.6rem minmax(0, 1fr);
  gap: 0.2rem 1rem;
  align-items: baseline;
  padding: 1.1rem 1.3rem;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--atlas-text);
  text-align: left;
  cursor: pointer;
  transition: background 220ms ease, border-color 220ms ease, transform 220ms ease;
}

.event-card:hover,
.event-card:focus-visible,
.event-card.active,
.event-card.linked {
  background: rgba(41, 151, 255, 0.1);
  border-color: rgba(41, 151, 255, 0.42);
  transform: translateX(2px);
}

.event-card__node {
  position: absolute;
  left: -1.48rem;
  top: 1.5rem;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05);
}

.event-card.active .event-card__node,
.event-card.linked .event-card__node,
.event-card.current .event-card__node {
  background: var(--atlas-accent);
  box-shadow: 0 0 0 4px rgba(41, 151, 255, 0.2);
}

.event-card__year {
  color: var(--atlas-accent);
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.event-card__body {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
}

.event-card__body strong {
  font-size: 1.02rem;
  font-weight: 600;
  line-height: 1.25;
}

.event-card__body small {
  color: var(--atlas-muted);
  font-size: 0.86rem;
  line-height: 1.5;
}

/* Process / chapters */
.chapter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1.6rem;
}

.chapter-row button {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-auto-rows: auto;
  gap: 0.05rem 0.6rem;
  padding: 0.7rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--atlas-text);
  text-align: left;
  cursor: pointer;
  transition: background 200ms ease, border-color 200ms ease;
}

.chapter-row button:hover {
  background: rgba(255, 255, 255, 0.07);
}

.chapter-row button.active {
  background: var(--atlas-accent-soft);
  border-color: rgba(41, 151, 255, 0.5);
}

.chapter-row em {
  grid-row: span 2;
  align-self: center;
  color: var(--atlas-accent);
  font-size: 1.1rem;
  font-weight: 600;
  font-style: normal;
}

.chapter-row span {
  font-size: 0.92rem;
  font-weight: 500;
}

.chapter-row small {
  color: var(--atlas-faint);
  font-size: 0.74rem;
}

.chapter-detail {
  max-width: 46rem;
  margin: 0 0 2rem;
  color: var(--atlas-muted);
  font-size: 1.02rem;
  line-height: 1.6;
}

.chain-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.chain-steps article {
  display: grid;
  gap: 0.35rem;
  padding: 1.3rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
}

.chain-steps span {
  color: var(--atlas-accent);
  font-size: 0.9rem;
  font-weight: 600;
}

.chain-steps small {
  color: var(--atlas-faint);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.chain-steps strong {
  font-size: 1.02rem;
  font-weight: 600;
  line-height: 1.3;
}

.chain-steps em {
  color: var(--atlas-muted);
  font-size: 0.88rem;
  font-style: normal;
  line-height: 1.5;
}

.evidence-trigger {
  justify-self: start;
  margin-top: 1.8rem;
  padding: 0.8rem 1.6rem;
  border: 0;
  border-radius: 980px;
  background: var(--atlas-accent);
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: background 200ms ease;
}

.evidence-trigger:hover {
  background: #4aa3ff;
}

/* Artists */
.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
}

.artist-grid button {
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr);
  gap: 0.9rem;
  align-items: start;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--atlas-text);
  text-align: left;
  cursor: pointer;
  transition: background 200ms ease, border-color 200ms ease;
}

.artist-grid button:hover,
.artist-grid button.active {
  background: rgba(41, 151, 255, 0.1);
  border-color: rgba(41, 151, 255, 0.42);
}

.artist-grid img {
  width: 4rem;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.artist-grid span {
  display: grid;
  gap: 0.28rem;
  min-width: 0;
}

.artist-grid strong {
  font-size: 0.98rem;
  font-weight: 600;
}

.artist-grid small {
  color: var(--atlas-accent);
  font-size: 0.78rem;
}

.artist-grid em {
  display: -webkit-box;
  overflow: hidden;
  color: var(--atlas-muted);
  font-size: 0.82rem;
  font-style: normal;
  line-height: 1.45;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* Sound */
.sound-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 1.2rem;
  align-items: stretch;
}

.sound-bridge {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.3rem 0.8rem;
  align-content: center;
  padding: 1.4rem 1.4rem;
  border: 1px solid rgba(41, 151, 255, 0.24);
  border-radius: var(--atlas-radius);
  background: rgba(22, 22, 24, 0.6);
}

.sound-bridge .kicker {
  grid-column: 1 / -1;
}

.sound-bridge strong {
  grid-column: 1;
  font-size: 1.05rem;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.sound-bridge span {
  grid-column: 1;
  color: var(--atlas-muted);
  font-size: 0.82rem;
  line-height: 1.4;
}

.sound-bridge button {
  grid-column: 2;
  grid-row: 2 / span 2;
  align-self: center;
  padding: 0.5rem 1.1rem;
  border: 1px solid rgba(41, 151, 255, 0.4);
  border-radius: 980px;
  background: var(--atlas-accent-soft);
  color: var(--atlas-text);
  cursor: pointer;
  transition: background 200ms ease;
}

.sound-bridge button:hover {
  background: rgba(41, 151, 255, 0.28);
}

.sound-hint {
  display: grid;
  align-content: center;
  margin: 0;
  padding: 1.4rem;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  border-radius: var(--atlas-radius);
  color: var(--atlas-faint);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* ---------- Modal ---------- */
.evidence-modal {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.evidence-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
}

.evidence-card {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1.4rem;
  width: min(70rem, calc(100vw - 2rem));
  max-height: min(84svh, 58rem);
  overflow: auto;
  padding: 1.75rem;
  background: rgba(28, 28, 30, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--atlas-radius);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.6);
}

.evidence-head {
  display: grid;
  grid-template-columns: minmax(12rem, 22rem) minmax(0, 1fr) auto;
  gap: 1.2rem;
  align-items: start;
}

.evidence-head figure {
  margin: 0;
}

.evidence-head img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.evidence-head h2 {
  margin: 0.3rem 0;
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.evidence-head p {
  margin: 0.4rem 0 0;
  color: var(--atlas-muted);
  line-height: 1.6;
}

.focused-event-line {
  width: fit-content;
  margin-top: 0.7rem !important;
  padding: 0.36rem 0.7rem;
  border-radius: 980px;
  background: rgba(41, 151, 255, 0.12);
  border: 1px solid rgba(41, 151, 255, 0.28);
  color: var(--atlas-text) !important;
}

.evidence-close {
  height: fit-content;
  padding: 0.5rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 980px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--atlas-text);
  cursor: pointer;
}

.evidence-section {
  display: grid;
  gap: 0.9rem;
  padding-top: 1.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-evidence-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.modal-evidence-grid article,
.modal-event-list article {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
}

.modal-evidence-grid article {
  display: grid;
  gap: 0.4rem;
  padding: 1rem;
}

.modal-evidence-grid small,
.modal-event-meta,
.song-evidence-list small,
.song-evidence-list em {
  color: var(--atlas-faint);
}

.modal-evidence-grid strong,
.modal-event-list h3,
.song-evidence-list strong {
  font-weight: 600;
}

.modal-evidence-grid p,
.modal-event-list p,
.song-evidence-list em {
  margin: 0;
  color: var(--atlas-muted);
  line-height: 1.55;
}

.modal-event-list {
  display: grid;
  gap: 0.9rem;
}

.modal-event-list article {
  display: grid;
  grid-template-columns: minmax(12rem, 18rem) minmax(0, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.modal-event-list article.focused {
  border-color: rgba(41, 151, 255, 0.42);
  background: rgba(41, 151, 255, 0.08);
}

.modal-event-list img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-event-copy {
  display: grid;
  gap: 0.55rem;
  align-content: start;
}

.modal-event-copy h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.modal-event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
  font-size: 0.8rem;
}

.modal-event-meta span {
  color: var(--atlas-accent);
  font-size: 1.1rem;
  font-weight: 600;
}

.music-impact {
  padding: 0.75rem 0.9rem;
  border-left: 2px solid rgba(41, 151, 255, 0.5);
  border-radius: 0 10px 10px 0;
  background: rgba(41, 151, 255, 0.08);
}

.song-evidence-list {
  display: grid;
  gap: 0.4rem;
}

.song-evidence-list span {
  display: grid;
  gap: 0.12rem;
  padding: 0.6rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.song-evidence-list em {
  font-style: normal;
}

.event-open-button {
  justify-self: start;
  padding: 0.55rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 980px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--atlas-text);
  cursor: pointer;
}

/* ---------- Responsive ---------- */
@media (max-width: 1080px) {
  .chain-steps {
    grid-template-columns: 1fr;
  }

  .sound-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .home-hero {
    display: flex;
    flex-direction: column;
    min-height: auto;
    padding-top: 4.5rem;
  }

  .hero-stage {
    position: relative;
    height: clamp(20rem, 52svh, 30rem);
    order: -1;
  }

  .story-panel {
    position: static;
    width: auto;
    margin: 1rem;
    top: auto;
    left: auto;
  }

  .event-preview {
    display: none;
  }

  .scroll-cue {
    display: none;
  }

  .section-head {
    margin-bottom: 1.6rem;
  }

  .events-timeline {
    padding-left: 1.2rem;
  }

  .event-card {
    grid-template-columns: 3rem minmax(0, 1fr);
    padding: 0.95rem 1rem;
  }

  .evidence-head,
  .modal-event-list article {
    grid-template-columns: 1fr;
  }

  .modal-evidence-grid {
    grid-template-columns: 1fr;
  }

  .evidence-close {
    justify-self: start;
  }
}

/* Quiet archive treatment: fewer containers, clearer hierarchy. */
.home-page {
  background: #0b0b0c;
}

.home-hero {
  min-height: min(52rem, 100svh);
  border-bottom: 1px solid var(--atlas-line);
}

.story-panel {
  top: 7rem;
  width: min(25rem, calc(100vw - 2rem));
  gap: 0.8rem;
  padding: 1.2rem 1.25rem 1.25rem;
  background: rgba(11, 11, 12, 0.82);
  border: 0;
  border-left: 2px solid var(--atlas-accent);
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.kicker {
  color: var(--atlas-accent);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  font-size: clamp(1.8rem, 2.4vw, 2.5rem);
  font-weight: 540;
}

.lead {
  max-width: 34rem;
  font-size: 0.88rem;
}

.panel-tools {
  grid-template-columns: auto minmax(8rem, 1fr);
  gap: 0.8rem;
  margin-top: 0;
}

.play-button,
.evidence-trigger {
  border-radius: 6px;
  background: var(--atlas-accent);
  color: #17130d;
  font-size: 0.84rem;
  font-weight: 650;
}

.play-button:hover,
.evidence-trigger:hover {
  background: #e6c995;
}

.panel-tools label span {
  font-size: 1.15rem;
}

.sync-bridge {
  gap: 0.12rem;
  padding: 0.55rem 0;
  border: 0;
  border-top: 1px solid var(--atlas-line);
  border-bottom: 1px solid var(--atlas-line);
  border-radius: 0;
  background: transparent;
}

.sync-line {
  display: none;
}

.sync-bridge p {
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sync-bridge strong {
  font-size: 0.82rem;
}

.layer-row {
  gap: 0.25rem;
}

.layer-row button,
.preview-open-button,
.sound-bridge button,
.event-open-button,
.evidence-close {
  border-radius: 5px;
}

.layer-row button {
  padding: 0.3rem 0.68rem;
  border-color: transparent;
  background: transparent;
  font-size: 0.74rem;
}

.layer-row button.active {
  color: var(--atlas-accent);
  background: var(--atlas-accent-soft);
  border-color: transparent;
}

.event-preview {
  bottom: 2.2rem;
  gap: 0.42rem;
  padding: 1rem 0 1rem 1.1rem;
  background: rgba(11, 11, 12, 0.78);
  border: 0;
  border-left: 1px solid var(--atlas-accent);
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.event-preview h2 {
  font-size: 1.12rem;
}

.event-preview p {
  font-size: 0.8rem;
}

.scroll-cue {
  display: none;
}

.band {
  max-width: var(--page-width);
  padding: clamp(3.25rem, 7vh, 5rem) clamp(1.2rem, 4vw, 3rem);
}

.band + .band {
  border-top: 1px solid rgba(242, 240, 235, 0.07);
}

.section-head {
  gap: 0.35rem;
  margin-bottom: 1.7rem;
}

.section-head h2 {
  font-size: clamp(1.65rem, 3vw, 2.45rem);
  font-weight: 520;
}

.events-timeline {
  max-width: 50rem;
  gap: 0;
  padding-left: 0;
}

.events-timeline::before,
.event-card__node {
  display: none;
}

.event-card {
  grid-template-columns: 4rem minmax(0, 1fr);
  padding: 0.9rem 0;
  border: 0;
  border-bottom: 1px solid var(--atlas-line);
  border-radius: 0;
  background: transparent;
}

.event-card:hover,
.event-card:focus-visible,
.event-card.active,
.event-card.linked {
  padding-left: 0.7rem;
  background: var(--atlas-accent-soft);
  border-color: var(--atlas-line);
  transform: none;
}

.event-card__year {
  color: var(--atlas-accent);
  font-size: 0.9rem;
}

.event-card__body strong {
  font-size: 0.94rem;
}

.event-card__body small {
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.8rem;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.chapter-row {
  gap: 0;
  margin-bottom: 1.4rem;
  border-bottom: 1px solid var(--atlas-line);
}

.chapter-row button {
  gap: 0.02rem 0.45rem;
  padding: 0.65rem 0.8rem;
  border: 0;
  border-bottom: 1px solid transparent;
  border-radius: 0;
  background: transparent;
}

.chapter-row button:hover,
.chapter-row button.active {
  background: transparent;
  border-color: var(--atlas-accent);
}

.chapter-row button.active span,
.chapter-row button.active em {
  color: var(--atlas-accent);
}

.chapter-row em {
  font-size: 0.82rem;
}

.chapter-row span {
  font-size: 0.84rem;
}

.chapter-detail {
  max-width: 52rem;
  margin-bottom: 1.5rem;
  font-size: 0.94rem;
}

.chain-steps {
  gap: 0;
  border-top: 1px solid var(--atlas-line);
}

.chain-steps article {
  gap: 0.3rem;
  padding: 1rem;
  border: 0;
  border-right: 1px solid var(--atlas-line);
  border-radius: 0;
  background: transparent;
}

.chain-steps article:last-child {
  border-right: 0;
}

.artist-grid {
  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  gap: 0 1.5rem;
}

.artist-grid button {
  grid-template-columns: 3.2rem minmax(0, 1fr);
  gap: 0.75rem;
  padding: 0.85rem 0;
  border: 0;
  border-bottom: 1px solid var(--atlas-line);
  border-radius: 0;
  background: transparent;
}

.artist-grid button:hover,
.artist-grid button.active {
  padding-left: 0.55rem;
  background: var(--atlas-accent-soft);
  border-color: var(--atlas-line);
}

.artist-grid img {
  width: 3.2rem;
  border: 0;
  border-radius: 4px;
}

.artist-grid em {
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.sound-layout {
  gap: 1px;
  background: var(--atlas-line);
}

.sound-bridge,
.sound-hint {
  padding: 1rem 1.1rem;
  border: 0;
  border-radius: 0;
  background: #0b0b0c;
}

.evidence-card {
  gap: 1.1rem;
  padding: 1.25rem;
  background: #121214;
  border-color: var(--atlas-line);
  border-radius: 8px;
  box-shadow: var(--atlas-shadow);
}

.modal-evidence-grid {
  gap: 0;
  border-top: 1px solid var(--atlas-line);
}

.modal-evidence-grid article,
.modal-event-list article {
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--atlas-line);
  border-radius: 0;
}

.modal-evidence-grid article {
  padding: 0.9rem;
}

.modal-event-list {
  gap: 0;
}

.modal-event-list article {
  padding: 1rem 0;
}

@media (max-width: 760px) {
  .home-hero {
    padding-top: 6.5rem;
  }

  .story-panel {
    margin: 0;
    padding: 1.1rem 1.2rem 1.3rem;
    border-left: 0;
    border-top: 1px solid var(--atlas-line);
    background: #0b0b0c;
  }

  .band {
    padding-block: 3rem;
  }

  .event-card {
    grid-template-columns: 3.4rem minmax(0, 1fr);
    padding-inline: 0;
  }

  .chapter-row {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .chapter-row button {
    flex: 0 0 auto;
  }

  .chain-steps article {
    border-right: 0;
    border-bottom: 1px solid var(--atlas-line);
  }

  .sound-layout {
    background: transparent;
  }
}
</style>
