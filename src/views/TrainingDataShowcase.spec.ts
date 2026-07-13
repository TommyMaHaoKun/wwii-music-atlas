import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import TrainingDataShowcase from '@/views/TrainingDataShowcase.vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { SOURCE_AUDIO_STATE_EVENT } from '@/lib/audioBus'

describe('TrainingDataShowcase', () => {
  beforeEach(async () => {
    const atlas = useAtlasState()
    await atlas.setLanguage('zh')
  })

  it('renders the workflow and dataset metrics in Chinese', async () => {
    const wrapper = mount(TrainingDataShowcase)

    await flushPromises()

    expect(wrapper.get('[data-testid="training-data-page"]').text()).toContain('AI 训练数据小实验')
    expect(wrapper.get('[data-testid="training-workflow"]').text()).toContain('输入清点')
    expect(wrapper.findAll('[data-testid="training-metric"]')).toHaveLength(5)
    expect(wrapper.get('[data-testid="fine-tune-section"]').text()).toContain('用 ACE-Step 1.5 微调二战音乐风格')
    expect(wrapper.findAll('[data-testid="fine-tune-highlight"]')).toHaveLength(4)
    expect(wrapper.findAll('[data-testid="fine-tune-step"]')).toHaveLength(6)
    expect(wrapper.text()).toContain('365')
    expect(wrapper.text()).toContain('ACE 样本')
  })

  it('renders the workflow and samples in English', async () => {
    const atlas = useAtlasState()
    await atlas.setLanguage('en')

    const wrapper = mount(TrainingDataShowcase)

    await flushPromises()

    expect(wrapper.text()).toContain('My AI Data Experiment')
    expect(wrapper.text()).toContain('Input inventory')
    expect(wrapper.text()).toContain('Fine-tuning ACE-Step 1.5')
    expect(wrapper.text()).toContain('ACE samples')
    expect(wrapper.findAll('[data-testid="training-sample"]')).toHaveLength(8)
  })

  it('renders public asset paths for training audio, figures, and fine-tune screenshots', async () => {
    const wrapper = mount(TrainingDataShowcase)

    await flushPromises()

    expect(wrapper.get('audio').attributes('src')).toBe(`${import.meta.env.BASE_URL}audio/training-samples/song-of-the-guerrillas.ogg`)
    expect(wrapper.get('[data-testid="training-figure"] img').attributes('src')).toBe(`${import.meta.env.BASE_URL}images/training-data/audio_duration_distribution.png`)
    expect(wrapper.get('[data-testid="fine-tune-step"] img').attributes('src')).toBe(`${import.meta.env.BASE_URL}images/fine_tune_image/step1.png`)
  })

  it('marks sensitive German and Japanese samples before playback', async () => {
    const atlas = useAtlasState()
    await atlas.setLanguage('en')

    const wrapper = mount(TrainingDataShowcase)

    await flushPromises()

    const labels = wrapper.findAll('[data-testid="sensitive-sample-label"]').map((label) => label.text())

    expect(labels).toHaveLength(2)
    expect(labels).toContain('Sensitive historical material: Nazi material')
    expect(labels).toContain('Sensitive historical material: Japanese militarism')
  })

  it('dispatches source audio events and falls back after preview errors', async () => {
    const wrapper = mount(TrainingDataShowcase)

    await flushPromises()

    const dispatchedEvents: CustomEvent[] = []
    const handler = (event: Event) => dispatchedEvents.push(event as CustomEvent)
    const audio = wrapper.get('audio')
    const audioCount = wrapper.findAll('audio').length

    window.addEventListener(SOURCE_AUDIO_STATE_EVENT, handler)
    await audio.trigger('play')
    await audio.trigger('error')
    window.removeEventListener(SOURCE_AUDIO_STATE_EVENT, handler)
    await flushPromises()

    expect(dispatchedEvents[0].detail).toMatchObject({ active: true, clipId: 'CN_0002_clip001' })
    expect(dispatchedEvents.at(-1)?.detail).toMatchObject({ active: false, clipId: 'CN_0002_clip001' })
    expect(wrapper.findAll('audio')).toHaveLength(audioCount - 1)
    expect(wrapper.get('[data-testid="training-audio-error"]').text()).toContain('预览音频不可用')
  })
})
