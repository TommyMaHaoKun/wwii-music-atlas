const requestHistory = globalThis.__wwiiMusicRequestHistory ?? new Map()
globalThis.__wwiiMusicRequestHistory = requestHistory

const MIN_DURATION = 10
const MAX_DURATION = 180
const GENERATE_COOLDOWN_MS = 20_000
const ACESTEP_MODEL = 'acestep-v15-xl-sft'
const GENERATION_MODES = new Set(['auto', 'custom', 'instrumental'])
const VOCAL_LANGUAGES = new Set(['en', 'de', 'zh', 'fr', 'es', 'it', 'pl', 'ru', 'ja', 'ko'])

const LANGUAGE_NAMES = {
  en: 'English',
  de: 'German',
  zh: 'Chinese',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  pl: 'Polish',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
}

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
  const llmInitialized = Boolean(healthPayload?.data?.llm_initialized)
  const loraLoaded = Boolean(loraPayload?.data?.lora_loaded && loraPayload?.data?.use_lora)
  const loadedModel = healthPayload?.data?.loaded_model || null

  sendJson(res, 200, {
    ready: modelsInitialized && loraLoaded,
    autoLyricsReady: modelsInitialized && loraLoaded && llmInitialized,
    modelsInitialized,
    llmInitialized,
    loraLoaded,
    adapter: loraPayload?.data?.active_adapter || null,
    model: loadedModel,
    lyricModel: healthPayload?.data?.loaded_lm_model || null,
  })
}

async function generate(req, res, body) {
  enforceRateLimit(req)

  const prompt = String(body.prompt || '').trim()
  const lyrics = String(body.lyrics || '').trim()
  const mode = String(body.mode || (lyrics ? 'custom' : 'auto')).trim().toLowerCase()
  const vocalLanguage = String(body.vocalLanguage || 'en').trim().toLowerCase()
  const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, Number(body.duration) || MIN_DURATION))
  const bpm = Math.min(200, Math.max(50, Number(body.bpm) || 112))

  if (prompt.length < 8 || prompt.length > 800) {
    return sendJson(res, 400, { error: 'Prompt must contain 8–800 characters' })
  }

  if (lyrics.length > 3000) {
    return sendJson(res, 400, { error: 'Lyrics are too long' })
  }

  if (!GENERATION_MODES.has(mode)) {
    return sendJson(res, 400, { error: 'Invalid generation mode' })
  }

  if (!VOCAL_LANGUAGES.has(vocalLanguage)) {
    return sendJson(res, 400, { error: 'Unsupported vocal language' })
  }

  if (mode === 'custom' && !lyrics) {
    return sendJson(res, 400, { error: 'Custom lyrics mode requires lyrics' })
  }

  const isAutoLyrics = mode === 'auto'
  const isInstrumental = mode === 'instrumental'
  const languageName = LANGUAGE_NAMES[vocalLanguage]
  const sampleQuery = isAutoLyrics
    ? `${prompt}. Write and sing completely original ${languageName} lyrics. `
      + `Aim for approximately ${duration} seconds at ${bpm} BPM. `
      + 'Return a complete song structure with verses and a memorable chorus.'
    : ''

  const response = await aceFetch('/release_task', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      lyrics: isInstrumental ? '[Instrumental]' : lyrics,
      thinking: false,
      sample_mode: isAutoLyrics,
      sample_query: sampleQuery,
      lock_requested_metadata: isAutoLyrics,
      lm_backend: 'pt',
      use_cot_caption: false,
      use_cot_language: false,
      vocal_language: isInstrumental ? 'unknown' : vocalLanguage,
      model: ACESTEP_MODEL,
      audio_duration: duration,
      batch_size: 1,
      inference_steps: 50,
      guidance_scale: 7,
      infer_method: 'ode',
      shift: 1,
      audio_format: 'mp3',
      bpm,
      time_signature: '4/4',
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
    lyrics: track.lyrics || track.metas?.lyrics || '',
    caption: track.prompt || track.metas?.prompt || '',
    metadata: track.metas || null,
    model: track.dit_model || ACESTEP_MODEL,
    lyricModel: track.lm_model || null,
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
