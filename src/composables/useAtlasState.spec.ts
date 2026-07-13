import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { useAtlasState } from '@/composables/useAtlasState'
import { navigateTo } from '@/router'

describe('useAtlasState', () => {
  it('hydrates state from route query and clamps invalid years', async () => {
    const atlas = useAtlasState()

    await navigateTo({
      path: '/events',
      query: {
        year: 2999,
        event: 'pearl-harbor',
        artist: 'glenn-miller',
        countries: 'us,jp,cn',
        lang: 'en',
      },
    })
    await nextTick()

    expect(atlas.activeYear.value).toBe(1949)
    expect(atlas.activeEvent.value?.id).toBe('pearl-harbor')
    expect(atlas.activeArtist.value?.id).toBe('glenn-miller')
    expect(atlas.selectedCountryIds.value).toEqual(['us', 'jp'])
    expect(atlas.language.value).toBe('en')
  })

  it('keeps event selection, year, and countries in sync', async () => {
    const atlas = useAtlasState()

    await atlas.selectEvent('liberation-paris')
    await nextTick()

    expect(atlas.activeYear.value).toBe(1944)
    expect(atlas.activeEvent.value?.id).toBe('liberation-paris')
    expect(atlas.selectedCountryIds.value).toEqual(['fr', 'us'])
    expect(window.location.search).toContain('event=liberation-paris')
  })
})
