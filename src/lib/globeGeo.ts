import worldAtlas from 'world-atlas/countries-110m.json'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { feature } from 'topojson-client'

const boundaryIdByCountryId: Record<string, string> = {
  us: '840',
  uk: '826',
  de: '276',
  su: '643',
  fr: '250',
  it: '380',
  jp: '392',
  cn: '156',
}

type FeatureGeometry = Polygon | MultiPolygon
export type CountryFeature = Feature<FeatureGeometry, { name?: string }>

const worldFeatures = (feature(
  worldAtlas as any,
  (worldAtlas as any).objects.countries,
) as unknown as FeatureCollection<FeatureGeometry, { name?: string }>).features

export function getWorldCountryFeatures() {
  return worldFeatures
}

export function getFeatureForCountry(countryId: string) {
  const featureId = boundaryIdByCountryId[countryId]
  return worldFeatures.find((item: CountryFeature) => String(item.id) === featureId) ?? null
}

function projectToTexture([lng, lat]: [number, number], width: number, height: number) {
  const x = ((lng + 180) / 360) * width
  const y = ((90 - lat) / 180) * height
  return [x, y] as const
}

function drawRing(context: CanvasRenderingContext2D, ring: number[][], width: number, height: number) {
  ring.forEach((position, index) => {
    const [x, y] = projectToTexture([position[0], position[1]], width, height)
    if (index === 0) {
      context.moveTo(x, y)
      return
    }

    context.lineTo(x, y)
  })
}

function drawFeature(context: CanvasRenderingContext2D, geometry: FeatureGeometry, width: number, height: number) {
  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach((ring: number[][]) => drawRing(context, ring, width, height))
    return
  }

  geometry.coordinates.forEach((polygon: number[][][]) => {
    polygon.forEach((ring: number[][]) => drawRing(context, ring, width, height))
  })
}

function pseudoNoise(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, value))
}

function drawGraticule(context: CanvasRenderingContext2D, width: number, height: number) {
  context.save()
  context.strokeStyle = 'rgba(200, 216, 240, 0.06)'
  context.lineWidth = 1

  for (let lng = -180; lng <= 180; lng += 15) {
    const [x] = projectToTexture([lng, 0], width, height)
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.stroke()
  }

  for (let lat = -75; lat <= 75; lat += 15) {
    const [, y] = projectToTexture([0, lat], width, height)
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }

  context.strokeStyle = 'rgba(200, 216, 240, 0.11)'
  context.lineWidth = 1.4
  context.beginPath()
  context.moveTo(0, height / 2)
  context.lineTo(width, height / 2)
  context.stroke()
  context.restore()
}

function drawOceanTexture(context: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = context.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let index = 0; index < data.length; index += 4) {
    const pixel = index / 4
    const x = pixel % width
    const y = Math.floor(pixel / width)
    const latitudeBand = Math.abs(y / height - 0.5)
    const current = Math.sin(x * 0.017 + Math.sin(y * 0.013) * 2.6) * 5
    const trench = pseudoNoise(x * 0.035, y * 0.055) * 11
    const shelf = Math.sin((x + y * 1.7) * 0.006) * 4
    const depth = latitudeBand * 18 + current + trench + shelf

    data[index] = clampChannel(data[index] - depth * 0.62)
    data[index + 1] = clampChannel(data[index + 1] - depth * 0.44)
    data[index + 2] = clampChannel(data[index + 2] + depth * 0.18)
  }

  context.putImageData(imageData, 0, 0)

  context.save()
  context.globalCompositeOperation = 'screen'
  context.strokeStyle = 'rgba(151, 191, 198, 0.055)'
  context.lineWidth = 1

  for (let row = 0; row < 42; row += 1) {
    const y = (row / 42) * height
    context.beginPath()
    for (let x = 0; x <= width; x += 28) {
      const wave = Math.sin(x * 0.006 + row * 1.7) * 8 + Math.sin(x * 0.017 + row) * 3
      if (x === 0) {
        context.moveTo(x, y + wave)
      } else {
        context.lineTo(x, y + wave)
      }
    }
    context.stroke()
  }

  context.restore()
}

function drawDeterministicGrain(context: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = context.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let index = 0; index < data.length; index += 4) {
    const pixel = index / 4
    const x = pixel % width
    const y = Math.floor(pixel / width)
    const noise = pseudoNoise(x, y) - 0.5
    const amount = noise * 11

    data[index] = Math.max(0, Math.min(255, data[index] + amount))
    data[index + 1] = Math.max(0, Math.min(255, data[index + 1] + amount))
    data[index + 2] = Math.max(0, Math.min(255, data[index + 2] + amount))
  }

  context.putImageData(imageData, 0, 0)
}

