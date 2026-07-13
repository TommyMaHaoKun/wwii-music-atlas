import { artistMarkers as rawArtistMarkers, type ArtistMarker, type ArtistWork } from '@/data/atlasMarkers'
import {
  artistMediaById,
  audioClips,
  bibliographySections,
  eventMediaById,
  getPhaseReferenceKey,
  phaseMediaByKey,
  sourceReferences,
} from '@/data/atlasSources'
import {
  chapterScenes,
  countries,
  historicEvents as rawHistoricEvents,
  influenceArcs,
  stylePhases as rawStylePhases,
  type AudioClip,
  type ChapterScene,
  type CountryProfile,
  type HistoricEvent,
  type InfluenceArc,
  type Language,
  type RelatedSong,
  type SourceReference,
  type StylePhase,
  type SourceKind,
} from '@/data/ww2MusicAtlas'

export interface CountryDetail {
  country: CountryProfile
  phase: StylePhase | null
}

export interface DetailSourceGroup {
  id: string
  entityType: 'artist' | 'event' | 'phase'
  titleZh: string
  titleEn: string
  summaryZh?: string
  summaryEn?: string
  sources: SourceReference[]
  audioClips: AudioClip[]
  relatedSongs: RelatedSong[]
  hasPlayableAudio: boolean
}

export interface ArtistDossierValidationIssue {
  artistId: string
  field: string
}

export interface CountryAudioCoverage {
  countryId: string
  audioClipIds: string[]
  hasPlayableAudio: boolean
  hasRecordOnlyAudio: boolean
  isRecordOnly: boolean
}

const SOURCE_KINDS: SourceKind[] = ['archive', 'biography', 'history', 'study', 'museum', 'recording', 'overview', 'essay', 'foundation']

export const stylePhases: StylePhase[] = rawStylePhases.map((phase) => {
  const media = phaseMediaByKey[getPhaseReferenceKey(phase.countryId, phase.startYear)] ?? {}
  return { ...phase, ...media }
})

export const historicEvents: HistoricEvent[] = rawHistoricEvents.map((event) => {
  const media = eventMediaById[event.id] ?? {}
  return { ...event, ...media }
})

export const artistMarkers: ArtistMarker[] = rawArtistMarkers.map((artist) => {
  const media = artistMediaById[artist.id] ?? {}
  return {
    ...artist,
    ...media,
    sourceIds: Array.from(new Set([...(artist.sourceIds ?? []), ...(media.sourceIds ?? [])])),
    audioClipIds: Array.from(new Set([...(artist.audioClipIds ?? []), ...(media.audioClipIds ?? [])])),
  }
})

export function getCountryName(country: CountryProfile, language: Language) {
  return language === 'zh' ? country.nameZh : country.nameEn
}

export function getEventTitle(event: HistoricEvent, language: Language) {
  return language === 'zh' ? event.titleZh : event.titleEn
}

export function getEventDescription(event: HistoricEvent, language: Language) {
  return language === 'zh' ? event.descriptionZh : event.descriptionEn
}

export function getStyleName(phase: StylePhase, language: Language) {
  return language === 'zh' ? phase.styleNameZh : phase.styleNameEn
}

export function getStyleSummary(phase: StylePhase, language: Language) {
  return language === 'zh' ? phase.summaryZh : phase.summaryEn
}

export function getChapterTitle(chapter: ChapterScene, language: Language) {
  return language === 'zh' ? chapter.titleZh : chapter.titleEn
}

export function getChapterSummary(chapter: ChapterScene, language: Language) {
  return language === 'zh' ? chapter.summaryZh : chapter.summaryEn
}

export function getActiveStylePhase(phases: StylePhase[], countryId: string, year: number) {
  return phases.find((phase) => phase.countryId === countryId && year >= phase.startYear && year <= phase.endYear) ?? null
}

export function getEventsForYear(events: HistoricEvent[], year: number, radius = 1) {
  return events.filter((event) => Math.abs(event.year - year) <= radius)
}

