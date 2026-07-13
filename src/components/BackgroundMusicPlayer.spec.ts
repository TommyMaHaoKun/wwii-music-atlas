import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BackgroundMusicPlayer from '@/components/BackgroundMusicPlayer.vue'
import type { BackgroundTrack } from '@/data/ww2MusicAtlas'
import { SOURCE_AUDIO_STATE_EVENT } from '@/lib/audioBus'

const tracks: BackgroundTrack[] = [
  {
    id: 'alpha',
    titleZh: '甲曲',
    titleEn: 'Alpha Track',
    countryId: 'us',
    yearLabel: '1941',
    src: '/audio/background/alpha.ogg',
    sourceUrl: 'https://example.com/alpha',
    licenseLabel: 'Public domain',
    licenseUrl: 'https://example.com/license',
    credit: 'Archive A',
    noteZh: '甲',
    noteEn: 'Alpha',
    sensitivity: 'patriotic',
  },
  {
    id: 'beta',
    titleZh: '乙曲',
    titleEn: 'Beta Track',
    countryId: 'uk',
    yearLabel: '1942',
    src: '/audio/background/beta.ogg',
    sourceUrl: 'https://example.com/beta',
    licenseLabel: 'Public domain',
    licenseUrl: 'https://example.com/license',
    credit: 'Archive B',
    noteZh: '乙',
    noteEn: 'Beta',
    sensitivity: 'neutral',
  },
]

let playMock: ReturnType<typeof vi.fn>
let pauseMock: ReturnType<typeof vi.fn>
let loadMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  playMock = vi.fn().mockResolvedValue(undefined)
  pauseMock = vi.fn()
  loadMock = vi.fn()

  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: playMock,
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: pauseMock,
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    configurable: true,
    value: loadMock,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('BackgroundMusicPlayer', () => {
  it('attempts playback after the first interaction', async () => {
    const wrapper = mount(BackgroundMusicPlayer, {
      props: {
        language: 'en',
        tracks,
      },
    })

    window.dispatchEvent(new Event('pointerdown'))
    await flushPromises()
    await nextTick()

    expect(playMock).toHaveBeenCalled()

    const stateEvents = wrapper.emitted('state-change') ?? []
    expect(stateEvents[stateEvents.length - 1]?.[0]).toMatchObject({
      trackId: 'alpha',
      countryId: 'us',
      isPlaying: true,
    })
  })

  it('does not auto-resume after the listener manually pauses playback', async () => {
    const wrapper = mount(BackgroundMusicPlayer, {
      props: {
        language: 'en',
        tracks,
      },
    })

    await wrapper.get('[data-testid="background-player-toggle"]').trigger('click')
    await flushPromises()
    await nextTick()
    await wrapper.get('[data-testid="background-player-toggle"]').trigger('click')
    await flushPromises()
    await nextTick()

    expect(pauseMock).toHaveBeenCalled()
    expect(wrapper.get('[data-testid="background-player-status"]').text()).toContain('Paused by listener')

    window.dispatchEvent(new CustomEvent(SOURCE_AUDIO_STATE_EVENT, { detail: { active: false, clipId: 'marshall' } }))
    await flushPromises()

    expect(wrapper.get('[data-testid="background-player-status"]').text()).toContain('Paused by listener')
  })

  it('moves to the next track after the current one ends', async () => {
    const wrapper = mount(BackgroundMusicPlayer, {
      props: {
        language: 'en',
        tracks,
      },
    })

    expect(wrapper.get('[data-testid="background-player-track"]').text()).toContain('Alpha Track')

    await wrapper.find('audio').trigger('ended')

    expect(wrapper.get('[data-testid="background-player-track"]').text()).toContain('Beta Track')
  })

  it('skips an unavailable track and shows a fallback notice', async () => {
    const wrapper = mount(BackgroundMusicPlayer, {
      props: {
        language: 'en',
        tracks,
      },
    })

    await wrapper.find('audio').trigger('error')

    expect(wrapper.get('[data-testid="background-player-track"]').text()).toContain('Beta Track')
    expect(wrapper.get('[data-testid="background-player-notice"]').text()).toContain('Skipped an unavailable background track.')
  })

  it('pauses when a source audio clip starts playing', async () => {
    mount(BackgroundMusicPlayer, {
      props: {
        language: 'en',
        tracks,
      },
    })

    window.dispatchEvent(new Event('pointerdown'))
    await Promise.resolve()

    window.dispatchEvent(new CustomEvent(SOURCE_AUDIO_STATE_EVENT, { detail: { active: true, clipId: 'source-clip' } }))
    await Promise.resolve()

    expect(pauseMock).toHaveBeenCalled()
  })
})
