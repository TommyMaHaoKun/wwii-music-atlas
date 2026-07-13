<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Globe from 'globe.gl'
import * as THREE from 'three'
import type { Feature } from 'geojson'
import { getArtistName, getArtistNote, getArtistRole, type ArtistWork } from '@/data/atlasMarkers'
import type { CountryProfile, GlobeFocus, HistoricEvent, Language, LayerKey } from '@/data/ww2MusicAtlas'
import { artistMarkers, getActiveStylePhase, getCountryName, getEventTitle, getStyleName, getVisibleInfluenceArcs, influenceArcs, stylePhases } from '@/lib/atlas'
import { getEventCategoryConfig, getEventCategoryLabel, type EventCategory } from '@/lib/eventIcons'
import { createEarthBumpTexture, createEarthTexture, getFeatureForCountry, getWorldCountryFeatures } from '@/lib/globeGeo'
import {
  buildInfluenceLabels,
  buildInfluenceRenderArcs,
  type InfluenceLabelItem,
  type InfluenceRenderArc,
} from '@/lib/globeInfluence'
import { publicAssetPath } from '@/lib/publicAssets'
import { getStylePaletteLabel, resolveStylePalette } from '@/lib/stylePalette'

interface GlobePin {
  id: string
  type: 'artist' | 'event'
  lat: number
  lng: number
  countryId: string
  title: string
  subtitle: string
  color: string
  glow?: string
  category?: EventCategory
  categoryLabel?: string
  iconClass?: string
  importance?: number
  eventId?: string
  isSelected?: boolean
  isPlaybackLinked?: boolean
  role?: string
  portraitSrc?: string
  portraitAlt?: string
  works?: ArtistWork[]
}

interface InfluenceArrowObject {
  id: string
  lat: number
  lng: number
  altitude: number
  bearing: number
  color: string
  glow: string
  size: number
  tooltip: string
}

interface InfluenceHitTargetItem {
  id: string
  type: 'influence-hit-target'
  lat: number
  lng: number
  altitude: number
  shortLabel: string
  reason: string
  sourceColor: string
  targetColor: string
}

type GlobeHtmlElement = GlobePin | InfluenceLabelItem | InfluenceHitTargetItem

const props = defineProps<{
  activeYear: number
  chrome?: 'full' | 'minimal'
  countries: CountryProfile[]
  enabledLayers: LayerKey[]
  events: HistoricEvent[]
  focusPose: GlobeFocus
  highlightedEventId?: string | null
  language: Language
  selectedArtistId: string | null
  selectedCountryIds: string[]
  timelinePlaying?: boolean
}>()

const emit = defineEmits<{
  'preview-event': [eventId: string | null]
  'select-artist': [artistId: string]
  'select-country': [countryId: string]
  'select-event': [eventId: string]
}>()

const container = ref<HTMLDivElement | null>(null)
const fallback = ref(false)
const activeInfluenceId = ref<string | null>(null)
const hoveredInfluenceId = ref<string | null>(null)
const worldFeatures = getWorldCountryFeatures()
const eventPinSrc = publicAssetPath('/images/generated/ww2-event-pin.png')
const artistPinSrc = publicAssetPath('/images/generated/ww2-artist-pin.png')

let globe: any = null
let resizeObserver: ResizeObserver | null = null

const visibleEvents = computed(() =>
  props.enabledLayers.includes('events')
    ? props.events.filter((event) => {
        const isHighlighted = event.id === props.highlightedEventId
        const yearMatch = isHighlighted || Math.abs(event.year - props.activeYear) <= 1
        const countryMatch =
          isHighlighted ||
          props.selectedCountryIds.length === 0 ||
          event.affectedCountryIds.some((countryId) => props.selectedCountryIds.includes(countryId))
        return yearMatch && countryMatch
      })
    : [],
)

const visibleArtists = computed(() =>
  props.enabledLayers.includes('styles')
    ? artistMarkers.filter((artist) => {
        const yearMatch = props.activeYear >= artist.startYear && props.activeYear <= artist.endYear
        const countryMatch =
          props.selectedCountryIds.length === 0 || props.selectedCountryIds.includes(artist.countryId)
        return yearMatch && countryMatch
      })
    : [],
)

const globePins = computed<GlobePin[]>(() => {
  const eventPins = visibleEvents.value.map((event) => {
    const targetCountryId = event.affectedCountryIds[0] ?? 'us'
    const categoryConfig = getEventCategoryConfig(event.category)
    const isHighlighted = event.id === props.highlightedEventId
    return {
      id: event.id,
      type: 'event' as const,
      lat: event.globeFocus.lat,
      lng: event.globeFocus.lng,
      countryId: targetCountryId,
      title: getEventTitle(event, props.language),
      subtitle: String(event.year),
      color: categoryConfig.color,
      glow: categoryConfig.glow,
      category: event.category,
      categoryLabel: getEventCategoryLabel(event.category, props.language),
      iconClass: categoryConfig.className,
      importance: Math.min(3, Math.max(1, event.affectedCountryIds.length)),
      eventId: event.id,
      isSelected: isHighlighted,
      isPlaybackLinked: isHighlighted && Boolean(props.timelinePlaying),
    }
  })

  const artistPins = visibleArtists.value.map((artist) => {
    const phase = getActiveStylePhase(stylePhases, artist.countryId, props.activeYear)
    const palette = resolveStylePalette(phase)

    return {
      id: artist.id,
      type: 'artist' as const,
      lat: artist.lat,
      lng: artist.lng,
      countryId: artist.countryId,
      title: getArtistName(artist, props.language),
      subtitle: getArtistNote(artist, props.language),
      color: palette.color,
      isSelected: props.selectedArtistId === artist.id,
      role: getArtistRole(artist, props.language),
      portraitSrc: artist.portrait.src,
      portraitAlt: props.language === 'zh' ? artist.portrait.altZh : artist.portrait.altEn,
      works: artist.representativeWorks,
    }
  })

  return [...eventPins, ...artistPins]
})

