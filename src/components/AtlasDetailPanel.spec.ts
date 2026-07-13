import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AtlasDetailPanel from '@/components/AtlasDetailPanel.vue'
import { SOURCE_AUDIO_STATE_EVENT } from '@/lib/audioBus'
import { buildDetailSourceGroups, chapterScenes, getActiveStylePhase, getArtistById, getCountryById, getEventById, stylePhases } from '@/lib/atlas'

describe('AtlasDetailPanel', () => {
  it('shows compare mode when two countries are selected', () => {
    const countryDetails = [
      { country: getCountryById('us')!, phase: getActiveStylePhase(stylePhases, 'us', 1941) },
      { country: getCountryById('jp')!, phase: getActiveStylePhase(stylePhases, 'jp', 1941) },
    ]

    const wrapper = mount(AtlasDetailPanel, {
      props: {
        activeArtist: null,
        activeChapter: chapterScenes[2],
        activeEvent: getEventById('pearl-harbor'),
        activeYear: 1941,
        countryDetails,
        language: 'en',
        sourceGroups: buildDetailSourceGroups({
          activeArtist: null,
          activeEvent: getEventById('pearl-harbor'),
          countryDetails,
          activeYear: 1941,
        }),
      },
    })

    expect(wrapper.get('[data-testid="compare-panel"]').text()).toContain('United States')
    expect(wrapper.get('[data-testid="compare-panel"]').text()).toContain('Japan')
  })

  it('renders artist sources and hides audio player when the clip has no stream url', async () => {
    const activeArtist = getArtistById('vera-lynn')!
    const countryDetails = [
      { country: getCountryById('uk')!, phase: getActiveStylePhase(stylePhases, 'uk', 1941) },
    ]

    const wrapper = mount(AtlasDetailPanel, {
      props: {
        activeArtist,
        activeChapter: chapterScenes[2],
        activeEvent: getEventById('pearl-harbor'),
        activeYear: 1941,
        countryDetails,
        language: 'en',
        sourceGroups: buildDetailSourceGroups({
          activeArtist,
          activeEvent: getEventById('pearl-harbor'),
          countryDetails,
          activeYear: 1941,
        }),
      },
    })

    expect(wrapper.get('[data-testid="artist-panel"]').text()).toContain('Vera Lynn')
    expect(wrapper.get('[data-testid="artist-representative-works"]').text()).toContain("We'll Meet Again")
    expect(wrapper.get('[data-testid="linked-artist-cards"]').text()).toContain('Glenn Miller')

    await wrapper.get('[data-testid="tab-sources"]').trigger('click')

    const wellMeetAgainCard = wrapper.findAll('.audio-card').find((card) => card.text().includes("We'll Meet Again"))

    expect(wrapper.text()).toContain("We'll Meet Again")
    expect(wellMeetAgainCard?.find('audio').exists()).toBe(false)
    expect(wellMeetAgainCard?.text()).toContain('Archive record only')
    expect(wellMeetAgainCard?.text()).toContain('Open archive record')
  })

  it('renders playable audio and falls back to archive copy after playback failure', async () => {
    const countryDetails = [
      { country: getCountryById('uk')!, phase: getActiveStylePhase(stylePhases, 'uk', 1947) },
    ]

    const wrapper = mount(AtlasDetailPanel, {
      props: {
        activeArtist: null,
        activeChapter: chapterScenes[4],
        activeEvent: getEventById('marshall-broadcast'),
        activeYear: 1947,
        countryDetails,
        language: 'en',
        sourceGroups: buildDetailSourceGroups({
          activeArtist: null,
          activeEvent: getEventById('marshall-broadcast'),
          countryDetails,
          activeYear: 1947,
        }),
      },
    })

    await wrapper.get('[data-testid="tab-sources"]').trigger('click')

    expect(wrapper.text()).toContain('Playable audio')
    expect(wrapper.find('audio').exists()).toBe(true)

    const audioCount = wrapper.findAll('audio').length
    await wrapper.find('audio').trigger('error')

    expect(wrapper.findAll('audio').length).toBeLessThan(audioCount)
    expect(wrapper.text()).toContain('Playback failed. Open the original record instead.')
    expect(wrapper.text()).toContain('Open archive record')
  })

  it('renders enhanced event images, musical impact, and related song cards', async () => {
    const countryDetails = [
      { country: getCountryById('fr')!, phase: getActiveStylePhase(stylePhases, 'fr', 1944) },
    ]

    const activeEvent = getEventById('liberation-paris')
    const wrapper = mount(AtlasDetailPanel, {
      props: {
        activeArtist: null,
        activeChapter: chapterScenes[3],
        activeEvent,
        activeYear: 1944,
        countryDetails,
        language: 'en',
        sourceGroups: buildDetailSourceGroups({
          activeArtist: null,
          activeEvent,
          countryDetails,
          activeYear: 1944,
        }),
      },
    })

    expect(wrapper.get('img').attributes('src')).toBe('/images/events/liberation-paris.webp')
    expect(wrapper.get('figcaption').text()).toContain('Champs Elysees')
    expect(wrapper.get('[data-testid="event-music-impact"]').text()).toContain('jazz-club revival')
    expect(wrapper.get('[data-testid="event-related-songs"]').text()).toContain('La Marseillaise')
    expect(wrapper.get('[data-testid="event-related-songs"]').text()).toContain('Context')
    expect(wrapper.get('[data-testid="event-related-songs"]').text()).toContain('Event relation')
    expect(wrapper.get('[data-testid="event-related-songs"]').text()).toContain('Listening guide')
    expect(wrapper.get('[data-testid="event-related-songs"]').text()).toContain('Rights')
    expect(wrapper.find('audio').exists()).toBe(true)

    const sourceAudioEvents: CustomEvent[] = []
    const handler = (event: Event) => sourceAudioEvents.push(event as CustomEvent)
    window.addEventListener(SOURCE_AUDIO_STATE_EVENT, handler)
    await wrapper.find('audio').trigger('play')
    window.removeEventListener(SOURCE_AUDIO_STATE_EVENT, handler)

    expect(sourceAudioEvents.at(-1)?.detail.active).toBe(true)

    const audioCount = wrapper.findAll('audio').length
    await wrapper.find('audio').trigger('error')

    expect(wrapper.findAll('audio')).toHaveLength(audioCount - 1)
    expect(wrapper.text()).toContain('Playback failed. Use the source link instead.')

    await wrapper.get('[data-testid="tab-sources"]').trigger('click')

    expect(wrapper.text()).toContain('Related song')
    expect(wrapper.text()).toContain('Internet Archive')
    expect(wrapper.text()).toContain('Public domain local playback')
  })

  it('opens the methodology dialog with bibliography sections', async () => {
    const countryDetails = [
      { country: getCountryById('fr')!, phase: getActiveStylePhase(stylePhases, 'fr', 1947) },
    ]

    const wrapper = mount(AtlasDetailPanel, {
      props: {
        activeArtist: null,
        activeChapter: chapterScenes[4],
        activeEvent: getEventById('marshall-broadcast'),
        activeYear: 1947,
        countryDetails,
        language: 'en',
        sourceGroups: buildDetailSourceGroups({
          activeArtist: null,
          activeEvent: getEventById('marshall-broadcast'),
          countryDetails,
          activeYear: 1947,
        }),
      },
    })

    await wrapper.get('[data-testid="bibliography-open"]').trigger('click')

    expect(wrapper.get('[data-testid="bibliography-dialog"]').text()).toContain('Source Check and Bibliography')
    expect(wrapper.get('[data-testid="bibliography-dialog"]').text()).toContain('Main Archives and Collections')
    expect(wrapper.get('[data-testid="bibliography-dialog"]').text()).toContain('archive-record link')
  })
})
