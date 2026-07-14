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
              [10, 50], [10.2, 50.01], [10.4, 50], [10.6, 50.01], [11, 50],
              [11, 51], [10.5, 51.01], [10, 51], [10, 50],
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

  it('removes detached overseas polygons while retaining the core country', () => {
    const collection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { NAME: 'France' },
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [[
                [2, 46], [4, 46], [4, 48], [2, 48], [2, 46],
              ]],
              [[
                [-62, 15], [-61, 15], [-61, 16], [-62, 16], [-62, 15],
              ]],
              [[
                [2.1, 46.1], [2.15, 46.1], [2.15, 46.15], [2.1, 46.15], [2.1, 46.1],
              ]],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { NAME: 'Italy' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [45, -10], [46, -10], [46, -9], [45, -9], [45, -10],
            ]],
          },
        },
      ],
    } as FeatureCollection

    const features = selectTrackedHistoricalFeatures(collection)

    expect(features).toHaveLength(1)
    expect(features[0]?.properties.__atlasCountryId).toBe('fr')
    expect(features[0]?.geometry.type).toBe('MultiPolygon')
    if (features[0]?.geometry.type === 'MultiPolygon') {
      expect(features[0].geometry.coordinates).toHaveLength(1)
    }
  })

  it('does not render the misleading China, United States or USSR overlays', () => {
    const collection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { NAME: 'Chinese warlords' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[80, 20], [130, 20], [130, 50], [80, 50], [80, 20]]],
          },
        },
        {
          type: 'Feature',
          properties: { NAME: 'United States' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[-125, 25], [-65, 25], [-65, 50], [-125, 50], [-125, 25]]],
          },
        },
        {
          type: 'Feature',
          properties: { NAME: 'USSR' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[20, 40], [170, 40], [170, 75], [20, 75], [20, 40]]],
          },
        },
      ],
    } as FeatureCollection

    expect(selectTrackedHistoricalFeatures(collection)).toEqual([])
  })

  it('keeps the Japanese islands without the Manchurian component', () => {
    const collection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { NAME: 'Empire of Japan' },
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [[
                [135, 34], [141, 34], [141, 40], [135, 40], [135, 34],
              ]],
              [[
                [116, 34], [135, 34], [135, 53], [116, 53], [116, 34],
              ]],
            ],
          },
        },
      ],
    } as FeatureCollection

    const features = selectTrackedHistoricalFeatures(collection)

    expect(features).toHaveLength(1)
    expect(features[0]?.properties.__atlasCountryId).toBe('jp')
    expect(features[0]?.geometry.type).toBe('MultiPolygon')
    if (features[0]?.geometry.type === 'MultiPolygon') {
      expect(features[0].geometry.coordinates).toHaveLength(1)
    }
  })
})