export function getVisibleInfluenceArcs(arcs: InfluenceArc[], year: number, selectedCountryIds: string[] = []) {
  return arcs.filter((arc) => {
    const active = year >= arc.startYear && year <= arc.endYear
    if (!active) {
      return false
    }

    if (selectedCountryIds.length === 0) {
      return true
    }

    return selectedCountryIds.includes(arc.sourceCountryId) || selectedCountryIds.includes(arc.targetCountryId)
  })
}

export function getChapterForYear(chapters: ChapterScene[], year: number) {
  return chapters.find((chapter) => year >= chapter.yearRange[0] && year <= chapter.yearRange[1]) ?? chapters[chapters.length - 1]
}

export function toggleCountrySelection(selectedCountryIds: string[], countryId: string) {
  if (selectedCountryIds.includes(countryId)) {
    return selectedCountryIds.filter((id) => id !== countryId)
  }

  if (selectedCountryIds.length < 2) {
    return [...selectedCountryIds, countryId]
  }

  return [selectedCountryIds[1], countryId]
}

export function getCountryById(countryId: string) {
  return countries.find((country) => country.id === countryId) ?? null
}

export function getEventById(eventId: string | null) {
  return historicEvents.find((event) => event.id === eventId) ?? null
}

export function getArtistById(artistId: string | null) {
  return artistMarkers.find((artist) => artist.id === artistId) ?? null
}

export function getPhaseKey(countryId: string, startYear: number) {
  return getPhaseReferenceKey(countryId, startYear)
}

export function getArtistRole(artist: ArtistMarker, language: Language) {
  return language === 'zh' ? artist.countryRoleZh : artist.countryRoleEn
}

export function getArtistWorkNote(work: ArtistWork, language: Language) {
  return language === 'zh' ? work.noteZh : work.noteEn
}

export function getArtistsForEvent(eventId: string | null) {
  if (!eventId) {
    return []
  }

  return artistMarkers.filter((artist) => artist.linkedEventIds.includes(eventId))
}

export function getArtistsForPhase(countryId: string, startYear: number) {
  const phaseKey = getPhaseKey(countryId, startYear)
  return artistMarkers.filter((artist) => artist.linkedPhaseKeys.includes(phaseKey))
}

export function getArtistsForCountryYear(countryId: string, year: number) {
  return artistMarkers.filter((artist) => {
    const activeByYear = year >= artist.startYear && year <= artist.endYear
    const activeByPhase = stylePhases.some((phase) => {
      return (
        phase.countryId === countryId &&
        year >= phase.startYear &&
        year <= phase.endYear &&
        artist.linkedPhaseKeys.includes(getPhaseKey(countryId, phase.startYear))
      )
    })

    return artist.countryId === countryId && (activeByYear || activeByPhase)
  })
}

export function getFeaturedArtistsForContext(input: {
  activeEvent: HistoricEvent | null
  countryDetails: CountryDetail[]
  activeYear: number
  limit?: number
}) {
  const seen = new Set<string>()
  const artists: ArtistMarker[] = []

  const push = (items: ArtistMarker[]) => {
    items.forEach((artist) => {
      if (!seen.has(artist.id)) {
        seen.add(artist.id)
        artists.push(artist)
      }
    })
  }

  push(getArtistsForEvent(input.activeEvent?.id ?? null))
  input.countryDetails.forEach((detail) => {
    if (detail.phase) {
      push(getArtistsForPhase(detail.country.id, detail.phase.startYear))
    }
    push(getArtistsForCountryYear(detail.country.id, input.activeYear))
  })

  return artists.slice(0, input.limit ?? 6)
}

export function getSourceReferencesByIds(sourceIds: string[] = []) {
  const seen = new Set<string>()
  return sourceIds.flatMap((sourceId) => {
    if (seen.has(sourceId)) {
      return []
    }

    seen.add(sourceId)
    const source = sourceReferences.find((item) => item.id === sourceId)
    return source ? [source] : []
  })
}

export function getAudioClipsByIds(audioClipIds: string[] = []) {
  const seen = new Set<string>()
  return audioClipIds.flatMap((audioClipId) => {
    if (seen.has(audioClipId)) {
      return []
    }

    seen.add(audioClipId)
    const clip = audioClips.find((item) => item.id === audioClipId)
    return clip ? [clip] : []
  })
}