const influenceRenderArcs = computed<InfluenceRenderArc[]>(() =>
  props.enabledLayers.includes('influence')
    ? buildInfluenceRenderArcs(
        getVisibleInfluenceArcs(influenceArcs, props.activeYear, props.selectedCountryIds),
        props.countries,
        props.language,
      )
    : [],
)

const influenceLabels = computed<InfluenceLabelItem[]>(() =>
  buildInfluenceLabels(influenceRenderArcs.value, activeInfluenceId.value, hoveredInfluenceId.value),
)

const influenceHitTargets = computed<InfluenceHitTargetItem[]>(() =>
  influenceRenderArcs.value.map((arc) => ({
    id: arc.id,
    type: 'influence-hit-target',
    lat: arc.arrowLat,
    lng: arc.arrowLng,
    altitude: arc.altitude + 0.075,
    shortLabel: arc.shortLabel,
    reason: arc.reason,
    sourceColor: arc.sourceColor,
    targetColor: arc.targetColor,
  })),
)

const globeHtmlElements = computed<GlobeHtmlElement[]>(() => [
  ...globePins.value,
  ...influenceHitTargets.value,
  ...influenceLabels.value,
])

const influenceArrowObjects = computed<InfluenceArrowObject[]>(() =>
  influenceRenderArcs.value.map((arc) => ({
    id: arc.id,
    lat: arc.arrowLat,
    lng: arc.arrowLng,
    altitude: arc.altitude + 0.018,
    bearing: arc.arrowBearing,
    color: arc.targetColor,
    glow: withAlpha(arc.targetColor, 0.72),
    size: 4.6 + arc.weight * 3.2,
    tooltip: arc.tooltip,
  })),
)

function supportsWebGl() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

function hexToRgb(hexColor: string) {
  const normalized = hexColor.replace('#', '')
  const value = normalized.length === 3
    ? normalized
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    : normalized

  const parsed = Number.parseInt(value, 16)
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  }
}

function withAlpha(hexColor: string, alpha: number) {
  const rgb = hexToRgb(hexColor)
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function getCountryForFeature(feature: Feature) {
  return props.countries.find((country) => getFeatureForCountry(country.id)?.id === feature.id) ?? null
}

function getPhaseColor(country: CountryProfile) {
  const phase = getActiveStylePhase(stylePhases, country.id, props.activeYear)
  return resolveStylePalette(phase).color
}

function buildCountryTooltip(country: CountryProfile) {
  const phase = getActiveStylePhase(stylePhases, country.id, props.activeYear)
  if (!phase) {
    return getCountryName(country, props.language)
  }

  return [
    `<div class="globe-tooltip__title">${getCountryName(country, props.language)}</div>`,
    `<div class="globe-tooltip__meta">${props.activeYear}</div>`,
    `<div class="globe-tooltip__copy">${getStyleName(phase, props.language)}</div>`,
    `<div class="globe-tooltip__meta">${getStylePaletteLabel(resolveStylePalette(phase), props.language)}</div>`,
  ].join('')
}

function updateSize() {
  if (!container.value || !globe) {
    return
  }

  globe.width(container.value.clientWidth)
  globe.height(container.value.clientHeight)
}

function deterministicUnit(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453
  return value - Math.floor(value)
}

function createStarField(count: number, spread: number, size: number, opacity: number, color: string) {
  const stars = new THREE.BufferGeometry()
  const vertices = new Float32Array(count * 3)

  for (let index = 0; index < count; index += 1) {
    vertices[index * 3] = (deterministicUnit(index, 1) - 0.5) * spread
    vertices[index * 3 + 1] = (deterministicUnit(index, 2) - 0.5) * spread
    vertices[index * 3 + 2] = (deterministicUnit(index, 3) - 0.5) * spread
  }

  stars.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  return new THREE.Points(
    stars,
    new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity,
      sizeAttenuation: true,
      depthWrite: false,
    }),
  )
}

