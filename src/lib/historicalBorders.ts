import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson'
import { publicAssetPath } from '@/lib/publicAssets'

// Period-accurate political borders from the historical-basemaps project
// (github.com/aourednik/historical-basemaps, GPL-3.0). Two clean snapshots
// cover the 1931-1945 timeline: 1938 (pre/early war) and 1945 (end of war).
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
const MIN_COMPONENT_BOUNDS_AREA_SQUARE_DEGREES = 0.1
const HIDDEN_COUNTRY_OVERLAYS = new Set(['cn', 'us', 'su'])

interface GeographicBounds {
  minLongitude: number
  maxLongitude: number
  minLatitude: number
  maxLatitude: number
}

// Historical-basemaps groups some overseas colonies and remote islands under
// their ruling country's NAME. Keep only polygons touching the country's core
// region so those detached pieces do not appear as unexplained colour blocks.
const CORE_COUNTRY_BOUNDS: Record<string, GeographicBounds[]> = {
  us: [
    { minLongitude: -170, maxLongitude: -60, minLatitude: 20, maxLatitude: 72 },
  ],
  uk: [
    { minLongitude: -11, maxLongitude: 3, minLatitude: 49, maxLatitude: 61 },
  ],
  de: [
    { minLongitude: 5, maxLongitude: 16, minLatitude: 47, maxLatitude: 56 },
  ],
  su: [
    { minLongitude: 18, maxLongitude: 180, minLatitude: 35, maxLatitude: 82 },
    { minLongitude: -180, maxLongitude: -165, minLatitude: 50, maxLatitude: 72 },
  ],
  fr: [
    { minLongitude: -6, maxLongitude: 10, minLatitude: 41, maxLatitude: 52 },
  ],
  it: [
    { minLongitude: 6, maxLongitude: 20, minLatitude: 35, maxLatitude: 48 },
  ],
  jp: [
    { minLongitude: 128, maxLongitude: 146, minLatitude: 30, maxLatitude: 46 },
  ],
  cn: [
    { minLongitude: 73, maxLongitude: 135, minLatitude: 18, maxLatitude: 54 },
  ],
}

function isPositionInBounds(position: Position, bounds: GeographicBounds) {
  const [longitude, latitude] = position
  return longitude >= bounds.minLongitude
    && longitude <= bounds.maxLongitude
    && latitude >= bounds.minLatitude
    && latitude <= bounds.maxLatitude
}

function polygonTouchesCoreRegion(polygon: Position[][], countryId: string) {
  const bounds = CORE_COUNTRY_BOUNDS[countryId] ?? []

  // The 1938 Japanese feature contains one very large component spanning
  // Manchuria. Its eastern edge touches Japan's bounds, so test that component
  // by its centre instead of accepting it for a single intersecting vertex.
  if (countryId === 'jp' && polygon[0]?.length) {
    const longitudes = polygon[0].map(([longitude]) => longitude)
    const latitudes = polygon[0].map(([, latitude]) => latitude)
    const centre: Position = [
      (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
      (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    ]
    return bounds.some((region) => isPositionInBounds(centre, region))
  }

  return polygon[0]?.some((position) =>
    bounds.some((region) => isPositionInBounds(position, region)),
  ) ?? false
}

function polygonIsLargeEnoughToRender(polygon: Position[][]) {
  const outerRing = polygon[0]
  if (!outerRing?.length) {
    return false
  }

  let minLongitude = Infinity
  let maxLongitude = -Infinity
  let minLatitude = Infinity
  let maxLatitude = -Infinity

  for (const [longitude, latitude] of outerRing) {
    minLongitude = Math.min(minLongitude, longitude)
    maxLongitude = Math.max(maxLongitude, longitude)
    minLatitude = Math.min(minLatitude, latitude)
    maxLatitude = Math.max(maxLatitude, latitude)
  }

  return (maxLongitude - minLongitude) * (maxLatitude - minLatitude)
    >= MIN_COMPONENT_BOUNDS_AREA_SQUARE_DEGREES
}

function shouldRetainPolygon(polygon: Position[][], countryId: string) {
  return polygonTouchesCoreRegion(polygon, countryId)
    && polygonIsLargeEnoughToRender(polygon)
}

function retainCoreCountryGeometry(
  geometry: Polygon | MultiPolygon,
  countryId: string,
): Polygon | MultiPolygon | null {
  if (geometry.type === 'Polygon') {
    return shouldRetainPolygon(geometry.coordinates, countryId) ? geometry : null
  }

  const coordinates = geometry.coordinates.filter((polygon) =>
    shouldRetainPolygon(polygon, countryId),
  )

  return coordinates.length > 0
    ? { ...geometry, coordinates }
    : null
}

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

// Only countries with useful historical shapes need interactive polygons.
// The base texture still provides the rest of the world's land and coastline;
// China, the United States and the USSR are intentionally omitted because the
// source shapes render as misleading coloured rings at globe scale.
export function selectTrackedHistoricalFeatures(collection: FeatureCollection): HistoricalBorderFeature[] {
  return (collection.features ?? []).flatMap((feature) => {
    const properties = feature.properties as { NAME?: string } | null
    const countryId = matchHistoricalCountryId(properties?.NAME)
    if (!countryId || HIDDEN_COUNTRY_OVERLAYS.has(countryId)) {
      return []
    }

    if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
      return []
    }

    const coreGeometry = retainCoreCountryGeometry(feature.geometry, countryId)
    if (!coreGeometry) {
      return []
    }

    return [{
      ...feature,
      geometry: simplifyGeometry(coreGeometry),
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
