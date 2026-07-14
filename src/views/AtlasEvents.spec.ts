import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import AtlasEvents from '@/views/AtlasEvents.vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { researchEvents } from '@/data/researchContent'
import { navigateTo } from '@/router'

describe('AtlasEvents', () => {
  beforeEach(async () => {
    const atlas = useAtlasState()
    await atlas.setLanguage('en')
    await navigateTo({ path: '/events', query: { event: 'italy-armistice', year: 1943, lang: 'en' } })
  })

  it('renders facts, relation types, evidence limits and sources', async () => {
    const wrapper = mount(AtlasEvents)
    await flushPromises()

    expect(wrapper.text()).toContain('Italian Armistice')
    expect(wrapper.text()).toContain('Event facts')
    expect(wrapper.text()).toContain('Relation types')
    expect(wrapper.text()).toContain('Evidence boundary')
    expect(wrapper.text()).toContain('Fischia il vento')
    expect(wrapper.findAll('.research-index button')).toHaveLength(researchEvents.length)
  })

  it('switches events and keeps one active record', async () => {
    const wrapper = mount(AtlasEvents)
    await flushPromises()

    await wrapper.findAll('.research-index button')[0].trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Mukden Incident')
    expect(wrapper.text()).toContain('legal territory, military occupation')
    expect(wrapper.findAll('.research-heading')).toHaveLength(1)
  })
})
