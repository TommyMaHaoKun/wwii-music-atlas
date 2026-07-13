const requestHistory = globalThis.__wwiiMusicRequestHistory ?? new Map()
globalThis.__wwiiMusicRequestHistory = requestHistory

const MIN_DURATION = 10
const MAX_DURATION = 180
const GENERATE_COOLDOWN_MS = 20_000

function sendJson(res, status, data) {
  res.status(status).json(data)
}

function getConfig() {
  const baseUrl = (process.env.ACESTEP_API_BASE || '').replace(/\/+$/, '')
  const apiKey = process.env.ACESTEP_API_KEY || ''

  if (!baseUrl || !apiKey) {
    throw new Error('Music generation service is not configured')
  }

  return { baseUrl, apiKey }
}

async function aceFetch(path, init = {}) {
  const { baseUrl, apiKey } = getConfig()
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`ACE-Step returned ${response.status}: ${detail.slice(0, 300)}`)
  }

  return response
}

function requestIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return forwarded || req.socket?.remoteAddress || 'unknown'
}

function enforceRateLimit(req) {
  const ip = requestIp(req)
  const now = Date.now()
  const lastRequest = requestHistory.get(ip) || 0
  const waitMs = GENERATE_COOLDOWN_MS - (now - lastRequest)

  if (waitMs > 0) {
    const error = new Error('Please wait before starting another generation')
    error.statusCode = 429
    error.retryAfter = Math.ceil(waitMs / 1000)
    throw error
  }

  requestHistory.set(ip, now)

  if (requestHistory.size > 1000) {
    for (const [key, timestamp] of requestHistory) {
      if (now - timestamp > 60 * 60 * 1000) requestHistory.delete(key)
    }
  }
}

function parseBody(req) {
  if (typeof req.body === 'string') return JSON.parse(req.body)
  return req.body || {}
}

async function health(res) {
  const [healthResponse, loraResponse] = await Promise.all([
    aceFetch('/health'),
    aceFetch('/v1/lora/status'),
  ])
  const healthPayload = await healthResponse.json()
  const loraPayload = await loraResponse.json()
  const modelsInitialized = Boolean(healthPayload?.data?.models_initialized)
  const loraLoaded = Boolean(loraPayload?.data?.lora_loaded && loraPayload?.data?.use_lora)

  sendJson(res, 200, {
    ready: modelsInitialized && loraLoaded,
    modelsInitialized,
    loraLoaded,
    adapter: loraPayload?.data?.active_adapter || null,
  })
}

async function generate(req, res, body) {
  enforceRateLimit(req)

  const prompt = String(body.prompt || '').trim()
  const lyrics = String(body.lyrics || '').trim()
  const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, Number(body.duration) || MIN_DURATION))
  const bpm = Math.min(200, Math.max(50, Number(body.bpm) || 112))

  if (prompt.length < 8 || prompt.length > 800) {
    return sendJson(res, 400, { error: 'Prompt must contain 8–800 characters' })
  }

  if (lyrics.length > 3000) {
    return sendJson(res, 400, { error: 'Lyrics are too long' })
  }

  const response = await aceFetch('/release_task', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      lyrics: lyrics || '[Instrumental]',
      thinking: false,
      use_cot_caption: false,
      use_cot_language: false,
      vocal_language: 'en',
      model: 'acestep-v15-turbo',
      audio_duration: duration,
      batch_size: 1,
      inference_steps: 8,
      audio_format: 'mp3',
      mp3_bitrate: '128k',
      bpm,
      time_signature: '4',
      use_random_seed: true,
    }),
  })
  const payload = await response.json()
  const taskId = payload?.data?.task_id

  if (!taskId) throw new Error('ACE-Step did not return a task id')
  sendJson(res, 202, { taskId, status: 'queued' })
}

async function status(res, body) {
  const taskId = String(body.taskId || '')
  if (!/^[0-9a-f-]{36}$/i.test(taskId)) {
    return sendJson(res, 400, { error: 'Invalid task id' })
  }

  const response = await aceFetch('/query_result', {
    method: 'POST',
    body: JSON.stringify({ task_id_list: [taskId] }),
  })
  const payload = await response.json()
  const item = payload?.data?.[0]

  if (!item || item.status === 0) {
    return sendJson(res, 200, { status: 'running' })
  }

  if (item.status === 2) {
    return sendJson(res, 200, { status: 'failed', error: item.error || 'Generation failed' })
  }

  const tracks = JSON.parse(item.result || '[]')
  const track = tracks[0]
  if (!track?.file) throw new Error('Generated track is missing its audio path')

  sendJson(res, 200, {
    status: 'succeeded',
    audioPath: track.file,
    seed: track.seed_value || null,
    generationInfo: track.generation_info || null,
  })
}

async function audio(req, res) {
  const file = String(req.query.file || '')
  if (!file.startsWith('/v1/audio?path=') || file.includes('\n') || file.includes('\r')) {
    return sendJson(res, 400, { error: 'Invalid audio path' })
  }

  const response = await aceFetch(file)
  const audio = Buffer.from(await response.arrayBuffer())
  res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg')
  res.setHeader('Content-Length', String(audio.length))
  res.setHeader('Content-Disposition', 'inline; filename="wwii-ai-music.mp3"')
  res.setHeader('Cache-Control', 'private, no-store')
  res.status(200).send(audio)
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET' && req.query.file) return await audio(req, res)
    if (req.method === 'GET') return await health(res)

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST')
      return sendJson(res, 405, { error: 'Method not allowed' })
    }

    const body = parseBody(req)
    if (body.action === 'generate') return await generate(req, res, body)
    if (body.action === 'status') return await status(res, body)
    return sendJson(res, 400, { error: 'Unknown action' })
  } catch (error) {
    const statusCode = Number(error.statusCode) || 502
    if (error.retryAfter) res.setHeader('Retry-After', String(error.retryAfter))
    console.error('Music proxy error:', error.message)
    return sendJson(res, statusCode, {
      error: statusCode === 502 ? 'Music service is temporarily unavailable' : error.message,
      ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}),
    })
  }
}
