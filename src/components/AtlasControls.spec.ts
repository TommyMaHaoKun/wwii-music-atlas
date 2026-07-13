import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AtlasControls from '@/components/AtlasControls.vue'
import { chapterScenes, countries } from '@/lib/atlas'

describe('AtlasControls', () => {
  it('renders bilingual copy and emits language updates', async () => {
    const wrapper = mount(AtlasControls, {
      props: {
        activeChapterId: chapterScenes[0].id,
        activeMode: 'story',
        chapters: chapterScenes,
        countries,
        enabledLayers: ['styles', 'events', 'influence'],
        language: 'zh',
        selectedCountryIds: ['de', 'jp'],
      },
    })

    expect(wrapper.text()).toContain('我用 AI 做的二战音乐地图')

    await wrapper.get('[data-testid="language-en"]').trigger('click')

    expect(wrapper.emitted('update:language')?.[0]).toEqual(['en'])
  })
})
