import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  buildDetailSourceGroups,
  artistMarkers,
  chapterScenes,
  collectCountryAudioCoverage,
  collectMediaCoverage,
  getActiveStylePhase,
  getArtistById,
  getAudioClipsByIds,
  getCountryById,
  getEventById,
  getEventsForYear,
  getSourceReferencesByIds,
  getVisibleInfluenceArcs,
  historicEvents,
  influenceArcs,
  stylePhases,
  toggleCountrySelection,
  validateCatalogEntries,
  validateArtistDossiers,
} from '@/lib/atlas'
import { resolveStylePalette } from '@/lib/stylePalette'

const invalidAudioSourcePattern = /suno\.com|well-meet-again_202511/i

function isValidAudioStream(streamUrl: string, localPrefixes: string[]) {
  if (invalidAudioSourcePattern.test(streamUrl)) {
    return false
  }

  if (streamUrl.startsWith('https://')) {
    return true
  }

  if (!localPrefixes.some((prefix) => streamUrl.startsWith(prefix))) {
    return false
  }

  return existsSync(join(process.cwd(), 'public', streamUrl.replace(/^\//, '')))
}

describe('atlas helpers', () => {
  it('resolves the active style phase for a country and year', () => {
    const phase = getActiveStylePhase(stylePhases, 'us', 1942)

    expect(phase?.styleNameEn).toBe('Wartime Entertainment and Military Circulation')
  })

  it('filters events around the active year', () => {
    const events = getEventsForYear(historicEvents, 1941, 0)

    expect(events.map((event) => event.id)).toEqual(['barbarossa', 'pearl-harbor'])
  })

  it('filters influence arcs to selected countries', () => {
    const arcs = getVisibleInfluenceArcs(influenceArcs, 1947, ['jp'])

    expect(arcs).toHaveLength(1)
    expect(arcs[0].targetCountryId).toBe('jp')
  })

  it('limits country comparison to two items and keeps the latest choice', () => {
    const result = toggleCountrySelection(['fr', 'us'], 'jp')

    expect(result).toEqual(['us', 'jp'])
  })

  it('maps a style phase to a palette family for globe tinting', () => {
    const phase = getActiveStylePhase(stylePhases, 'fr', 1942)

    expect(resolveStylePalette(phase).key).toBe('lyric')
  })

  it('builds source groups in artist, event, then phase order', () => {
    const activeArtist = getArtistById('vera-lynn')
    const activeEvent = getEventById('pearl-harbor')
    const countryDetails = [
      { country: getCountryById('uk')!, phase: getActiveStylePhase(stylePhases, 'uk', 1941) },
    ]

    const groups = buildDetailSourceGroups({
      activeArtist,
      activeEvent,
      countryDetails,
      activeYear: 1941,
    })

    expect(groups.map((group) => group.entityType)).toEqual(['artist', 'event', 'phase'])
    expect(groups[0].titleEn).toBe('Vera Lynn')
  })

  it('returns audio clips for both playable and external-only entries', () => {
    const clips = getAudioClipsByIds(['clip-sinews-of-peace', 'clip-well-meet-again'])

    expect(clips[0].streamUrl).toContain('tile.loc.gov')
    expect(clips[1].streamUrl).toBeUndefined()
  })

  it('collects at least one audio-related entry for every country', () => {
    const coverage = collectCountryAudioCoverage()

    expect(coverage).toHaveLength(8)
    expect(coverage.every((entry) => entry.audioClipIds.length >= 1)).toBe(true)
    expect(coverage.find((entry) => entry.countryId === 'uk')?.hasPlayableAudio).toBe(true)
    expect(coverage.find((entry) => entry.countryId === 'su')?.isRecordOnly).toBe(true)
    expect(coverage.find((entry) => entry.countryId === 'it')?.hasRecordOnlyAudio).toBe(true)
  })

  it('returns an empty source-group list when nothing is linked', () => {
    const groups = buildDetailSourceGroups({
      activeArtist: null,
      activeEvent: null,
      countryDetails: [{ country: getCountryById('us')!, phase: null }],
      activeYear: 1931,
    })

    expect(groups).toEqual([])
  })

  it('marks a source group as playable when at least one clip has a stream url', () => {
    const groups = buildDetailSourceGroups({
      activeArtist: null,
      activeEvent: getEventById('marshall-broadcast'),
      countryDetails: [],
      activeYear: 1947,
    })

    expect(groups[0].hasPlayableAudio).toBe(true)
  })

  it('validates media coverage ids and catalog metadata', () => {
    const coverage = collectMediaCoverage()
    const countryAudioCoverage = collectCountryAudioCoverage()
    const catalog = validateCatalogEntries()
    const linkedAudioIds = Array.from(new Set(countryAudioCoverage.flatMap((entry) => entry.audioClipIds)))
    const linkedAudioClips = getAudioClipsByIds(linkedAudioIds)

    expect(coverage.phases.every((entry) => entry.sourceIds.length >= 1)).toBe(true)
    expect(coverage.events.every((entry) => entry.sourceIds.length >= 1)).toBe(true)
    expect(coverage.artists.every((entry) => entry.sourceIds.length >= 1)).toBe(true)
    expect(coverage.phases.every((entry) => getSourceReferencesByIds(entry.sourceIds).some((source) => source.isPrimary))).toBe(true)
    expect(coverage.events.every((entry) => getSourceReferencesByIds(entry.sourceIds).some((source) => source.isPrimary))).toBe(true)
    expect(coverage.artists.every((entry) => getSourceReferencesByIds(entry.sourceIds).some((source) => source.isPrimary))).toBe(true)
    expect(linkedAudioClips.every((clip) => clip.rightsLabel.trim().length >= 1)).toBe(true)
    expect(linkedAudioClips.every((clip) => clip.recordUrl.trim().length >= 1)).toBe(true)
    expect(catalog.invalidSourceKinds).toEqual([])
    expect(catalog.sourcesMissingUrl).toEqual([])
    expect(catalog.audioMissingRights).toEqual([])
  })

  it('validates country style phase storytelling and playable representative songs', () => {
    const allowedSensitivity = new Set(['neutral', 'patriotic', 'resistance', 'sensitive-context'])

    expect(
      stylePhases.every(
        (phase) =>
          phase.summaryZh.length >= 65 &&
          phase.summaryEn.length >= 140 &&
          phase.historicalContextZh &&
          phase.historicalContextZh.length >= 65 &&
          phase.historicalContextEn &&
          phase.historicalContextEn.length >= 140 &&
          phase.representativeSongs &&
          phase.representativeSongs.length >= 1 &&
          phase.representativeSongs.every(
            (song) =>
              song.title &&
              song.performer &&
              song.year &&
              song.noteZh &&
              song.noteEn &&
              song.eventRelationZh &&
              song.eventRelationEn &&
              song.listeningGuideZh &&
              song.listeningGuideEn &&
              song.sourceUrl &&
              !invalidAudioSourcePattern.test(song.sourceUrl) &&
              song.rightsLabel &&
              song.sensitivity &&
              allowedSensitivity.has(song.sensitivity) &&
              song.streamUrl &&
              isValidAudioStream(song.streamUrl, ['/audio/events/']) &&
              song.audioCredit,
          ),
      ),
    ).toBe(true)
  })

  it('validates artist dossier coverage, works, links, and image assets', () => {
    const issues = validateArtistDossiers()
    const countsByCountry = artistMarkers.reduce<Record<string, number>>((counts, artist) => {
      counts[artist.countryId] = (counts[artist.countryId] ?? 0) + 1
      return counts
    }, {})

    expect(artistMarkers).toHaveLength(24)
    expect(Object.values(countsByCountry).every((count) => count >= 3)).toBe(true)
    expect(issues).toEqual([])
    expect(
      artistMarkers.every((artist) => {
        const imagePath = artist.portrait.src.replace(/^\//, '')
        return existsSync(join(process.cwd(), 'public', imagePath))
      }),
    ).toBe(true)
  })

  it('validates enhanced historic event storytelling assets', () => {
    const allowedSensitivity = new Set(['neutral', 'patriotic', 'resistance', 'sensitive-context'])

    expect(
      historicEvents.every((event) => {
        const imagePath = event.image?.src.replace(/^\//, '')

        return Boolean(
          event.longDescriptionZh?.trim() &&
            event.longDescriptionZh.length >= 90 &&
            event.longDescriptionEn?.trim() &&
            event.longDescriptionEn.length >= 140 &&
            event.musicImpactZh?.trim() &&
            event.musicImpactZh.length >= 50 &&
            event.musicImpactEn?.trim() &&
            event.musicImpactEn.length >= 100 &&
            event.relatedSongs &&
            event.relatedSongs.length >= 1 &&
            event.relatedSongs.length <= 3 &&
            event.relatedSongs.every(
              (song) =>
                song.title &&
                song.performer &&
                song.year &&
                song.noteZh &&
                song.noteEn &&
                song.contextZh &&
                song.contextEn &&
                song.eventRelationZh &&
                song.eventRelationEn &&
                song.listeningGuideZh &&
                song.listeningGuideEn &&
                song.sourceUrl &&
                !invalidAudioSourcePattern.test(song.sourceUrl) &&
                song.rightsLabel &&
                song.sensitivity &&
                allowedSensitivity.has(song.sensitivity) &&
                song.streamUrl &&
                isValidAudioStream(song.streamUrl, ['/audio/events/', '/audio/background/']) &&
                (!song.streamUrl.startsWith('/audio/events/') || song.audioCredit),
            ) &&
            event.image?.altZh &&
            event.image.altEn &&
            event.image.captionZh &&
            event.image.captionEn &&
            event.image.credit &&
            event.image.sourceUrl &&
            event.image.licenseLabel &&
            imagePath &&
            existsSync(join(process.cwd(), 'public', imagePath)),
        )
      }),
    ).toBe(true)

    expect(historicEvents).toHaveLength(13)
    expect(historicEvents.reduce((count, event) => count + (event.relatedSongs?.length ?? 0), 0)).toBe(39)
  })

  it('validates chapter evidence copy and generated thumbnail assets', () => {
    expect(chapterScenes).toHaveLength(5)
    expect(
      chapterScenes.every((chapter) => {
        const imagePath = chapter.thumbnail.src.replace(/^\//, '')

        return Boolean(
          chapter.detailZh.trim() &&
            chapter.detailEn.trim() &&
            chapter.evidencePoints.length === 3 &&
            chapter.evidencePoints.every(
              (point) =>
                point.kind &&
                point.labelZh &&
                point.labelEn &&
                point.titleZh &&
                point.titleEn &&
                point.bodyZh &&
                point.bodyEn,
            ) &&
            chapter.thumbnail.generated &&
            chapter.thumbnail.altZh &&
            chapter.thumbnail.altEn &&
            chapter.thumbnail.credit &&
            chapter.thumbnail.sourceUrl &&
            chapter.thumbnail.licenseLabel &&
            imagePath &&
            existsSync(join(process.cwd(), 'public', imagePath)),
        )
      }),
    ).toBe(true)
  })
})