function addAtmosphereObjects() {
  if (!globe) {
    return
  }

  const scene = globe.scene()
  scene.add(createStarField(520, 2500, 1.7, 0.34, '#f3d9ac'))
  scene.add(createStarField(340, 3600, 2.5, 0.22, '#9ec7d8'))
  scene.add(createStarField(150, 4600, 3.1, 0.12, '#f6ead5'))
  scene.add(new THREE.AmbientLight('#cfbda1', 0.64))
  scene.add(new THREE.HemisphereLight('#f7d3a1', '#07121b', 0.46))

  const keyLight = new THREE.DirectionalLight('#ffd39a', 1.62)
  keyLight.position.set(-300, 190, 250)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight('#7eaec5', 0.72)
  fillLight.position.set(240, -120, -210)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight('#f6a85f', 0.9)
  rimLight.position.set(120, 90, -300)
  scene.add(rimLight)

  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(103.5, 64, 64),
      new THREE.MeshBasicMaterial({
        color: '#d9a56b',
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.075,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  )

  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(107.8, 64, 64),
      new THREE.MeshBasicMaterial({
        color: '#6fa7bd',
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.045,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  )
}

function tuneGlobeMaterial() {
  if (!globe?.globeMaterial) {
    return
  }

  const material = globe.globeMaterial()
  if (!material) {
    return
  }

  if ('shininess' in material) {
    material.shininess = 14
  }

  if ('specular' in material) {
    material.specular = new THREE.Color('#766247')
  }

  if ('color' in material) {
    material.color = new THREE.Color('#ead8ad')
  }

  if ('bumpScale' in material) {
    material.bumpScale = 4.8
  }

  material.needsUpdate = true
}

function createMarkerElement(pin: GlobePin) {
  const element = document.createElement('button')
  const title = escapeHtml(pin.title)
  const subtitle = escapeHtml(pin.subtitle)
  const categoryLabel = escapeHtml(pin.categoryLabel ?? '')
  const glow = pin.glow ?? 'rgba(201, 143, 88, 0.22)'
  const role = escapeHtml(pin.role ?? '')
  const works = pin.works?.slice(0, 2) ?? []

  element.type = 'button'
  element.className = `globe-pin globe-pin--${pin.type}`
  element.style.setProperty('--pin-color', pin.color)
  element.style.setProperty('--pin-glow', glow)
  element.setAttribute('aria-label', `${pin.title}: ${pin.categoryLabel ? `${pin.categoryLabel}, ` : ''}${pin.subtitle}`)
  if (pin.type === 'event' && pin.eventId) {
    element.setAttribute('data-testid', 'globe-event-pin')
    element.setAttribute('data-pin-id', pin.eventId)
    element.onpointerenter = () => emit('preview-event', pin.eventId ?? null)
    element.onfocus = () => emit('preview-event', pin.eventId ?? null)
    element.onpointerleave = () => emit('preview-event', null)
    element.onblur = () => emit('preview-event', null)
  }
  if (pin.isSelected) {
    element.classList.add('globe-pin--selected')
  }
  if (pin.isPlaybackLinked) {
    element.classList.add('globe-pin--playback')
  }
  if (pin.category) {
    element.classList.add(`globe-pin--${pin.category}`)
  }
  element.title = `${pin.title} - ${pin.subtitle}`
  element.innerHTML = pin.type === 'event'
    ? `
      <span class="globe-pin__pulse"></span>
      <span class="globe-pin__stem"></span>
      <span class="event-badge" data-importance="${pin.importance ?? 1}">
        <span class="event-badge__ring">
          <img src="${escapeHtml(eventPinSrc)}" alt="" loading="lazy">
        </span>
      </span>
      <span class="event-badge__year">${subtitle}</span>
      <span class="globe-pin__label">
        <small>${categoryLabel}</small>
        <strong>${title}</strong>
      </span>
    `
    : `
      <span class="globe-pin__stem"></span>
      <span class="globe-pin__head">
        <img src="${escapeHtml(artistPinSrc)}" alt="" loading="lazy">
      </span>
      <span class="globe-pin__label globe-pin__label--artist-card">
        ${pin.portraitSrc ? `<img src="${escapeHtml(pin.portraitSrc)}" alt="${escapeHtml(pin.portraitAlt ?? '')}" loading="lazy">` : ''}
        <span class="artist-card-copy">
          <strong>${title}</strong>
          <small>${subtitle}</small>
          ${role ? `<em>${role}</em>` : ''}
          ${
            works.length
              ? `<span class="artist-card-works">${works
                  .map((work) => `<b>${escapeHtml(work.title)}</b><i>${escapeHtml(work.year)}</i>`)
                  .join('')}</span>`
              : ''
          }
        </span>
      </span>
    `

  element.onclick = () => {
    if (pin.type === 'event' && pin.eventId) {
      emit('select-event', pin.eventId)
      return
    }

    if (pin.type === 'artist') {
      emit('select-artist', pin.id)
      return
    }

    emit('select-country', pin.countryId)
  }

  return element
}

function createInfluenceLabelElement(label: InfluenceLabelItem) {
  const element = document.createElement('button')
  element.type = 'button'
  element.className = [
    'influence-label',
    label.isPrimary ? 'influence-label--primary' : '',
    label.isActive ? 'influence-label--active' : '',
  ].filter(Boolean).join(' ')
  element.style.setProperty('--source-color', label.sourceColor)
  element.style.setProperty('--target-color', label.targetColor)
  element.setAttribute('data-testid', 'influence-label')
  element.setAttribute('data-influence-id', label.id)
  element.setAttribute('aria-label', `${label.shortLabel}: ${label.reason}`)
  element.title = `${label.shortLabel} - ${label.reason}`
  element.innerHTML = `
    <span class="influence-label__route">
      <b>${escapeHtml(label.sourceName)}</b>
      <i aria-hidden="true">→</i>
      <b>${escapeHtml(label.targetName)}</b>
    </span>
    <span class="influence-label__reason">${escapeHtml(label.reason)}</span>
  `
  element.onpointerenter = () => {
    hoveredInfluenceId.value = label.id
  }
  element.onfocus = () => {
    hoveredInfluenceId.value = label.id
  }
  element.onpointerleave = () => {
    hoveredInfluenceId.value = null
  }
  element.onblur = () => {
    hoveredInfluenceId.value = null
  }
  element.onclick = () => {
    activeInfluenceId.value = activeInfluenceId.value === label.id ? null : label.id
  }

  return element
}

function createHtmlElement(item: GlobeHtmlElement) {
  if (item.type === 'influence-label') {
    return createInfluenceLabelElement(item)
  }

  if (item.type === 'influence-hit-target') {
    return createInfluenceHitTargetElement(item)
  }

  return createMarkerElement(item)
}

function createInfluenceHitTargetElement(item: InfluenceHitTargetItem) {
  const element = document.createElement('button')
  element.type = 'button'
  element.className = 'influence-hit-target'
  element.style.setProperty('--source-color', item.sourceColor)
  element.style.setProperty('--target-color', item.targetColor)
  element.setAttribute('data-testid', 'influence-arrow-hit-target')
  element.setAttribute('data-influence-id', item.id)
  element.setAttribute('aria-label', `${item.shortLabel}: ${item.reason}`)
  element.onpointerenter = () => {
    hoveredInfluenceId.value = item.id
  }
  element.onfocus = () => {
    hoveredInfluenceId.value = item.id
  }
  element.onpointerleave = () => {
    hoveredInfluenceId.value = null
  }
  element.onblur = () => {
    hoveredInfluenceId.value = null
  }
  element.onclick = () => {
    activeInfluenceId.value = activeInfluenceId.value === item.id ? null : item.id
  }

  return element
}

function createInfluenceArrowObject(arrow: InfluenceArrowObject) {
  const group = new THREE.Group()
  const color = new THREE.Color(arrow.color)
  const size = arrow.size
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(size * 0.38, size * 1.12, 5, 1),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.72,
      roughness: 0.32,
      metalness: 0.08,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
    }),
  )
  cone.rotation.x = Math.PI / 2
  cone.position.z = size * 0.2
  group.add(cone)

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(size * 0.36, size * 0.58, 32),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  )
  halo.rotation.x = Math.PI / 2
  group.add(halo)

  group.userData = { id: arrow.id }
  return group
}

