import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import AtlasCountries from '@/views/AtlasCountries.vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { regionScenes } from '@/data/researchContent'
import { navigateTo } from '@/router'

describe('AtlasCountries', () => {
  beforeEach(async () => {
    const atlas = useAtlasState()
    await atlas.setLanguage('en')
    await navigateTo({ path: '/countries', query: { region: 'us', lang: 'en' } })
  })

  it('renders one evidence-based regional scene at a time', async () => {
    const wrapper = mount(AtlasCountries)
    await flushPromises()

    expect(wrapper.text()).toContain('United States')
    expect(wrapper.text()).toContain('Political and institutional setting')
    expect(wrapper.text()).toContain('Great Migration')
    expect(wrapper.text()).toContain('S29 · U.S. National Archives')
    expect(wrapper.findAll('.research-index button')).toHaveLength(regionScenes.length)
  })

  it('changes region through the index without adding a second page of copy', async () => {
    const wrapper = mount(AtlasCountries)
    await flushPromises()

    await wrapper.findAll('.research-index button')[0].trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Wartime China had no single national style')
    expect(wrapper.findAll('.research-heading')).toHaveLength(1)
  })
})
