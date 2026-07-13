import { computed, ref, watch } from 'vue'
import type { LocationQuery } from 'vue-router'
import { YEAR_MAX, YEAR_MIN, type AtlasMode, type Language, type LayerKey } from '@/data/ww2MusicAtlas'
import {
  buildDetailSourceGroups,
  chapterScenes,
  countries,
  getActiveStylePhase,
  getArtistById,
  getChapterForYear,
  getCountryById,
  getEventById,
  getFocusYearForChapter,
  historicEvents,
  stylePhases,
  toggleCountrySelection,
} from '@/lib/atlas'
import { updateRouteQuery, useCurrentRoute } from '@/router'

export interface AtlasRouteQuery {
  year?: number
  event?: string
  countries?: string[]
  artist?: string
  lang?: Language
}

const activeMode = ref<AtlasMode>('story')
const language = ref<Language>('zh')
const activeYear = ref(getFocusYearForChapter(chapterScenes[0]))
const selectedCountryIds = ref<string[]>(chapterScenes[0].focusCountryIds.slice(0, 2))
const selectedEventId = ref<string | null>(chapterScenes[0].focusEventIds[0] ?? null)
const selectedArtistId = ref<string | null>(null)
const enabledLayers = ref<LayerKey[]>(['styles', 'events', 'influence'])
const isPlaying = ref(false)
const route = useCurrentRoute()

let routeSyncing = false
let playTimer: number | null = null

function clampYear(year: number) {
  return Math.min(YEAR_MAX, Math.max(YEAR_MIN, year))
}

function parseCountryIds(value: string | undefined) {
  if (!value) {
    return null
  }

  const ids = value.split(',').filter((countryId) => Boolean(getCountryById(countryId)))
  return ids.length ? ids.slice(0, 2) : null
}

function serializeState() {
  return {
    year: activeYear.value,
    event: selectedEventId.value,
    countries: selectedCountryIds.value.join(','),
    artist: selectedArtistId.value,
    lang: language.value,
  }
}

function writeRouteState() {
  if (routeSyncing) {
    return Promise.resolve()
  }

  return updateRouteQuery(serializeState(), true)
}

function getQueryString(query: LocationQuery, key: string) {
  const value = query[key]
  return Array.isArray(value) ? value[0] ?? undefined : value ?? undefined
}

function applyRouteQuery(query: LocationQuery) {
  routeSyncing = true

  const parsedYear = Number(getQueryString(query, 'year'))
  activeYear.value = Number.isFinite(parsedYear) ? clampYear(parsedYear) : activeYear.value

  language.value = getQueryString(query, 'lang') === 'en' ? 'en' : 'zh'

  const event = getEventById(getQueryString(query, 'event') ?? null)
  selectedEventId.value = event?.id ?? selectedEventId.value

  const artist = getArtistById(getQueryString(query, 'artist') ?? null)
  selectedArtistId.value = artist?.id ?? null

  const countryIds = parseCountryIds(getQueryString(query, 'countries'))
  if (countryIds) {
    selectedCountryIds.value = countryIds
  } else if (event) {
    selectedCountryIds.value = event.affectedCountryIds.slice(0, 2)
  }

  routeSyncing = false
}

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
  const matchesYear = artist && activeYear.value >= artist.startYear && activeYear.value <= artist.endYear
  const stylesVisible = enabledLayers.value.includes('styles')
  const matchesCountry = artist && (selectedCountryIds.value.length === 0 || selectedCountryIds.value.includes(artist.countryId))

  if (!artist || !matchesYear || !stylesVisible || !matchesCountry) {
    selectedArtistId.value = null
  }
}

function setYear(year: number) {
  activeYear.value = clampYear(year)
  if (activeMode.value === 'story') {
    syncStorySelection()
  }
  clearArtistSelectionIfHidden()
  return writeRouteState()
}

function setLanguage(nextLanguage: Language) {
  language.value = nextLanguage
  return writeRouteState()
}

function setMode(mode: AtlasMode) {
  activeMode.value = mode
  if (mode === 'story') {
    syncStorySelection()
  } else if (selectedCountryIds.value.length === 0) {
    selectedCountryIds.value = ['us', 'jp']
  }
  clearArtistSelectionIfHidden()
  return writeRouteState()
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
  } else {
    selectedCountryIds.value = toggleCountrySelection(selectedCountryIds.value, countryId)
  }

  clearArtistSelectionIfHidden()
  return writeRouteState()
}

function selectArtist(artistId: string) {
  const artist = getArtistById(artistId)
  if (!artist) {
    return
  }

  selectedArtistId.value = artistId
  selectedCountryIds.value = [artist.countryId]
  return writeRouteState()
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
  return writeRouteState()
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
  return writeRouteState()
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function advanceYear() {
  if (activeYear.value >= YEAR_MAX) {
    isPlaying.value = false
    return
  }

  setYear(activeYear.value + 1)
}

watch(
  () => route.value.fullPath,
  () => applyRouteQuery(route.value.query),
  { immediate: true },
)

watch(isPlaying, (playing) => {
  if (playTimer) {
    window.clearInterval(playTimer)
    playTimer = null
  }

  if (playing) {
    playTimer = window.setInterval(advanceYear, 1800)
  }
})

export function useAtlasState() {
  return {
    activeArtist,
    activeChapter,
    activeEvent,
    activeMode,
    activeYear,
    chapterScenes,
    countries,
    countryDetails,
    enabledLayers,
    focusPose,
    historicEvents,
    isPlaying,
    language,
    selectedArtistId,
    selectedCountryIds,
    selectedCountries,
    selectedEventId,
    sourceGroups,
    stylePhases,
    jumpChapter,
    selectArtist,
    selectEvent,
    setLanguage,
    setMode,
    setYear,
    toggleCountry,
    toggleLayer,
    togglePlay,
  }
}