function setHoveredInfluence(influenceId: string | null) {
  hoveredInfluenceId.value = influenceId
}

function syncGlobe() {
  if (!globe) {
    return
  }

  const arcs = influenceRenderArcs.value.map((arc) => ({
    ...arc,
    color: [
      withAlpha(arc.sourceColor, 0.98),
      withAlpha(arc.sourceColor, 0.72),
      withAlpha(arc.targetColor, 0.34),
    ],
    dashLength: 0.16,
    dashGap: 0.48,
    stroke: 0.9 + arc.weight * 1.45,
  }))

  globe
    .polygonsData(worldFeatures)
    .polygonCapColor((feature: Feature) => {
      const country = getCountryForFeature(feature)
      if (!country) {
        return 'rgba(240, 231, 216, 0.04)'
      }

      const activeColor = getPhaseColor(country)
      const isSelected = props.selectedCountryIds.includes(country.id)
      return withAlpha(activeColor, isSelected ? 0.68 : 0.32)
    })
    .polygonSideColor((feature: Feature) => {
      const country = getCountryForFeature(feature)
      return country ? withAlpha(getPhaseColor(country), 0.16) : 'rgba(240, 231, 216, 0.02)'
    })
    .polygonStrokeColor((feature: Feature) => {
      const country = getCountryForFeature(feature)
      if (!country) {
        return 'rgba(255,255,255,0.04)'
      }

      return props.selectedCountryIds.includes(country.id)
        ? withAlpha(country.color, 0.86)
        : 'rgba(255,255,255,0.075)'
    })
    .polygonAltitude((feature: Feature) => {
      const country = getCountryForFeature(feature)
      if (!country) {
        return 0.002
      }

      return props.selectedCountryIds.includes(country.id) ? 0.026 : 0.007
    })
    .polygonLabel((feature: Feature) => {
      const country = getCountryForFeature(feature)
      return country ? buildCountryTooltip(country) : ''
    })
    .polygonsTransitionDuration(700)
    .htmlElementsData(globeHtmlElements.value)
    .htmlLat('lat')
    .htmlLng('lng')
    .htmlAltitude((item: GlobeHtmlElement) => (
      item.type === 'influence-label' || item.type === 'influence-hit-target'
        ? item.altitude
        : item.type === 'event'
          ? 0.028
          : 0.02
    ))
    .htmlElement((item: GlobeHtmlElement) => createHtmlElement(item))
    .arcsData(arcs)
    .arcColor('color')
    .arcDashLength('dashLength')
    .arcStroke('stroke')
    .arcAltitude('altitude')
    .arcDashGap('dashGap')
    .arcDashInitialGap((arc: { startLat: number; startLng: number }) => deterministicUnit(Math.round((arc.startLat + 90) * 100), Math.round((arc.startLng + 180) * 100)))
    .arcDashAnimateTime(1250)
    .arcCircularResolution(8)
    .objectsData(influenceArrowObjects.value)
    .objectLat('lat')
    .objectLng('lng')
    .objectAltitude('altitude')
    .objectRotation((arrow: InfluenceArrowObject) => ({ x: 90, z: arrow.bearing }))
    .objectFacesSurface(true)
    .objectThreeObject((arrow: InfluenceArrowObject) => createInfluenceArrowObject(arrow))
}

