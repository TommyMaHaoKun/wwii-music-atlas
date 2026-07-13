import type { Language, StylePhase } from '@/data/ww2MusicAtlas'

export type StylePaletteKey =
  | 'jazz'
  | 'state'
  | 'lyric'
  | 'choral'
  | 'broadcast'
  | 'postwar'

export interface StylePalette {
  key: StylePaletteKey
  labelZh: string
  labelEn: string
  color: string
  glow: string
}

export const STYLE_PALETTES: StylePalette[] = [
  {
    key: 'jazz',
    labelZh: '摇摆 / 爵士',
    labelEn: 'Swing / Jazz',
    color: '#d4a24b',
    glow: 'rgba(212, 162, 75, 0.22)',
  },
  {
    key: 'state',
    labelZh: '宣传 / 国策',
    labelEn: 'Propaganda / State',
    color: '#c95b4f',
    glow: 'rgba(201, 91, 79, 0.22)',
  },
  {
    key: 'lyric',
    labelZh: '香颂 / 都市抒情',
    labelEn: 'Chanson / Urban Lyric',
    color: '#5f9b8f',
    glow: 'rgba(95, 155, 143, 0.22)',
  },
  {
    key: 'choral',
    labelZh: '群众合唱 / 动员',
    labelEn: 'Mass Chorus / Mobilization',
    color: '#84964a',
    glow: 'rgba(132, 150, 74, 0.22)',
  },
  {
    key: 'broadcast',
    labelZh: '广播 / 仪式轻音乐',
    labelEn: 'Broadcast / Ceremonial Light',
    color: '#8c78b8',
    glow: 'rgba(140, 120, 184, 0.22)',
  },
  {
    key: 'postwar',
    labelZh: '战后流行 / 重建',
    labelEn: 'Postwar Pop / Reconstruction',
    color: '#5f86c9',
    glow: 'rgba(95, 134, 201, 0.22)',
  },
]

const paletteByKey = new Map(STYLE_PALETTES.map((palette) => [palette.key, palette]))

function includesAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern))
}

export function resolveStylePalette(phase: StylePhase | null | undefined): StylePalette {
  if (!phase) {
    return paletteByKey.get('broadcast')!
  }

  const text = `${phase.styleNameEn} ${phase.keywords.join(' ')} ${phase.summaryEn}`.toLowerCase()

  if (
    includesAny(text, [
      'postwar',
      'occupation radio',
      'repopularization',
      'reconstruction',
      'crooners',
      'bebop',
      'boogie',
      'festival',
      'reorientation',
      'recovery',
      'new state voice',
    ])
  ) {
    return paletteByKey.get('postwar')!
  }

  if (
    includesAny(text, [
      'propaganda',
      'policy',
      'state songs',
      'fascist',
      'national policy',
      'gunka',
      'purge',
      'march',
      'controlled entertainment',
    ])
  ) {
    return paletteByKey.get('state')!
  }

  if (
    includesAny(text, [
      'swing',
      'jazz',
      'big band',
      'dance halls',
      'boogie',
    ])
  ) {
    return paletteByKey.get('jazz')!
  }

  if (
    includesAny(text, [
      'chanson',
      'cabaret',
      'urban',
      'shidaiqu',
      'ryuko-ka',
      'film songs',
      'operetta',
      'left bank',
      'lyrical',
    ])
  ) {
    return paletteByKey.get('lyric')!
  }

  if (
    includesAny(text, [
      'mass song',
      'choral',
      'great patriotic',
      'resistance',
      'mobilization',
      'revolutionary',
      'socialist realist',
      'front songs',
      'heroic',
    ])
  ) {
    return paletteByKey.get('choral')!
  }

  return paletteByKey.get('broadcast')!
}

export function getStylePaletteLabel(palette: StylePalette, language: Language) {
  return language === 'zh' ? palette.labelZh : palette.labelEn
}
