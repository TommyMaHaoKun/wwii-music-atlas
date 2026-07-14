import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import TrainingDataShowcase from '@/views/TrainingDataShowcase.vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { methodSections } from '@/data/researchContent'

describe('TrainingDataShowcase', () => {
  beforeEach(async () => {
    const atlas = useAtlasState()
    await atlas.setLanguage('zh')
  })

  it('presents one research-method chapter at a time', async () => {
    const wrapper = mount(TrainingDataShowcase)
    await flushPromises()

    expect(wrapper.get('[data-testid="training-data-page"]').text()).toContain('数字研究方法')
    expect(wrapper.text()).toContain('365段音频是实验库存')
    expect(wrapper.findAll('.research-index button')).toHaveLength(methodSections.length)

    await wrapper.findAll('.research-index button')[1].trigger('click')
    expect(wrapper.text()).toContain('时间与版本筛选')
    expect(wrapper.text()).toContain('当前音频是战时原声')
  })

  it('renders the method record in English', async () => {
    const atlas = useAtlasState()
    await atlas.setLanguage('en')
    const wrapper = mount(TrainingDataShowcase)
    await flushPromises()

    expect(wrapper.text()).toContain('DIGITAL RESEARCH METHODS')
    expect(wrapper.text()).toContain('Current material status')
    expect(wrapper.text()).toContain('experimental inventory')
  })
})