function focusCamera() {
  if (!globe) {
    return
  }

  const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1200
  globe.pointOfView(props.focusPose, duration)
}

onMounted(() => {
  if (!supportsWebGl() || !container.value) {
    fallback.value = true
    return
  }

  globe = new Globe(container.value)
  globe.globeImageUrl(createEarthTexture())
  globe.bumpImageUrl(createEarthBumpTexture())
  globe.backgroundColor('rgba(0,0,0,0)')
  globe.showAtmosphere(true)
  globe.atmosphereAltitude(0.24)
  globe.atmosphereColor('#e1a768')
  tuneGlobeMaterial()
  globe.onPolygonClick((feature: Feature) => {
    const country = getCountryForFeature(feature)
    if (country) {
      emit('select-country', country.id)
    }
  })
  globe.onArcHover((arc: InfluenceRenderArc | null) => {
    setHoveredInfluence(arc?.id ?? null)
  })
  globe.onArcClick((arc: InfluenceRenderArc) => {
    activeInfluenceId.value = activeInfluenceId.value === arc.id ? null : arc.id
  })
  globe.onObjectHover((arrow: InfluenceArrowObject | null) => {
    setHoveredInfluence(arrow?.id ?? null)
  })
  globe.onObjectClick((arrow: InfluenceArrowObject) => {
    activeInfluenceId.value = activeInfluenceId.value === arrow.id ? null : arrow.id
  })
  globe.lineHoverPrecision(5)

  const controls = globe.controls()
  controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  controls.autoRotateSpeed = 0.18
  controls.enablePan = false
  controls.minDistance = 165
  controls.maxDistance = 320

  addAtmosphereObjects()
  updateSize()
  syncGlobe()
  focusCamera()

  resizeObserver = new ResizeObserver(updateSize)
  resizeObserver.observe(container.value)
})

watch(
  () => [
    props.activeYear,
    props.highlightedEventId,
    props.language,
    props.selectedArtistId,
    props.selectedCountryIds.join('|'),
    props.enabledLayers.join('|'),
    props.timelinePlaying,
    activeInfluenceId.value,
    hoveredInfluenceId.value,
  ],
  () => {
    syncGlobe()
  },
)

watch(
  () => props.focusPose,
  () => {
    focusCamera()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<template>
  <div class="stage-shell">
    <div ref="container" class="stage" />
    <div class="mesh-overlay" />
    <div v-if="chrome !== 'minimal'" class="globe-hint" data-testid="globe-hint">
      {{
        language === 'zh'
          ? '提示：点击艺术家地图钉可直接查看人物资料、来源与音频状态。'
          : 'Hint: click any artist pin to jump straight to the profile, sources, and audio state.'
      }}
    </div>
    <div v-if="chrome !== 'minimal'" class="pin-legend">
      <span><i class="dot dot-country" />{{ language === 'zh' ? '国家风格染色' : 'Country style tint' }}</span>
      <span><i class="dot dot-artist" />{{ language === 'zh' ? '艺术家地图钉' : 'Artist pin' }}</span>
      <span><i class="dot dot-event" />{{ language === 'zh' ? '历史事件地图钉' : 'Historic event pin' }}</span>
    </div>
    <div v-if="fallback" class="fallback">
      <p>{{ language === 'zh' ? '当前浏览器未启用 WebGL。' : 'WebGL is unavailable in this browser.' }}</p>
      <small>
        {{
          language === 'zh'
            ? '页面仍可浏览时间轴与侧边说明，但地球视图需要图形加速支持。'
            : 'The timeline and editorial notes remain available, but the globe view needs hardware acceleration.'
        }}
      </small>
    </div>
  </div>
</template>

<style scoped>
.stage-shell,
.stage {
  position: absolute;
  inset: 0;
}

.stage {
  cursor: grab;
}

.stage:active {
  cursor: grabbing;
}

.mesh-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 46%, transparent 18%, rgba(195, 122, 57, 0.08) 52%, rgba(6, 10, 16, 0.3) 78%, rgba(4, 7, 11, 0.62) 100%),
    linear-gradient(90deg, rgba(255, 236, 199, 0.035) 1px, transparent 1px),
    linear-gradient(rgba(255, 236, 199, 0.026) 1px, transparent 1px),
    linear-gradient(115deg, transparent 0 46%, rgba(255, 240, 205, 0.04) 49%, transparent 53%);
  background-size: auto, 80px 80px, 80px 80px, 100% 100%;
  mask-image: radial-gradient(circle at center, black 30%, transparent 94%);
}

.globe-hint {
  position: absolute;
  top: 1.1rem;
  right: 1.1rem;
  z-index: 2;
  max-width: min(24rem, 34vw);
  padding: 0.8rem 0.95rem;
  background: rgba(10, 15, 21, 0.7);
  border: 1px solid rgba(239, 228, 208, 0.08);
  color: rgba(239, 228, 208, 0.78);
  font-size: 0.78rem;
  line-height: 1.45;
  backdrop-filter: blur(16px);
}

.pin-legend {
  position: absolute;
  left: 1.2rem;
  bottom: 1.1rem;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  padding: 0.7rem 0.9rem;
  background: rgba(10, 15, 21, 0.66);
  border: 1px solid var(--atlas-line);
  color: rgba(239, 228, 208, 0.78);
  font-size: 0.78rem;
  backdrop-filter: blur(16px);
}

