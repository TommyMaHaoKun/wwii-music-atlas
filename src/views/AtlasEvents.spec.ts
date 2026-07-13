import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AtlasEvents from '@/views/AtlasEvents.vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { SOURCE_AUDIO_STATE_EVENT } from '@/lib/audioBus'

vi.mock('@/components/GlobeStage.vue', () => ({
  __esModule: true,
  default: {
    name: 'GlobeStage',
    props: [
      'activeYear',
      'countries',
      'enabledLayers',
      'events',
      'focusPose',
      'language',
      'selectedArtistId',
      'selectedCountryIds',
    ],
    template: '<div data-testid="globe-stage" />',
  },
}))

describe('AtlasEvents', () => {
  beforeEach(async () => {
    const atlas = useAtlasState()

    await atlas.setLanguage('en')
    await atlas.selectEvent('rome-berlin-axis')
  })

  it('renders expanded related song research cards with local playback for every song', async () => {
    const wrapper = mount(AtlasEvents)

    await flushPromises()

    const songs = wrapper.get('[data-testid="event-related-songs"]')
    const fischiaCard = wrapper.findAll('.song-card').find((card) => card.text().includes('Fischia il vento'))
    const faccettaCard = wrapper.findAll('.song-card').find((card) => card.text().includes('Faccetta Nera'))
    const cards = wrapper.findAll('[data-testid="event-related-songs"] .song-card')

    expect(songs.text()).toContain('Context')
    expect(songs.text()).toContain('Event relation')
    expect(songs.text()).toContain('Listening guide')
    expect(songs.text()).toContain('Rights')
    expect(cards).toHaveLength(3)
    expect(cards.every((card) => card.text().includes('Local playback'))).toBe(true)
    expect(cards.every((card) => card.find('audio').exists())).toBe(true)
    expect(fischiaCard?.text()).toContain('Local playback')
    expect(fischiaCard?.find('audio').attributes('src')).toBe('/audio/events/fischia-il-vento.ogg')
    expect(faccettaCard?.text()).toContain('Sensitive historical material')
    expect(faccettaCard?.find('audio').attributes('src')).toBe('/audio/events/faccetta-nera.mp3')
  })

  it('dispatches source-audio state and falls back to source links after song playback errors', async () => {
    const wrapper = mount(AtlasEvents)

    await flushPromises()

    const dispatchedEvents: CustomEvent[] = []
    const handler = (event: Event) => dispatchedEvents.push(event as CustomEvent)
    const audio = wrapper.get('audio')
    const audioCount = wrapper.findAll('audio').length

    window.addEventListener(SOURCE_AUDIO_STATE_EVENT, handler)
    await audio.trigger('play')
    await audio.trigger('error')
    window.removeEventListener(SOURCE_AUDIO_STATE_EVENT, handler)

    expect(dispatchedEvents[0].detail.active).toBe(true)
    expect(dispatchedEvents.at(-1)?.detail.active).toBe(false)
    expect(wrapper.findAll('audio')).toHaveLength(audioCount - 1)
    expect(wrapper.text()).toContain('Playback failed. Use the source link instead.')
  })
})
