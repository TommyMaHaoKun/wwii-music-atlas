import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import AtlasCountries from '@/views/AtlasCountries.vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { SOURCE_AUDIO_STATE_EVENT } from '@/lib/audioBus'

describe('AtlasCountries', () => {
  beforeEach(async () => {
    const atlas = useAtlasState()

    await atlas.setLanguage('en')
    await atlas.setMode('explore')
    atlas.selectedCountryIds.value = ['us']
    await atlas.setYear(1942)
  })

  it('renders expanded historical style copy and representative local playback', async () => {
    const wrapper = mount(AtlasCountries)

    await flushPromises()

    const history = wrapper.get('[data-testid="country-phase-history"]')
    const songs = wrapper.get('[data-testid="country-representative-songs"]')

    expect(history.text()).toContain('Pearl Harbor')
    expect(songs.text()).toContain('Listening Evidence')
    expect(songs.text()).toContain('Coming in on a Wing and a Prayer')
    expect(songs.text()).toContain('Event link')
    expect(songs.text()).toContain('Listening cue')
    expect(songs.text()).toContain('Local playback')
    expect(songs.find('audio').attributes('src')).toBe('/audio/events/coming-in-on-a-wing-and-a-prayer.mp3')
  })

  it('dispatches source-audio state and falls back to links after playback errors', async () => {
    const wrapper = mount(AtlasCountries)

    await flushPromises()

    const dispatchedEvents: CustomEvent[] = []
    const handler = (event: Event) => dispatchedEvents.push(event as CustomEvent)
    const audio = wrapper.get('audio')

    window.addEventListener(SOURCE_AUDIO_STATE_EVENT, handler)
    await audio.trigger('play')
    await audio.trigger('error')
    window.removeEventListener(SOURCE_AUDIO_STATE_EVENT, handler)

    expect(dispatchedEvents[0].detail.active).toBe(true)
    expect(dispatchedEvents.at(-1)?.detail.active).toBe(false)
    expect(wrapper.find('audio').exists()).toBe(false)
    expect(wrapper.text()).toContain('Playback failed. Use the source link instead.')
  })
})