.pin-legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.dot {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 999px;
}

.dot-country {
  background: rgba(201, 143, 88, 0.75);
}

.dot-artist {
  background: #c98f58;
}

.dot-event {
  background: #d66b51;
}

.fallback {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  max-width: 20rem;
  padding: 1rem 1.1rem;
  background: rgba(10, 15, 21, 0.85);
  border: 1px solid var(--atlas-line);
  color: var(--atlas-text);
}

.fallback p,
.fallback small {
  margin: 0;
}

.fallback small {
  display: block;
  margin-top: 0.4rem;
  color: var(--atlas-muted);
}

:global(.globe-tooltip__title) {
  font-weight: 700;
  color: #f6ecdd;
}

:global(.globe-tooltip__meta) {
  margin-top: 0.2rem;
  color: rgba(246, 236, 221, 0.62);
  font-size: 0.74rem;
}

:global(.globe-tooltip__copy) {
  margin-top: 0.35rem;
  color: #ecd9be;
}

:global(.influence-label) {
  position: relative;
  z-index: 3;
  display: grid;
  gap: 0.24rem;
  min-width: 9.2rem;
  max-width: 15rem;
  padding: 0.46rem 0.58rem 0.5rem;
  border: 1px solid color-mix(in srgb, var(--target-color) 48%, rgba(255, 239, 205, 0.18));
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--source-color) 22%, transparent), transparent 42%),
    rgba(8, 13, 18, 0.82);
  color: #f8ecd8;
  text-align: left;
  pointer-events: auto;
  cursor: pointer;
  transform: translate(-50%, -50%);
  box-shadow:
    0 12px 34px rgba(0, 0, 0, 0.34),
    0 0 22px color-mix(in srgb, var(--target-color) 22%, transparent);
  backdrop-filter: blur(14px);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

:global(.influence-label::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--source-color), var(--target-color));
}

:global(.influence-label:hover),
:global(.influence-label:focus-visible),
:global(.influence-label--active) {
  border-color: color-mix(in srgb, var(--target-color) 74%, rgba(255, 247, 225, 0.42));
  transform: translate(-50%, -50%) scale(1.03);
  box-shadow:
    0 16px 42px rgba(0, 0, 0, 0.4),
    0 0 34px color-mix(in srgb, var(--target-color) 36%, transparent);
}

:global(.influence-label__route) {
  display: inline-flex;
  align-items: center;
  gap: 0.34rem;
  min-width: 0;
  color: #fff3d9;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.25;
}

:global(.influence-label__route b) {
  min-width: 0;
  overflow-wrap: anywhere;
}

:global(.influence-label__route i) {
  color: color-mix(in srgb, var(--target-color) 76%, #fff);
  font-style: normal;
}

:global(.influence-label__reason) {
  display: -webkit-box;
  max-height: 0;
  overflow: hidden;
  color: rgba(248, 236, 216, 0.72);
  font-size: 0.62rem;
  line-height: 1.35;
  opacity: 0;
  transition: max-height 180ms ease, opacity 180ms ease;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

:global(.influence-label:hover .influence-label__reason),
:global(.influence-label:focus-visible .influence-label__reason),
:global(.influence-label--active .influence-label__reason) {
  max-height: 5.2rem;
  opacity: 1;
}

:global(.influence-hit-target) {
  position: relative;
  z-index: 2;
  width: 3.25rem;
  height: 3.25rem;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--target-color) 12%, transparent);
  opacity: 0.01;
  pointer-events: auto;
  cursor: pointer;
  transform: translate(-50%, -50%);
}

:global(.influence-hit-target:focus-visible) {
  opacity: 0.7;
  outline: 2px solid color-mix(in srgb, var(--target-color) 72%, #fff);
  outline-offset: 2px;
}

:global(.globe-pin) {
  position: relative;
  z-index: 5;
  display: inline-grid;
  justify-items: center;
  gap: 0.08rem;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  transform: translate(-50%, -100%);
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.42));
  transition: transform 180ms ease, filter 180ms ease;
}

:global(.globe-pin:hover),
:global(.globe-pin:focus-visible) {
  transform: translate(-50%, -100%) scale(1.06);
  filter: drop-shadow(0 12px 26px var(--pin-glow));
}

:global(.globe-pin--event.globe-pin--selected) {
  transform: translate(-50%, -100%) scale(1.08);
  filter:
    drop-shadow(0 14px 30px rgba(0, 0, 0, 0.46))
    drop-shadow(0 0 1.1rem var(--pin-glow));
}

:global(.globe-pin__stem) {
  width: 2px;
  height: 12px;
  background: rgba(255, 240, 219, 0.74);
}

:global(.globe-pin__head) {
  display: grid;
  place-items: center;
  width: 1.35rem;
  height: 1.65rem;
  background: transparent;
  filter:
    drop-shadow(0 0 0.25rem color-mix(in srgb, var(--pin-color) 38%, transparent))
    drop-shadow(0 0.18rem 0.22rem rgba(0, 0, 0, 0.48));
}

:global(.globe-pin__head img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

:global(.globe-pin__pulse) {
  position: absolute;
  top: -0.3rem;
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--pin-color) 62%, transparent);
  opacity: 0.72;
  animation: event-pulse 2200ms ease-out infinite;
}

