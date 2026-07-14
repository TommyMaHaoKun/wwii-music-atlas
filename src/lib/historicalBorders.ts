import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson'
import { publicAssetPath } from '@/lib/publicAssets'

// Period-accurate political borders from the historical-basemaps project
// (github.com/aourednik/historical-basemaps, GPL-3.0). Two clean snapshots
// cover the 1931-1949 timeline: 1938 (pre/early war) and 1945 (end of war).
export type SnapshotYear = 1938 | 1945

export function pickSnapshotYear(year: number): SnapshotYear {
  return year >= 1945 ? 1945 : 1938
}

export interface HistoricalBorderProperties {
  NAME?: string
  __atlasCountryId: string
}

export type HistoricalBorderFeature = Feature<Polygon | MultiPolygon, HistoricalBorderProperties>

const cache = new Map<SnapshotYear, HistoricalBorderFeature[]>()
const pending = new Map<SnapshotYear, Promise<HistoricalBorderFeature[]>>()
const SIMPLIFICATION_TOLERANCE_DEGREES = 0.25

function squaredSegmentDistance(point: Position, start: Position, end: Position) {
  let x = start[0] ?? 0
  let y = start[1] ?? 0
  let dx = (end[0] ?? 0) - x
  let dy = (end[1] ?? 0) - y

  if (dx !== 0 || dy !== 0) {
    const projection = (((point[0] ?? 0) - x) * dx + ((point[1] ?? 0) - y) * dy) / (dx * dx + dy * dy)
    if (projection > 1) {
      x = end[0] ?? 0
      y = end[1] ?? 0
    } else if (projection > 0) {
      x += dx * projection
      y += dy * projection
    }
  }

  dx = (point[0] ?? 0) - x
  dy = (point[1] ?? 0) - y
  return dx * dx + dy * dy
}

function simplifyRing(ring: Position[], tolerance = SIMPLIFICATION_TOLERANCE_DEGREES) {
  if (ring.length <= 6) {
    return ring
  }

  const first = ring[0]
  const last = ring[ring.length - 1]
  const isClosed = first?.[0] === last?.[0] && first?.[1] === last?.[1]
  const points = isClosed ? ring.slice(0, -1) : ring.slice()
  if (points.length <= 3) {
    return ring
  }

  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1
  const threshold = tolerance * tolerance
  const stack: Array<[number, number]> = [[0, points.length - 1]]

  while (stack.length) {
    const [startIndex, endIndex] = stack.pop()!
    let furthestIndex = -1
    let furthestDistance = threshold

    for (let index = startIndex + 1; index < endIndex; index += 1) {
      const distance = squaredSegmentDistance(points[index]!, points[startIndex]!, points[endIndex]!)
      if (distance > furthestDistance) {
        furthestDistance = distance
        furthestIndex = index
      }
    }

    if (furthestIndex >= 0) {
      keep[furthestIndex] = 1
      stack.push([startIndex, furthestIndex], [furthestIndex, endIndex])
    }
  }

  const simplified = points.filter((_, index) => keep[index])
  if (simplified.length < 3) {
    return ring
  }

  if (isClosed) {
    simplified.push([...simplified[0]!])
  }
  return simplified
}

function simplifyGeometry(geometry: Polygon | MultiPolygon): Polygon | MultiPolygon {
  if (geometry.type === 'Polygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((ring) => simplifyRing(ring)),
    }
  }

  return {
    ...geometry,
    coordinates: geometry.coordinates.map((polygon) =>
      polygon.map((ring) => simplifyRing(ring)),
    ),
  }
}

// Only the eight countries covered by this atlas need interactive polygons.
// The base texture still provides the rest of the world's land and coastline;
// the retained borders are simplified to the resolution visible on the globe.
export function selectTrackedHistoricalFeatures(collection: FeatureCollection): HistoricalBorderFeature[] {
  return (collection.features ?? []).flatMap((feature) => {
    const properties = feature.properties as { NAME?: string } | null
    const countryId = matchHistoricalCountryId(properties?.NAME)
    if (!countryId) {
      return []
    }

    if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
      return []
    }

    return [{
      ...feature,
      geometry: simplifyGeometry(feature.geometry),
      properties: {
        ...(properties ?? {}),
        __atlasCountryId: countryId,
      },
    }]
  })
}

export function loadHistoricalBorders(snapshot: SnapshotYear): Promise<HistoricalBorderFeature[]> {
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
      const features = selectTrackedHistoricalFeatures(collection)
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

export function preloadHistoricalBorders(snapshot: SnapshotYear) {
  return loadHistoricalBorders(snapshot).then(() => undefined).catch(() => undefined)
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
