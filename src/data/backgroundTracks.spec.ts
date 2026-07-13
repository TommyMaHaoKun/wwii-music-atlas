import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { backgroundTracks, getPlayableBackgroundTracks } from '@/data/backgroundTracks'

describe('backgroundTracks', () => {
  it('keeps the launch playlist between four and six tracks', () => {
    expect(backgroundTracks.length).toBeGreaterThanOrEqual(4)
    expect(backgroundTracks.length).toBeLessThanOrEqual(6)
  })

  it('stores local media, source links, and credits for every track', () => {
    expect(
      backgroundTracks.every((track) =>
        track.src.startsWith('/audio/background/')
        && track.sourceUrl.startsWith('https://')
        && track.licenseLabel.trim().length > 0
        && track.credit.trim().length > 0,
      ),
    ).toBe(true)
  })

  it('excludes sensitive-context tracks from the playable background playlist', () => {
    expect(backgroundTracks.some((track) => track.sensitivity === 'sensitive-context')).toBe(false)
    expect(getPlayableBackgroundTracks().every((track) => track.sensitivity !== 'sensitive-context')).toBe(true)
  })

  it('points to files that exist in public/audio/background', () => {
    const allFilesExist = backgroundTracks.every((track) => {
      const localPath = join(process.cwd(), 'public', track.src.replace(/^\//, ''))
      return existsSync(localPath)
    })

    expect(allFilesExist).toBe(true)
  })
})
