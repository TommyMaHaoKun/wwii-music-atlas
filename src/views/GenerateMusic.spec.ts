import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GenerateMusic from '@/views/GenerateMusic.vue'
import { useAtlasState } from '@/composables/useAtlasState'

function healthResponse(autoLyricsReady = true) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue({
      ready: true,
      autoLyricsReady,
      model: 'acestep-v15-xl-sft',
      lyricModel: autoLyricsReady ? 'acestep-5Hz-lm-4B' : null,
    }),
  }
}

describe('GenerateMusic', () => {
  beforeEach(async () => {
    await useAtlasState().setLanguage('zh')
    vi.unstubAllGlobals()
  })

  it('defaults to self-hosted automatic lyric generation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(healthResponse()))
    const wrapper = mount(GenerateMusic)
    await flushPromises()

    expect(wrapper.text()).toContain('自动写词并演唱')
    expect(wrapper.text()).toContain('由 ACE-Step 5Hz LM 创作')
    expect(wrapper.find('#vocal-language').exists()).toBe(true)
    expect(wrapper.find('#music-lyrics').exists()).toBe(false)
    expect(wrapper.get('.generate-button').attributes('disabled')).toBeUndefined()
  })

  it('supports custom lyrics and instrumental modes explicitly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(healthResponse()))
    const wrapper = mount(GenerateMusic)
    await flushPromises()

    const modeButtons = wrapper.findAll('.mode-row button')
    await modeButtons[1].trigger('click')
    expect(wrapper.find('#music-lyrics').exists()).toBe(true)
    expect(wrapper.get('.generate-button').attributes('disabled')).toBeDefined()

    await wrapper.get('#music-lyrics').setValue('[Verse]\nOriginal words')
    expect(wrapper.get('.generate-button').attributes('disabled')).toBeUndefined()

    await modeButtons[2].trigger('click')
    expect(wrapper.find('#music-lyrics').exists()).toBe(false)
    expect(wrapper.find('#vocal-language').exists()).toBe(false)
  })

  it('does not offer automatic lyrics until the local lyric model is ready', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(healthResponse(false)))
    const wrapper = mount(GenerateMusic)
    await flushPromises()

    expect(wrapper.text()).toContain('自动写词模型仍在启动')
    expect(wrapper.get('.generate-button').attributes('disabled')).toBeDefined()
  })
})