:global(.globe-pin--playback .globe-pin__pulse) {
  border-width: 2px;
  animation-duration: 950ms;
}

:global(.globe-pin--event) {
  gap: 0.14rem;
  z-index: 6;
}

:global(.globe-pin--event .globe-pin__stem) {
  height: 8px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--pin-color) 74%, #fff), rgba(255, 240, 219, 0.2));
}

:global(.event-badge) {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.05rem;
  height: 3.15rem;
  color: #fff4db;
}

:global(.event-badge[data-importance='2']) {
  width: 2.25rem;
  height: 3.45rem;
}

:global(.event-badge[data-importance='3']) {
  width: 2.45rem;
  height: 3.75rem;
}

:global(.event-badge__ring) {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: transparent;
  filter:
    drop-shadow(0 0 0.28rem var(--pin-glow))
    drop-shadow(0 0.24rem 0.28rem rgba(0, 0, 0, 0.48));
}

:global(.globe-pin--event.globe-pin--selected .event-badge__ring) {
  filter:
    drop-shadow(0 0 0.42rem var(--pin-glow))
    drop-shadow(0 0 0.86rem color-mix(in srgb, var(--pin-color) 34%, transparent))
    drop-shadow(0 0.24rem 0.3rem rgba(0, 0, 0, 0.5));
}

:global(.event-badge__ring img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: sepia(0.24) saturate(0.9) contrast(1.08);
}

:global(.event-badge__glyph) {
  position: relative;
  width: 1.05rem;
  height: 1.05rem;
  z-index: 1;
}

:global(.event-badge__glyph i) {
  position: absolute;
  display: block;
  background: currentColor;
}

:global(.event-badge__glyph--conflict i:nth-child(1)),
:global(.event-badge__glyph--conflict i:nth-child(2)) {
  top: 50%;
  left: 0.05rem;
  width: 0.95rem;
  height: 2px;
  transform: rotate(42deg);
  transform-origin: center;
}

:global(.event-badge__glyph--conflict i:nth-child(2)) {
  transform: rotate(-42deg);
}

:global(.event-badge__glyph--conflict i:nth-child(3)) {
  top: 0.38rem;
  left: 0.38rem;
  width: 0.3rem;
  height: 0.3rem;
  border-radius: 999px;
}

:global(.event-badge__glyph--policy) {
  border: 2px solid currentColor;
  border-radius: 0.16rem;
}

:global(.event-badge__glyph--policy i) {
  bottom: 0.16rem;
  width: 2px;
}

:global(.event-badge__glyph--policy i:nth-child(1)) {
  left: 0.22rem;
  height: 0.45rem;
}

:global(.event-badge__glyph--policy i:nth-child(2)) {
  left: 0.48rem;
  height: 0.68rem;
}

:global(.event-badge__glyph--policy i:nth-child(3)) {
  left: 0.75rem;
  height: 0.34rem;
}

:global(.event-badge__glyph--broadcast i) {
  inset: 50% auto auto 50%;
  border: 2px solid currentColor;
  border-left-color: transparent;
  border-bottom-color: transparent;
  border-radius: 999px;
  background: transparent;
  transform: translate(-50%, -50%) rotate(45deg);
}

:global(.event-badge__glyph--broadcast i:nth-child(1)) {
  width: 0.34rem;
  height: 0.34rem;
}

:global(.event-badge__glyph--broadcast i:nth-child(2)) {
  width: 0.68rem;
  height: 0.68rem;
}

:global(.event-badge__glyph--broadcast i:nth-child(3)) {
  width: 1rem;
  height: 1rem;
  opacity: 0.72;
}

:global(.event-badge__glyph--occupation i:nth-child(1)) {
  inset: 0.04rem auto auto 0.08rem;
  width: 0;
  height: 0;
  border-right: 0.44rem solid transparent;
  border-left: 0.44rem solid transparent;
  border-top: 0.92rem solid currentColor;
  background: transparent;
}

:global(.event-badge__glyph--occupation i:nth-child(2)) {
  top: 0.28rem;
  left: 0.49rem;
  width: 2px;
  height: 0.34rem;
  background: rgba(8, 13, 18, 0.92);
}

:global(.event-badge__glyph--occupation i:nth-child(3)) {
  top: 0.72rem;
  left: 0.48rem;
  width: 0.14rem;
  height: 0.14rem;
  border-radius: 999px;
  background: rgba(8, 13, 18, 0.92);
}

:global(.event-badge__glyph--liberation i:nth-child(1)) {
  inset: 0;
  clip-path: polygon(50% 0, 61% 36%, 100% 39%, 68% 59%, 79% 100%, 50% 73%, 21% 100%, 32% 59%, 0 39%, 39% 36%);
}

:global(.event-badge__glyph--liberation i:nth-child(2)) {
  inset: 0.37rem;
  border-radius: 999px;
  background: rgba(8, 13, 18, 0.72);
}

:global(.event-badge__glyph--reconstruction i:nth-child(1)) {
  left: 0.12rem;
  bottom: 0.12rem;
  width: 0.82rem;
  height: 0.62rem;
  border: 2px solid currentColor;
  border-bottom: 0;
  border-radius: 0.62rem 0.62rem 0 0;
  background: transparent;
}

