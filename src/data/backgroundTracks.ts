import type { BackgroundTrack } from '@/data/ww2MusicAtlas'
import { publicAssetPath } from '@/lib/publicAssets'

export const backgroundTracks: BackgroundTrack[] = [
  track({
    id: 'marines-hymn-usmc-band',
    titleZh: '海军陆战队赞歌',
    titleEn: "Marines' Hymn",
    countryId: 'us',
    yearLabel: '1915 / U.S. Marine Corps Band performance',
    src: '/audio/background/marines-hymn-usmc-band.ogg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Marines%27_Hymn,_USMC_Band.ogg',
    licenseLabel: 'Public domain on Wikimedia Commons',
    licenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Licensing',
    credit: 'U.S. Marine Corps Band via Wikimedia Commons',
    noteZh: '用于补充美国战时军乐与动员氛围的背景声场，不替代资料层中的原始录音出处。',
    noteEn: 'Used as an atmospheric U.S. wartime military-band layer rather than as a replacement for archival evidence in Sources.',
    sensitivity: 'patriotic',
  }),
  track({
    id: 'british-grenadiers',
    titleZh: '英国掷弹兵进行曲',
    titleEn: 'The British Grenadiers',
    countryId: 'uk',
    yearLabel: 'Traditional / public-domain military band recording',
    src: '/audio/background/british-grenadiers.ogg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:British_Grenadiers.ogg',
    licenseLabel: 'Public domain on Wikimedia Commons',
    licenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Licensing',
    credit: 'Wikimedia Commons audio collection',
    noteZh: '作为英国军乐传统的开放曲目，用于展厅背景轮播中的英伦声场。',
    noteEn: 'An openly reusable British military-band standard used to give the exhibition a British wartime sonic texture.',
    sensitivity: 'patriotic',
  }),
  track({
    id: 'la-marseillaise',
    titleZh: '马赛曲',
    titleEn: 'La Marseillaise',
    countryId: 'fr',
    yearLabel: '1792 / public-domain band performance',
    src: '/audio/background/la-marseillaise.ogg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:La_Marseillaise.ogg',
    licenseLabel: 'Public domain on Wikimedia Commons',
    licenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Licensing',
    credit: 'Wikimedia Commons audio collection',
    noteZh: '以开放授权馆藏文件补足法国抗争与解放语境下最易识别的公共声响。',
    noteEn: 'Included as a legally reusable public sound closely tied to French resistance, liberation, and civic ceremony.',
    sensitivity: 'patriotic',
  }),
  track({
    id: 'farewell-of-slavianka',
    titleZh: '斯拉夫女人的告别',
    titleEn: 'Farewell of Slavianka',
    countryId: 'su',
    yearLabel: '1912 / public-domain band performance',
    src: '/audio/background/farewell-of-slavianka.ogg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Farewell_of_Slavianka.ogg',
    licenseLabel: 'Public domain on Wikimedia Commons',
    licenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Licensing',
    credit: 'Wikimedia Commons audio collection',
    noteZh: '作为东线与苏联语境的开放背景曲，保留历史辨识度，同时避开更敏感的宣传类曲目。',
    noteEn: 'Used as an open Eastern Front / Soviet-context atmosphere track while avoiding more explicitly propagandistic material.',
    sensitivity: 'patriotic',
  }),
]

function track(input: BackgroundTrack): BackgroundTrack {
  return { ...input, src: publicAssetPath(input.src) }
}

export function getPlayableBackgroundTracks() {
  return backgroundTracks.filter((track) => track.sensitivity !== 'sensitive-context')
}