function createGroup(
  input: Omit<DetailSourceGroup, 'sources' | 'audioClips' | 'relatedSongs' | 'hasPlayableAudio'> & {
    sourceIds?: string[]
    audioClipIds?: string[]
    relatedSongs?: RelatedSong[]
  },
) {
  const sources = getSourceReferencesByIds(input.sourceIds)
  const clips = getAudioClipsByIds(input.audioClipIds)
  const relatedSongs = input.relatedSongs ?? []

  if (sources.length === 0 && clips.length === 0 && relatedSongs.length === 0) {
    return null
  }

  return {
    id: input.id,
    entityType: input.entityType,
    titleZh: input.titleZh,
    titleEn: input.titleEn,
    summaryZh: input.summaryZh,
    summaryEn: input.summaryEn,
    sources,
    audioClips: clips,
    relatedSongs,
    hasPlayableAudio: clips.some((clip) => Boolean(clip.streamUrl)) || relatedSongs.some((song) => Boolean(song.streamUrl)),
  } satisfies DetailSourceGroup
}

export function getBibliographySections() {
  return bibliographySections.map((section) => ({
    ...section,
    sources: getSourceReferencesByIds(section.sourceIds),
  }))
}

export function validateCatalogEntries() {
  const invalidSourceKinds = sourceReferences.filter((source) => !SOURCE_KINDS.includes(source.kind))
  const sourcesMissingUrl = sourceReferences.filter((source) => !source.url || !source.archiveOrAuthor || !source.year)
  const audioMissingRights = audioClips.filter((clip) => !clip.rightsLabel || !clip.recordUrl)

  return {
    invalidSourceKinds,
    sourcesMissingUrl,
    audioMissingRights,
  }
}

export function validateArtistDossiers() {
  const issues: ArtistDossierValidationIssue[] = []
  const countryCounts = new Map<string, number>()
  const sourceIds = new Set(sourceReferences.map((source) => source.id))
  const eventIds = new Set(historicEvents.map((event) => event.id))
  const phaseKeys = new Set(stylePhases.map((phase) => getPhaseKey(phase.countryId, phase.startYear)))

  artistMarkers.forEach((artist) => {
    countryCounts.set(artist.countryId, (countryCounts.get(artist.countryId) ?? 0) + 1)

    if (artist.representativeWorks.length < 1) {
      issues.push({ artistId: artist.id, field: 'representativeWorks' })
    }
    if (!artist.portrait.src || !artist.portrait.altZh || !artist.portrait.altEn || !artist.portrait.credit || !artist.portrait.sourceUrl || !artist.portrait.licenseLabel) {
      issues.push({ artistId: artist.id, field: 'portrait' })
    }
    if (!artist.sourceIds?.some((sourceId) => sourceIds.has(sourceId))) {
      issues.push({ artistId: artist.id, field: 'sourceIds' })
    }
    if (!artist.linkedEventIds.every((eventId) => eventIds.has(eventId))) {
      issues.push({ artistId: artist.id, field: 'linkedEventIds' })
    }
    if (!artist.linkedPhaseKeys.every((phaseKey) => phaseKeys.has(phaseKey))) {
      issues.push({ artistId: artist.id, field: 'linkedPhaseKeys' })
    }
  })

  countries.forEach((country) => {
    if ((countryCounts.get(country.id) ?? 0) < 3) {
      issues.push({ artistId: country.id, field: 'countryCoverage' })
    }
  })

  return issues
}

export function collectMediaCoverage() {
  return {
    phases: stylePhases.map((phase) => ({
      id: `${phase.countryId}:${phase.startYear}`,
      sourceIds: phase.sourceIds ?? [],
      audioClipIds: phase.audioClipIds ?? [],
    })),
    events: historicEvents.map((event) => ({
      id: event.id,
      sourceIds: event.sourceIds ?? [],
      audioClipIds: event.audioClipIds ?? [],
    })),
    artists: artistMarkers.map((artist) => ({
      id: artist.id,
      sourceIds: artist.sourceIds ?? [],
      audioClipIds: artist.audioClipIds ?? [],
    })),
  }
}