:global(.event-badge__glyph--reconstruction i:nth-child(2)),
:global(.event-badge__glyph--reconstruction i:nth-child(3)) {
  bottom: 0;
  width: 0.2rem;
  height: 0.2rem;
  border-radius: 999px;
}

:global(.event-badge__glyph--reconstruction i:nth-child(2)) {
  left: 0.04rem;
}

:global(.event-badge__glyph--reconstruction i:nth-child(3)) {
  right: 0.04rem;
}

:global(.event-badge__year) {
  padding: 0.12rem 0.34rem;
  border: 1px solid color-mix(in srgb, var(--pin-color) 48%, transparent);
  background: rgba(8, 13, 18, 0.76);
  color: #fff1d2;
  font-size: 0.62rem;
  line-height: 1;
  letter-spacing: 0.08em;
}

:global(.globe-pin--event.globe-pin--selected .event-badge__year) {
  border-color: color-mix(in srgb, var(--pin-color) 70%, #fff);
  background: color-mix(in srgb, var(--pin-color) 22%, rgba(8, 13, 18, 0.9));
  color: #fff7e4;
}

:global(.globe-pin__label) {
  display: grid;
  gap: 0.12rem;
  margin-top: 0.25rem;
  padding: 0.28rem 0.42rem;
  max-width: 9rem;
  background: rgba(10, 15, 21, 0.82);
  border: 1px solid rgba(239, 228, 208, 0.1);
  color: #f3e7d4;
  text-align: center;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 180ms ease, transform 180ms ease;
  pointer-events: none;
}

:global(.globe-pin:hover .globe-pin__label),
:global(.globe-pin:focus-visible .globe-pin__label),
:global(.globe-pin--selected .globe-pin__label) {
  opacity: 1;
  transform: translateY(0);
}

:global(.globe-pin--event .globe-pin__label) {
  max-width: 13rem;
  margin-top: 0.3rem;
  padding: 0.44rem 0.58rem;
  border-color: color-mix(in srgb, var(--pin-color) 22%, transparent);
}

:global(.globe-pin--event .globe-pin__label small) {
  color: color-mix(in srgb, var(--pin-color) 70%, #fff);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

:global(.globe-pin--selected .globe-pin__head) {
  filter:
    drop-shadow(0 0 0.34rem color-mix(in srgb, var(--pin-color) 70%, transparent))
    drop-shadow(0 0 0.72rem color-mix(in srgb, var(--pin-color) 44%, transparent));
}

:global(.globe-pin__label strong) {
  font-size: 0.72rem;
}

:global(.globe-pin__label small) {
  color: rgba(243, 231, 212, 0.68);
  font-size: 0.65rem;
  line-height: 1.25;
}

:global(.globe-pin__label--artist-card) {
  grid-template-columns: 4rem minmax(0, 1fr);
  gap: 0.55rem;
  width: 17rem;
  max-width: 17rem;
  padding: 0.55rem;
  text-align: left;
  transform: translateY(6px) translateX(0.5rem);
}

:global(.globe-pin__label--artist-card img) {
  width: 4rem;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border: 1px solid rgba(239, 228, 208, 0.16);
}

:global(.artist-card-copy) {
  display: grid;
  gap: 0.22rem;
  min-width: 0;
}

:global(.artist-card-copy strong),
:global(.artist-card-copy small),
:global(.artist-card-copy em) {
  min-width: 0;
  overflow-wrap: anywhere;
}

:global(.artist-card-copy em) {
  color: rgba(243, 231, 212, 0.74);
  font-size: 0.64rem;
  font-style: normal;
  line-height: 1.3;
}

:global(.artist-card-works) {
  display: grid;
  gap: 0.2rem;
  margin-top: 0.1rem;
}

:global(.artist-card-works b) {
  color: #f4d39f;
  font-size: 0.65rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

:global(.artist-card-works i) {
  margin-left: 0.35rem;
  color: rgba(243, 231, 212, 0.54);
  font-size: 0.6rem;
  font-style: normal;
}

@keyframes event-pulse {
  0% {
    opacity: 0.7;
    transform: scale(0.72);
  }
  78%,
  100% {
    opacity: 0;
    transform: scale(1.45);
  }
}

@media (max-width: 760px) {
  .globe-hint {
    top: auto;
    right: 0.75rem;
    left: 0.75rem;
    bottom: 4.8rem;
    max-width: none;
    font-size: 0.72rem;
  }

  .pin-legend {
    right: 0.75rem;
    left: 0.75rem;
    bottom: 0.75rem;
    gap: 0.55rem;
    font-size: 0.72rem;
  }

  :global(.event-badge) {
    width: 1.78rem;
    height: 2.74rem;
  }

  :global(.event-badge__year) {
    font-size: 0.58rem;
  }

  :global(.globe-pin__label) {
    display: none;
  }

  :global(.influence-label:not(.influence-label--active)) {
    display: none;
  }

  :global(.influence-label) {
    min-width: min(12rem, 72vw);
    max-width: min(14rem, 78vw);
    padding: 0.42rem 0.5rem;
  }

  :global(.influence-label__route) {
    font-size: 0.64rem;
  }

  :global(.influence-label__reason) {
    font-size: 0.6rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  :global(.globe-pin),
  :global(.globe-pin__label),
  :global(.influence-label),
  :global(.influence-label__reason) {
    transition: none;
  }

  :global(.globe-pin__pulse) {
    display: none;
    animation: none;
  }
}
</style>
