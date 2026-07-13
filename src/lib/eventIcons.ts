import type { HistoricEvent, Language } from '@/data/ww2MusicAtlas'

export type EventCategory = HistoricEvent['category']

export interface EventCategoryConfig {
  category: EventCategory
  className: string
  color: string
  glow: string
  labelZh: string
  labelEn: string
}

export const EVENT_CATEGORY_CONFIGS: Record<EventCategory, EventCategoryConfig> = {
  conflict: {
    category: 'conflict',
    className: 'conflict',
    color: '#e27b4f',
    glow: 'rgba(226, 123, 79, 0.34)',
    labelZh: '冲突与战役',
    labelEn: 'Conflict',
  },
  policy: {
    category: 'policy',
    className: 'policy',
    color: '#d6a35d',
    glow: 'rgba(214, 163, 93, 0.32)',
    labelZh: '政策与管制',
    labelEn: 'Policy',
  },
  broadcast: {
    category: 'broadcast',
    className: 'broadcast',
    color: '#69b7ad',
    glow: 'rgba(105, 183, 173, 0.32)',
    labelZh: '广播与传播',
    labelEn: 'Broadcast',
  },
  occupation: {
    category: 'occupation',
    className: 'occupation',
    color: '#b85048',
    glow: 'rgba(184, 80, 72, 0.34)',
    labelZh: '占领与转向',
    labelEn: 'Occupation',
  },
  liberation: {
    category: 'liberation',
    className: 'liberation',
    color: '#f0c96a',
    glow: 'rgba(240, 201, 106, 0.34)',
    labelZh: '解放与流动',
    labelEn: 'Liberation',
  },
  reconstruction: {
    category: 'reconstruction',
    className: 'reconstruction',
    color: '#73a8d7',
    glow: 'rgba(115, 168, 215, 0.32)',
    labelZh: '重建与遗产',
    labelEn: 'Reconstruction',
  },
}

export function getEventCategoryConfig(category: EventCategory) {
  return EVENT_CATEGORY_CONFIGS[category]
}

export function getEventCategoryLabel(category: EventCategory, language: Language) {
  const config = getEventCategoryConfig(category)
  return language === 'zh' ? config.labelZh : config.labelEn
}
