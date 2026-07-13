<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from 'vue'
import AtlasControls from '@/components/AtlasControls.vue'
import AtlasDetailPanel from '@/components/AtlasDetailPanel.vue'
import BackgroundMusicPlayer from '@/components/BackgroundMusicPlayer.vue'
import AtlasTimeline from '@/components/AtlasTimeline.vue'
import { YEAR_MAX, YEAR_MIN, type AtlasMode, type Language, type LayerKey } from '@/data/ww2MusicAtlas'
import { buildDetailSourceGroups, chapterScenes, countries, getActiveStylePhase, getArtistById, getChapterForYear, getCountryById, getEventById, getFocusYearForChapter, historicEvents, stylePhases, toggleCountrySelection } from '@/lib/atlas'

const GlobeStage = defineAsyncComponent(() => import('@/components/GlobeStage.vue'))

const activeMode = ref<AtlasMode>('story')
const language = ref<Language>('zh')
const activeYear = ref(getFocusYearForChapter(chapterScenes[0]))
const selectedCountryIds = ref<string[]>(chapterScenes[0].focusCountryIds.slice(0, 2))
const selectedEventId = ref<string | null>(chapterScenes[0].focusEventIds[0] ?? null)
const selectedArtistId = ref<string | null>(null)
const enabledLayers = ref<LayerKey[]>(['styles', 'events', 'influence'])
const isPlaying = ref(false)

let playTimer: number | null = null

const activeChapter = computed(() => getChapterForYear(chapterScenes, activeYear.value))
const activeEvent = computed(() => getEventById(selectedEventId.value))
const activeArtist = computed(() => getArtistById(selectedArtistId.value))
const selectedCountries = computed(() =>
  selectedCountryIds.value
    .map((countryId) => getCountryById(countryId))
    .filter((country): country is NonNullable<typeof country> => Boolean(country)),
)

const countryDetails = computed(() =>
  selectedCountries.value.map((country) => ({
    country,
    phase: getActiveStylePhase(stylePhases, country.id, activeYear.value),
  })),
)

const sourceGroups = computed(() =>
  buildDetailSourceGroups({
    activeArtist: activeArtist.value,
    activeEvent: activeEvent.value,
    countryDetails: countryDetails.value,
    activeYear: activeYear.value,
  }),
)

const focusPose = computed(() => {
  if (activeArtist.value) {
    return {
      lat: activeArtist.value.lat,
      lng: activeArtist.value.lng,
      altitude: 1.6,
    }
  }

  if (activeEvent.value) {
    return activeEvent.value.globeFocus
  }

  if (selectedCountries.value[0]) {
    return {
      lat: selectedCountries.value[0].lat,
      lng: selectedCountries.value[0].lng,
      altitude: 1.95,
    }
  }

  return activeChapter.value.cameraPose
})

function clampYear(year: number) {
  return Math.min(YEAR_MAX, Math.max(YEAR_MIN, year))
}

function syncStorySelection() {
  if (activeMode.value !== 'story') {
    return
  }

  selectedCountryIds.value = activeChapter.value.focusCountryIds.slice(0, 2)
  if (!selectedEventId.value || !activeChapter.value.focusEventIds.includes(selectedEventId.value)) {
    selectedEventId.value = activeChapter.value.focusEventIds[0] ?? null
  }
}

function clearArtistSelectionIfHidden() {
  if (!selectedArtistId.value) {
    return
  }

  const artist = getArtistById(selectedArtistId.value)
  if (!artist) {
    selectedArtistId.value = null
    return
  }

  const matchesYear = activeYear.value >= artist.startYear && activeYear.value <= artist.endYear
  const stylesVisible = enabledLayers.value.includes('styles')
  const matchesCountry =
    selectedCountryIds.value.length === 0 || selectedCountryIds.value.includes(artist.countryId)

  if (!matchesYear || !stylesVisible || !matchesCountry) {
    selectedArtistId.value = null
  }
}

function setYear(year: number) {
  activeYear.value = clampYear(year)
}

function toggleLayer(layer: LayerKey) {
  enabledLayers.value = enabledLayers.value.includes(layer)
    ? enabledLayers.value.filter((item) => item !== layer)
    : [...enabledLayers.value, layer]

  clearArtistSelectionIfHidden()
}

function toggleCountry(countryId: string) {
  if (activeMode.value === 'story') {
    selectedCountryIds.value = [countryId]
    clearArtistSelectionIfHidden()
    return
  }

  selectedCountryIds.value = toggleCountrySelection(selectedCountryIds.value, countryId)
  clearArtistSelectionIfHidden()
}

function selectArtist(artistId: string) {
  const artist = getArtistById(artistId)
  if (!artist) {
    return
  }

  selectedArtistId.value = artistId
  selectedCountryIds.value = [artist.countryId]
}

function selectEvent(eventId: string) {
  const event = getEventById(eventId)
  if (!event) {
    return
  }

  selectedEventId.value = eventId
  activeYear.value = event.year
  selectedCountryIds.value = event.affectedCountryIds.slice(0, 2)
  selectedArtistId.value = null
}

