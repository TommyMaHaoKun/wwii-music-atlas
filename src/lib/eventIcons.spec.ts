import { describe, expect, it } from 'vitest'
import { EVENT_CATEGORY_CONFIGS, getEventCategoryConfig, getEventCategoryLabel } from '@/lib/eventIcons'

describe('eventIcons', () => {
  it('maps every historic event category to a visible marker style', () => {
    const categories = ['conflict', 'policy', 'broadcast', 'occupation', 'liberation', 'reconstruction'] as const

    categories.forEach((category) => {
      const config = getEventCategoryConfig(category)

      expect(config.className).toBeTruthy()
      expect(config.color).toMatch(/^#/)
      expect(config.glow).toContain('rgba')
      expect(EVENT_CATEGORY_CONFIGS[category]).toBe(config)
    })
  })

  it('returns localized category labels', () => {
    expect(getEventCategoryLabel('broadcast', 'en')).toBe('Broadcast')
    expect(getEventCategoryLabel('broadcast', 'zh')).toBe('广播与传播')
  })
})