export function collectCountryAudioCoverage() {
  return countries.map((country) => {
    const audioClipIds = Array.from(
      new Set([
        ...stylePhases.filter((phase) => phase.countryId === country.id).flatMap((phase) => phase.audioClipIds ?? []),
        ...artistMarkers.filter((artist) => artist.countryId === country.id).flatMap((artist) => artist.audioClipIds ?? []),
        ...historicEvents
          .filter((event) => event.affectedCountryIds.includes(country.id))
          .flatMap((event) => event.audioClipIds ?? []),
      ]),
    )
    const clips = getAudioClipsByIds(audioClipIds)
    const hasPlayableAudio = clips.some((clip) => Boolean(clip.streamUrl))
    const hasRecordOnlyAudio = clips.some((clip) => !clip.streamUrl)

    return {
      countryId: country.id,
      audioClipIds,
      hasPlayableAudio,
      hasRecordOnlyAudio,
      isRecordOnly: audioClipIds.length > 0 && !hasPlayableAudio,
    } satisfies CountryAudioCoverage
  })
}

export function buildDetailSourceGroups(input: {
  activeArtist: ArtistMarker | null
  activeEvent: HistoricEvent | null
  countryDetails: CountryDetail[]
  activeYear: number
}) {
  const groups: DetailSourceGroup[] = []

  if (input.activeArtist) {
    const artistGroup = createGroup({
      id: `artist:${input.activeArtist.id}`,
      entityType: 'artist',
      titleZh: input.activeArtist.nameZh,
      titleEn: input.activeArtist.nameEn,
      summaryZh: input.activeArtist.summaryZh,
      summaryEn: input.activeArtist.summaryEn,
      sourceIds: input.activeArtist.sourceIds,
      audioClipIds: input.activeArtist.audioClipIds,
      relatedSongs: input.activeArtist.representativeWorks.map((work) => ({
        ...work,
        performer: input.activeArtist!.nameEn,
      })),
    })

    if (artistGroup) {
      groups.push(artistGroup)
    }
  }

  if (input.activeEvent) {
    const eventGroup = createGroup({
      id: `event:${input.activeEvent.id}`,
      entityType: 'event',
      titleZh: input.activeEvent.titleZh,
      titleEn: input.activeEvent.titleEn,
      summaryZh: input.activeEvent.descriptionZh,
      summaryEn: input.activeEvent.descriptionEn,
      sourceIds: input.activeEvent.sourceIds,
      audioClipIds: input.activeEvent.audioClipIds,
      relatedSongs: input.activeEvent.relatedSongs,
    })

    if (eventGroup) {
      groups.push(eventGroup)
    }
  }

  input.countryDetails.forEach((detail) => {
    if (!detail.phase) {
      return
    }

    const groupId = `phase:${detail.country.id}:${detail.phase.startYear}`
    if (groups.some((group) => group.id === groupId)) {
      return
    }

    const phaseGroup = createGroup({
      id: groupId,
      entityType: 'phase',
      titleZh: `${detail.country.nameZh} · ${detail.phase.styleNameZh}`,
      titleEn: `${detail.country.nameEn} · ${detail.phase.styleNameEn}`,
      summaryZh: detail.phase.summaryZh,
      summaryEn: detail.phase.summaryEn,
      sourceIds: detail.phase.sourceIds,
      audioClipIds: detail.phase.audioClipIds,
      relatedSongs: detail.phase.representativeSongs,
    })

    if (phaseGroup) {
      groups.push(phaseGroup)
    }
  })

  return groups
}

export function getFocusYearForChapter(chapter: ChapterScene) {
  const matchingEvent = historicEvents.find((event) => chapter.focusEventIds.includes(event.id))
  return matchingEvent?.year ?? chapter.yearRange[0]
}

export { audioClips, bibliographySections, chapterScenes, countries, influenceArcs, sourceReferences }