function jumpChapter(chapterId: string) {
  const chapter = chapterScenes.find((item) => item.id === chapterId)
  if (!chapter) {
    return
  }

  activeYear.value = getFocusYearForChapter(chapter)
  selectedEventId.value = chapter.focusEventIds[0] ?? null
  selectedCountryIds.value = chapter.focusCountryIds.slice(0, 2)
  selectedArtistId.value = null
}

function advanceYear() {
  if (activeYear.value >= YEAR_MAX) {
    isPlaying.value = false
    return
  }

  activeYear.value += 1
}

watch(activeMode, (mode) => {
  if (mode === 'story') {
    syncStorySelection()
    clearArtistSelectionIfHidden()
    return
  }

  if (selectedCountryIds.value.length === 0) {
    selectedCountryIds.value = ['us', 'jp']
  }

  clearArtistSelectionIfHidden()
})

watch(activeYear, () => {
  if (activeMode.value === 'story') {
    syncStorySelection()
  }

  clearArtistSelectionIfHidden()
})

watch(isPlaying, (playing) => {
  if (playTimer) {
    window.clearInterval(playTimer)
    playTimer = null
  }

  if (!playing) {
    return
  }

  playTimer = window.setInterval(advanceYear, 1800)
})

onBeforeUnmount(() => {
  if (playTimer) {
    window.clearInterval(playTimer)
  }
})
</script>

<template>
  <main class="atlas-page">
    <div class="atlas-stage">
      <Suspense>
        <GlobeStage
          :active-year="activeYear"
          :countries="countries"
          :enabled-layers="enabledLayers"
          :events="historicEvents"
          :focus-pose="focusPose"
          :highlighted-event-id="selectedEventId"
          :language="language"
          :selected-artist-id="selectedArtistId"
          :selected-country-ids="selectedCountryIds"
          :timeline-playing="isPlaying"
          @select-artist="selectArtist"
          @select-country="toggleCountry"
          @select-event="selectEvent"
        />
        <template #fallback>
          <div class="stage-loading">
            <p>{{ language === 'zh' ? '正在载入地球舞台与档案图层…' : 'Loading globe stage and archival layers…' }}</p>
          </div>
        </template>
      </Suspense>

      <div class="top-left">
        <AtlasControls
          :active-chapter-id="activeChapter.id"
          :active-mode="activeMode"
          :chapters="chapterScenes"
          :countries="countries"
          :enabled-layers="enabledLayers"
          :language="language"
          :selected-country-ids="selectedCountryIds"
          @jump-chapter="jumpChapter"
          @toggle-country="toggleCountry"
          @toggle-layer="toggleLayer"
          @update:language="language = $event"
          @update:mode="activeMode = $event"
        />
      </div>

      <div class="right-rail">
        <AtlasDetailPanel
          :active-artist="activeArtist"
          :active-chapter="activeChapter"
          :active-event="activeEvent"
          :active-year="activeYear"
          :country-details="countryDetails"
          :language="language"
          :source-groups="sourceGroups"
        />
      </div>

      <div class="background-player-shell">
        <BackgroundMusicPlayer :language="language" />
      </div>
    </div>

    <div class="timeline-shell">
      <AtlasTimeline
        :active-year="activeYear"
        :countries="countries"
        :events="historicEvents"
        :highlighted-event-id="selectedEventId"
        :is-playing="isPlaying"
        :language="language"
        :max-year="YEAR_MAX"
        :min-year="YEAR_MIN"
        :phases="stylePhases"
        :selected-country-ids="selectedCountryIds"
        @select-event="selectEvent"
        @toggle-play="isPlaying = !isPlaying"
        @update:year="setYear"
      />
    </div>
  </main>
</template>

<style scoped>
.atlas-page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
}

.atlas-stage {
  position: relative;
  min-height: calc(100svh - 18rem);
  overflow: hidden;
}

.top-left {
  position: absolute;
  top: 1.2rem;
  left: 1.2rem;
  z-index: 2;
}

.stage-loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: rgba(239, 228, 208, 0.82);
  background:
    radial-gradient(circle at center, rgba(201, 143, 88, 0.08), transparent 48%),
    linear-gradient(180deg, rgba(7, 11, 16, 0.82), rgba(7, 11, 16, 0.94));
}

.stage-loading p {
  margin: 0;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(239, 228, 208, 0.08);
  background: rgba(10, 15, 21, 0.58);
}

.right-rail {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  width: min(27rem, 34vw);
}

.timeline-shell {
  position: relative;
  z-index: 2;
}

.background-player-shell {
  position: absolute;
  left: 50%;
  bottom: 1.2rem;
  z-index: 3;
  transform: translateX(-50%);
}

@media (max-width: 980px) {
  .atlas-page {
    grid-template-rows: minmax(0, 1fr) auto auto;
  }

  .atlas-stage {
    min-height: calc(100svh - 28rem);
  }

  .right-rail {
    position: static;
    width: auto;
  }

  .background-player-shell {
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
  }
}

@media (max-width: 760px) {
  .top-left {
    top: 0.75rem;
    left: 0.75rem;
    right: 0.75rem;
  }

  .atlas-stage {
    min-height: 68svh;
  }

  .background-player-shell {
    left: 50%;
    bottom: 0.75rem;
    transform: translateX(-50%);
  }
}
</style>
