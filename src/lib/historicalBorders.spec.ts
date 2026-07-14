import { describe, expect, it } from 'vitest'
import type { FeatureCollection } from 'geojson'
import { matchHistoricalCountryId, pickSnapshotYear, selectTrackedHistoricalFeatures } from '@/lib/historicalBorders'

describe('pickSnapshotYear', () => {
  it('uses the 1938 snapshot up to 1944 and 1945 from then on', () => {
    expect(pickSnapshotYear(1931)).toBe(1938)
    expect(pickSnapshotYear(1938)).toBe(1938)
    expect(pickSnapshotYear(1944)).toBe(1938)
    expect(pickSnapshotYear(1945)).toBe(1945)
    expect(pickSnapshotYear(1949)).toBe(1945)
  })
})

describe('matchHistoricalCountryId', () => {
  it('maps the 1938 power names to tracked country ids', () => {
    expect(matchHistoricalCountryId('United States')).toBe('us')
    expect(matchHistoricalCountryId('United Kingdom')).toBe('uk')
    expect(matchHistoricalCountryId('Germany')).toBe('de')
    expect(matchHistoricalCountryId('USSR')).toBe('su')
    expect(matchHistoricalCountryId('France')).toBe('fr')
    expect(matchHistoricalCountryId('Italy')).toBe('it')
    expect(matchHistoricalCountryId('Empire of Japan')).toBe('jp')
    expect(matchHistoricalCountryId('Chinese warlords')).toBe('cn')
  })

  it('maps the 1945 names, including occupation zones', () => {
    expect(matchHistoricalCountryId('China')).toBe('cn')
    expect(matchHistoricalCountryId('Japan (USA)')).toBe('jp')
    expect(matchHistoricalCountryId('Germany (Soviet)')).toBe('de')
    expect(matchHistoricalCountryId('Germany (UK)')).toBe('de')
    expect(matchHistoricalCountryId('United Kingdom of Great Britain and Ireland')).toBe('uk')
  })

  it('does not tint colonies or unrelated regions', () => {
    expect(matchHistoricalCountryId('French Indo-China')).toBeNull()
    expect(matchHistoricalCountryId('Italian Somaliland')).toBeNull()
    expect(matchHistoricalCountryId('British Raj')).toBeNull()
    expect(matchHistoricalCountryId('Manchuria')).toBeNull()
    expect(matchHistoricalCountryId(null)).toBeNull()
    expect(matchHistoricalCountryId('')).toBeNull()
  })
})

describe('selectTrackedHistoricalFeatures', () => {
  it('keeps only atlas countries and annotates them for constant-time lookup', () => {
    const collection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { NAME: 'Germany (Soviet)' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [0, 0], [0.2, 0.01], [0.4, 0], [0.6, 0.01], [1, 0],
              [1, 1], [0.5, 1.01], [0, 1], [0, 0],
            ]],
          },
        },
        {
          type: 'Feature',
          properties: { NAME: 'Spain' },
          geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [0, 0]]] },
        },
      ],
    } as FeatureCollection

    const features = selectTrackedHistoricalFeatures(collection)

    expect(features).toHaveLength(1)
    expect(features[0]?.properties.__atlasCountryId).toBe('de')
    expect(features[0]?.geometry.type).toBe('Polygon')
    if (features[0]?.geometry.type === 'Polygon') {
      expect(features[0].geometry.coordinates[0]!.length).toBeLessThan(9)
      expect(features[0].geometry.coordinates[0]![0]).toEqual(features[0].geometry.coordinates[0]!.at(-1))
    }
  })
})
