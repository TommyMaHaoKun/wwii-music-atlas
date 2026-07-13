import type { CountryProfile, InfluenceArc, Language } from '@/data/ww2MusicAtlas'

export interface InfluenceRenderArc {
  id: string
  sourceCountryId: string
  targetCountryId: string
  sourceName: string
  targetName: string
  sourceColor: string
  targetColor: string
  reason: string
  shortLabel: string
  tooltip: string
  weight: number
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  labelLat: number
  labelLng: number
  arrowLat: number
  arrowLng: number
  arrowBearing: number
  altitude: number
}

export interface InfluenceLabelItem {
  id: string
  type: 'influence-label'
  lat: number
  lng: number
  altitude: number
  sourceName: string
  targetName: string
  sourceColor: string
  targetColor: string
  reason: string
  shortLabel: string
  isPrimary: boolean
  isActive: boolean
}

const toRad = (degrees: number) => (degrees * Math.PI) / 180
const toDeg = (radians: number) => (radians * 180) / Math.PI

function getCountryDisplayName(country: CountryProfile, language: Language) {
  return language === 'zh' ? country.nameZh : country.nameEn
}

function toUnitVector(lat: number, lng: number) {
  const latRad = toRad(lat)
  const lngRad = toRad(lng)
  const cosLat = Math.cos(latRad)

  return {
    x: cosLat * Math.cos(lngRad),
    y: Math.sin(latRad),
    z: cosLat * Math.sin(lngRad),
  }
}

function fromUnitVector(vector: { x: number; y: number; z: number }) {
  const length = Math.hypot(vector.x, vector.y, vector.z) || 1
  const x = vector.x / length
  const y = vector.y / length
  const z = vector.z / length

  return {
    lat: toDeg(Math.asin(y)),
    lng: toDeg(Math.atan2(z, x)),
  }
}

export function interpolateGeoPoint(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  progress: number,
) {
  const startVector = toUnitVector(start.lat, start.lng)
  const endVector = toUnitVector(end.lat, end.lng)
  const clampedProgress = Math.max(0, Math.min(1, progress))

  return fromUnitVector({
    x: startVector.x * (1 - clampedProgress) + endVector.x * clampedProgress,
    y: startVector.y * (1 - clampedProgress) + endVector.y * clampedProgress,
    z: startVector.z * (1 - clampedProgress) + endVector.z * clampedProgress,
  })
}

export function calculateBearing(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
) {
  const startLat = toRad(start.lat)
  const endLat = toRad(end.lat)
  const deltaLng = toRad(end.lng - start.lng)
  const y = Math.sin(deltaLng) * Math.cos(endLat)
  const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(deltaLng)

  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

function keepLabelInReadableBand(point: { lat: number; lng: number }) {
  return {
    lat: Math.max(-58, Math.min(62, point.lat)),
    lng: point.lng,
  }
}

export function buildInfluenceRenderArcs(
  arcs: InfluenceArc[],
  countries: CountryProfile[],
  language: Language,
) {
  return arcs.flatMap((arc) => {
    const source = countries.find((country) => country.id === arc.sourceCountryId)
    const target = countries.find((country) => country.id === arc.targetCountryId)

    if (!source || !target) {
      return []
    }

    const sourceName = getCountryDisplayName(source, language)
    const targetName = getCountryDisplayName(target, language)
    const reason = language === 'zh' ? arc.reasonZh : arc.reasonEn
    const labelPoint = keepLabelInReadableBand(interpolateGeoPoint(source, target, 0.76))
    const arrowPoint = interpolateGeoPoint(source, target, 0.96)
    const arrowOrigin = interpolateGeoPoint(source, target, 0.9)
    const shortLabel = `${sourceName} -> ${targetName}`

    return [{
      id: `${arc.sourceCountryId}-${arc.targetCountryId}-${arc.startYear}-${arc.endYear}`,
      sourceCountryId: arc.sourceCountryId,
      targetCountryId: arc.targetCountryId,
      sourceName,
      targetName,
      sourceColor: source.color,
      targetColor: target.color,
      reason,
      shortLabel,
      tooltip: [
        `<div class="globe-tooltip__title">${shortLabel}</div>`,
        `<div class="globe-tooltip__meta">${arc.startYear}-${arc.endYear}</div>`,
        `<div class="globe-tooltip__copy">${reason}</div>`,
      ].join(''),
      weight: arc.weight,
      startLat: source.lat,
      startLng: source.lng,
      endLat: target.lat,
      endLng: target.lng,
      labelLat: labelPoint.lat,
      labelLng: labelPoint.lng,
      arrowLat: arrowPoint.lat,
      arrowLng: arrowPoint.lng,
      arrowBearing: calculateBearing(arrowOrigin, { lat: target.lat, lng: target.lng }),
      altitude: 0.1 + arc.weight * 0.085,
    } satisfies InfluenceRenderArc]
  })
}

export function selectPrimaryInfluenceLabelIds(arcs: InfluenceRenderArc[], limit = 2) {
  return arcs
    .slice()
    .sort((left, right) => right.weight - left.weight || left.id.localeCompare(right.id))
    .slice(0, limit)
    .map((arc) => arc.id)
}

export function buildInfluenceLabels(
  arcs: InfluenceRenderArc[],
  activeInfluenceId: string | null,
  hoveredInfluenceId: string | null,
  primaryLimit = 2,
) {
  const primaryIds = new Set(selectPrimaryInfluenceLabelIds(arcs, primaryLimit))

  return arcs
    .filter((arc) => primaryIds.has(arc.id) || arc.id === activeInfluenceId || arc.id === hoveredInfluenceId)
    .map((arc) => ({
      id: arc.id,
      type: 'influence-label' as const,
      lat: arc.labelLat,
      lng: arc.labelLng,
      altitude: arc.altitude + 0.055,
      sourceName: arc.sourceName,
      targetName: arc.targetName,
      sourceColor: arc.sourceColor,
      targetColor: arc.targetColor,
      reason: arc.reason,
      shortLabel: arc.shortLabel,
      isPrimary: primaryIds.has(arc.id),
      isActive: arc.id === activeInfluenceId || arc.id === hoveredInfluenceId,
    } satisfies InfluenceLabelItem))
}
