export const SOURCE_AUDIO_STATE_EVENT = 'atlas:source-audio-state'

export interface SourceAudioStateDetail {
  active: boolean
  clipId?: string
}

export interface BackgroundAudioStateDetail {
  trackId: string | null
  countryId: string | null
  isPlaying: boolean
  sourceAudioActive: boolean
  blocked: boolean
}

export function dispatchSourceAudioState(detail: SourceAudioStateDetail) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent<SourceAudioStateDetail>(SOURCE_AUDIO_STATE_EVENT, { detail }))
}
