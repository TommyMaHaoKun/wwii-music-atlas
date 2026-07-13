import type { Feature, FeatureCollection } from 'geojson'
import { publicAssetPath } from '@/lib/publicAssets'

// Period-accurate political borders from the historical-basemaps project
// (github.com/aourednik/historical-basemaps, GPL-3.0). Two clean snapshots
// cover the 1931-1949 timeline: 1938 (pre/early war) and 1945 (end of war).
export type SnapshotYear = 1938 | 1945

export function pickSnapshotYear(year: number): SnapshotYear {
  return year >= 1945 ? 1945 : 1938
}

const cache = new Map<SnapshotYear, Feature[]>()
const pending = new Map<SnapshotYear, Promise<Feature[]>>()

export function loadHistoricalBorders(snapshot: SnapshotYear): Promise<Feature[]> {
  const cached = cache.get(snapshot)
  if (cached) {
    return Promise.resolve(cached)
  }

  const inflight = pending.get(snapshot)
  if (inflight) {
    return inflight
  }

  const promise = fetch(publicAssetPath(`/geo/borders_${snapshot}.json`))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load historical borders for ${snapshot}`)
      }

      return response.json() as Promise<FeatureCollection>
    })
    .then((collection) => {
      const features = collection.features ?? []
      cache.set(snapshot, features)
      pending.delete(snapshot)
      return features
    })
    .catch((error) => {
      pending.delete(snapshot)
      throw error
    })

  pending.set(snapshot, promise)
  return promise
}

// Map a historical polygon's NAME to one of the eight tracked country ids.
// Names differ between snapshots (e.g. "Empire of Japan" in 1938 vs
// "Japan (USA)" in 1945, "Chinese warlords" vs "China"), and 1945 Germany is
// split into occupation zones ("Germany (Soviet)", ...) — all handled here.
export function matchHistoricalCountryId(name: string | null | undefined): string | null {
  if (!name) {
    return null
  }

  const value = name.trim().toLowerCase()

  if (value === 'united states') return 'us'
  if (value.startsWith('united kingdom')) return 'uk'
  if (value === 'germany' || value.startsWith('germany (')) return 'de'
  if (value === 'ussr') return 'su'
  if (value === 'france') return 'fr'
  if (value === 'italy') return 'it'
  if (value === 'empire of japan' || value.startsWith('japan')) return 'jp'
  if (value === 'china' || value === 'chinese warlords') return 'cn'

  return null
}