function drawLandRelief(context: CanvasRenderingContext2D, geometry: FeatureGeometry, width: number, height: number) {
  context.save()
  context.beginPath()
  drawFeature(context, geometry, width, height)
  context.closePath()
  context.clip()

  context.globalCompositeOperation = 'overlay'
  context.strokeStyle = 'rgba(220, 235, 255, 0.06)'
  context.lineWidth = 1

  for (let row = 0; row < 36; row += 1) {
    const y = (row / 36) * height
    context.beginPath()
    for (let x = 0; x <= width; x += 34) {
      const rise = Math.sin(x * 0.009 + row * 1.9) * 10 + Math.sin((x + row * 19) * 0.025) * 2
      if (x === 0) {
        context.moveTo(x, y + rise)
      } else {
        context.lineTo(x, y + rise)
      }
    }
    context.stroke()
  }

  context.fillStyle = 'rgba(34, 48, 68, 0.08)'
  for (let index = 0; index < 38; index += 1) {
    const x = pseudoNoise(index * 17.3, width) * width
    const y = pseudoNoise(index * 29.7, height) * height
    const radius = 14 + pseudoNoise(index, 7) * 54
    context.beginPath()
    context.ellipse(x, y, radius * 1.8, radius * 0.42, pseudoNoise(index, 9) * Math.PI, 0, Math.PI * 2)
    context.fill()
  }

  context.restore()
}

function drawFixedGlow(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  lng: number,
  lat: number,
  radius: number,
  color: string,
) {
  const [x, y] = projectToTexture([lng, lat], width, height)
  const glow = context.createRadialGradient(x, y, 0, x, y, radius)
  glow.addColorStop(0, color)
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = glow
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()
}

function createTextureCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })

  return { canvas, context }
}

export function createEarthTexture() {
  const width = 2048
  const height = 1024
  const { canvas, context } = createTextureCanvas(width, height)

  if (!context) {
    return ''
  }

  const ocean = context.createLinearGradient(0, 0, width, height)
  ocean.addColorStop(0, '#314a58')
  ocean.addColorStop(0.26, '#193140')
  ocean.addColorStop(0.62, '#0c1f2d')
  ocean.addColorStop(1, '#06101a')
  context.fillStyle = ocean
  context.fillRect(0, 0, width, height)

  drawOceanTexture(context, width, height)
  drawGraticule(context, width, height)

  const land = context.createLinearGradient(0, 0, width, height)
  land.addColorStop(0, 'rgba(198, 214, 232, 0.5)')
  land.addColorStop(0.48, 'rgba(138, 160, 186, 0.38)')
  land.addColorStop(1, 'rgba(78, 98, 124, 0.34)')

  for (const item of worldFeatures) {
    if (item.properties?.name === 'Antarctica') {
      continue
    }

    context.beginPath()
    drawFeature(context, item.geometry, width, height)
    context.closePath()
    context.fillStyle = land
    context.fill()

    drawLandRelief(context, item.geometry, width, height)

    context.globalCompositeOperation = 'screen'
    context.strokeStyle = 'rgba(180, 208, 255, 0.16)'
    context.lineWidth = 5
    context.stroke()

    context.globalCompositeOperation = 'source-over'
    context.strokeStyle = 'rgba(224, 236, 255, 0.32)'
    context.lineWidth = 1.2
    context.stroke()

    context.strokeStyle = 'rgba(14, 20, 30, 0.34)'
    context.lineWidth = 2.4
    context.stroke()
  }

  context.globalCompositeOperation = 'screen'
  drawFixedGlow(context, width, height, -75, 40, 230, 'rgba(90, 150, 235, 0.14)')
  drawFixedGlow(context, width, height, 15, 50, 260, 'rgba(120, 175, 255, 0.16)')
  drawFixedGlow(context, width, height, 116, 33, 230, 'rgba(70, 130, 220, 0.15)')
  drawFixedGlow(context, width, height, 139, 36, 170, 'rgba(130, 181, 218, 0.14)')
  context.globalCompositeOperation = 'source-over'

  drawDeterministicGrain(context, width, height)

  const vignette = context.createRadialGradient(width / 2, height / 2, height * 0.12, width / 2, height / 2, width * 0.72)
  vignette.addColorStop(0, 'rgba(235, 244, 255, 0.06)')
  vignette.addColorStop(0.68, 'rgba(255, 255, 255, 0)')
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.34)')
  context.fillStyle = vignette
  context.fillRect(0, 0, width, height)

  return canvas.toDataURL('image/png')
}

export function createEarthBumpTexture() {
  const width = 1024
  const height = 512
  const { canvas, context } = createTextureCanvas(width, height)

  if (!context) {
    return ''
  }

  const ocean = context.createLinearGradient(0, 0, width, height)
  ocean.addColorStop(0, '#242424')
  ocean.addColorStop(0.5, '#161616')
  ocean.addColorStop(1, '#0f0f0f')
  context.fillStyle = ocean
  context.fillRect(0, 0, width, height)

  for (const item of worldFeatures) {
    if (item.properties?.name === 'Antarctica') {
      continue
    }

    context.beginPath()
    drawFeature(context, item.geometry, width, height)
    context.closePath()
    context.fillStyle = '#8a8a8a'
    context.fill()

    drawLandRelief(context, item.geometry, width, height)

    context.strokeStyle = '#d0d0d0'
    context.lineWidth = 2.6
    context.stroke()

    context.strokeStyle = '#5f5f5f'
    context.lineWidth = 1
    context.stroke()
  }

  drawDeterministicGrain(context, width, height)

  return canvas.toDataURL('image/png')
}
