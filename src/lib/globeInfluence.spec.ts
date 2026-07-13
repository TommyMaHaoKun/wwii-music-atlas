import { describe, expect, it } from 'vitest'
import type { CountryProfile, InfluenceArc } from '@/data/ww2MusicAtlas'
import {
  buildInfluenceLabels,
  buildInfluenceRenderArcs,
  calculateBearing,
  selectPrimaryInfluenceLabelIds,
} from '@/lib/globeInfluence'

const countries: CountryProfile[] = [
  { id: 'us', nameZh: '美国', nameEn: 'United States', lat: 38.9, lng: -77, region: 'North America', color: '#c98f58' },
  { id: 'uk', nameZh: '英国', nameEn: 'United Kingdom', lat: 51.5, lng: -0.1, region: 'Europe', color: '#94b4c7' },
  { id: 'jp', nameZh: '日本', nameEn: 'Japan', lat: 35.7, lng: 139.7, region: 'East Asia', color: '#b66b68' },
]

const arcs: InfluenceArc[] = [
  {
    sourceCountryId: 'us',
    targetCountryId: 'uk',
    startYear: 1941,
    endYear: 1949,
    reasonZh: '盟军基地与唱片输入英国。',
    reasonEn: 'Allied bases and records flowed into Britain.',
    weight: 0.92,
  },
  {
    sourceCountryId: 'us',
    targetCountryId: 'jp',
    startYear: 1945,
    endYear: 1949,
    reasonZh: '占领期广播重塑日本流行框架。',
    reasonEn: 'Occupation radio reshaped Japan pop.',
    weight: 0.95,
  },
]

describe('globe influence rendering helpers', () => {
  it('derives render arcs with localized labels and arrow placement', () => {
    const renderArcs = buildInfluenceRenderArcs(arcs, countries, 'en')

    expect(renderArcs).toHaveLength(2)
    expect(renderArcs[0]).toMatchObject({
      id: 'us-uk-1941-1949',
      shortLabel: 'United States -> United Kingdom',
      reason: 'Allied bases and records flowed into Britain.',
      startLat: 38.9,
      endLng: -0.1,
    })
    expect(renderArcs[0].arrowLat).toBeGreaterThan(40)
    expect(renderArcs[0].altitude).toBeGreaterThan(0.17)
  })

  it('keeps the highest-weight influence labels as primary', () => {
    const renderArcs = buildInfluenceRenderArcs(arcs, countries, 'en')

    expect(selectPrimaryInfluenceLabelIds(renderArcs, 1)).toEqual(['us-jp-1945-1949'])
  })

  it('adds active non-primary labels without showing every route', () => {
    const renderArcs = buildInfluenceRenderArcs(arcs, countries, 'zh')
    const labels = buildInfluenceLabels(renderArcs, 'us-uk-1941-1949', null, 1)

    expect(labels).toHaveLength(2)
    expect(labels.some((label) => label.shortLabel === '美国 -> 英国' && label.isActive)).toBe(true)
    expect(labels.some((label) => label.shortLabel === '美国 -> 日本' && label.isPrimary)).toBe(true)
  })

  it('calculates an eastbound bearing for transatlantic influence', () => {
    const bearing = calculateBearing({ lat: 38.9, lng: -77 }, { lat: 51.5, lng: -0.1 })

    expect(bearing).toBeGreaterThan(35)
    expect(bearing).toBeLessThan(65)
  })
})
