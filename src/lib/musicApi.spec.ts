import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// The Vercel function is plain JavaScript and intentionally has no browser bundle types.
// @ts-expect-error importing the serverless handler for contract tests
import musicHandler from '../../api/music.js'

interface TestResponse {
  statusCode: number
  payload: Record<string, unknown> | null
  status: (code: number) => TestResponse
  json: (payload: Record<string, unknown>) => TestResponse
}

function responseRecorder(): TestResponse {
  return {
    statusCode: 0,
    payload: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
  }
}

function generationRequest(body: Record<string, unknown>, ip: string) {
  return {
    method: 'POST',
    body: { action: 'generate', ...body },
    headers: {},
    socket: { remoteAddress: ip },
  }
}

describe('/api/music generation contract', () => {
  beforeEach(() => {
    process.env.ACESTEP_API_BASE = 'https://ace.example'
    process.env.ACESTEP_API_KEY = 'test-secret'
  })

  afterEach(() => {
    delete process.env.ACESTEP_API_BASE
    delete process.env.ACESTEP_API_KEY
    vi.unstubAllGlobals()
  })

  it('uses the self-hosted 4B sample mode for automatic lyrics', async () => {
    const aceFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: { task_id: '4b6a8a2e-f566-4ff0-a931-ae385c6a31f7' } }),
    })
    vi.stubGlobal('fetch', aceFetch)
    const res = responseRecorder()

    await musicHandler(generationRequest({
      prompt: 'Original German brass march about returning home',
      mode: 'auto',
      vocalLanguage: 'de',
      duration: 90,
      bpm: 112,
    }, 'auto-contract'), res)

    expect(res.statusCode).toBe(202)
    const [, init] = aceFetch.mock.calls[0]
    const payload = JSON.parse(init.body)
    expect(payload).toMatchObject({
      model: 'acestep-v15-xl-sft',
      sample_mode: true,
      lock_requested_metadata: true,
      lm_backend: 'pt',
      lyrics: '',
      vocal_language: 'de',
      inference_steps: 50,
      audio_format: 'mp3',
    })
    expect(payload.sample_query).toContain('completely original German lyrics')
  })

  it('keeps instrumental mode explicit instead of treating blank lyrics as instrumental', async () => {
    const aceFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: { task_id: 'a71e7b31-2d57-438f-96f0-0b76d9111127' } }),
    })
    vi.stubGlobal('fetch', aceFetch)
    const res = responseRecorder()

    await musicHandler(generationRequest({
      prompt: 'Original period orchestral march with brass and field snare',
      mode: 'instrumental',
    }, 'instrumental-contract'), res)

    const [, init] = aceFetch.mock.calls[0]
    const payload = JSON.parse(init.body)
    expect(payload.sample_mode).toBe(false)
    expect(payload.lyrics).toBe('[Instrumental]')
    expect(payload.vocal_language).toBe('unknown')
  })
})
