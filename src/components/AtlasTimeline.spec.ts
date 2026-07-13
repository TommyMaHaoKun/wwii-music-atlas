import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AtlasTimeline from '@/components/AtlasTimeline.vue'
import { countries, historicEvents, stylePhases } from '@/data/ww2MusicAtlas'

describe('AtlasTimeline', () => {
  it('emits play toggle and year update events', async () => {
    const wrapper = mount(AtlasTimeline, {
      props: {
        activeYear: 1941,
        countries,
        events: historicEvents,
        isPlaying: false,
        language: 'zh',
        maxYear: 1949,
        minYear: 1931,
        phases: stylePhases,
        selectedCountryIds: ['us', 'jp'],
      },
    })

    await wrapper.get('[data-testid="timeline-play"]').trigger('click')
    await wrapper.get('[data-testid="timeline-range"]').setValue('1944')

    expect(wrapper.emitted('toggle-play')).toHaveLength(1)
    expect(wrapper.emitted('update:year')?.[0]).toEqual([1944])
  })

  it('emits event selection when a pin is clicked', async () => {
    const wrapper = mount(AtlasTimeline, {
      props: {
        activeYear: 1941,
        countries,
        events: historicEvents,
        isPlaying: false,
        language: 'en',
        maxYear: 1949,
        minYear: 1931,
        phases: stylePhases,
        selectedCountryIds: ['us'],
      },
    })

    await wrapper.findAll('.event-pin')[0]?.trigger('click')

    expect(wrapper.emitted('select-event')?.[0]).toEqual(['mukden-incident'])
  })

  it('highlights and previews event pins from shared timeline state', async () => {
    const wrapper = mount(AtlasTimeline, {
      props: {
        activeYear: 1941,
        countries,
        events: historicEvents,
        highlightedEventId: 'pearl-harbor',
        isPlaying: true,
        language: 'en',
        maxYear: 1949,
        minYear: 1931,
        phases: stylePhases,
        selectedCountryIds: ['us'],
      },
    })

    expect(wrapper.find('.event-pin.highlighted').exists()).toBe(true)

    await wrapper.findAll('.event-pin')[0]?.trigger('pointerenter')
    await wrapper.findAll('.event-pin')[0]?.trigger('pointerleave')

    expect(wrapper.emitted('preview-event')?.[0]).toEqual(['mukden-incident'])
    expect(wrapper.emitted('preview-event')?.[1]).toEqual([null])
  })
})
