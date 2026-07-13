import type { Language } from '@/data/ww2MusicAtlas'
import { publicAssetPath } from '@/lib/publicAssets'

export interface ArtistPortrait {
  src: string
  altZh: string
  altEn: string
  credit: string
  sourceUrl: string
  licenseLabel: string
  licenseUrl?: string
  generated: boolean
}

export interface ArtistWork {
  title: string
  year: string
  noteZh: string
  noteEn: string
  sourceUrl: string
  streamUrl?: string
  rightsLabel: string
  rightsUrl?: string
}

export interface ArtistMarker {
  id: string
  countryId: string
  lat: number
  lng: number
  startYear: number
  endYear: number
  nameZh: string
  nameEn: string
  noteZh: string
  noteEn: string
  summaryZh?: string
  summaryEn?: string
  countryRoleZh: string
  countryRoleEn: string
  representativeWorks: ArtistWork[]
  linkedEventIds: string[]
  linkedPhaseKeys: string[]
  portrait: ArtistPortrait
  sourceIds?: string[]
  audioClipIds?: string[]
}

const sourcedPortraitLicenseLabel = 'Wikimedia Commons image; see source page for rights'
const generatedPortraitLicenseLabel = 'Generated project asset; not a historical photograph'

function commonsFilePage(fileName: string) {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName.replace(/ /g, '_'))}`
}

function sourcedPortrait(input: {
  fileName: string
  commonsFile: string
  altZh: string
  altEn: string
  credit?: string
  licenseLabel?: string
  licenseUrl?: string
  sourceUrl?: string
}): ArtistPortrait {
  const { fileName, commonsFile, credit, licenseLabel, sourceUrl, ...metadata } = input

  return {
    src: publicAssetPath(`/images/artists/${fileName}`),
    ...metadata,
    credit: credit ?? `Wikimedia Commons: ${commonsFile}`,
    sourceUrl: sourceUrl ?? commonsFilePage(commonsFile),
    licenseLabel: licenseLabel ?? sourcedPortraitLicenseLabel,
    generated: false,
  }
}

function generatedPortrait(input: {
  fileName: string
  altZh: string
  altEn: string
}): ArtistPortrait {
  const id = input.fileName.replace(/\.webp$/, '')

  return {
    src: publicAssetPath(`/images/artists/${input.fileName}`),
    altZh: input.altZh,
    altEn: input.altEn,
    credit: 'Generated with OpenAI image generation for this project',
    sourceUrl: `generated:imagegen:${id}`,
    licenseLabel: generatedPortraitLicenseLabel,
    generated: true,
  }
}

function work(input: ArtistWork): ArtistWork {
  if (input.streamUrl) {
    return { ...input, streamUrl: publicAssetPath(input.streamUrl) }
  }

  return input
}

export const artistMarkers: ArtistMarker[] = [
  {
    id: 'benny-goodman',
    countryId: 'us',
    lat: 40.71,
    lng: -74.0,
    startYear: 1935,
    endYear: 1945,
    nameZh: '本尼·古德曼',
    nameEn: 'Benny Goodman',
    noteZh: '纽约摇摆乐和大乐队时代里绕不开的人物。',
    noteEn: 'A defining New York figure of the swing and big-band era.',
    countryRoleZh: '战前美国商业广播和舞厅文化的代表。',
    countryRoleEn: 'Represents prewar U.S. commercial broadcasting and dance-hall culture.',
    representativeWorks: [
      work({
        title: 'Sing, Sing, Sing',
        year: '1937',
        noteZh: '把摇摆乐的大乐队能量推向全国舞厅和电台。',
        noteEn: 'Carried big-band swing energy into national dance halls and radio.',
        sourceUrl: 'https://www.britannica.com/biography/Benny-Goodman',
        rightsLabel: 'Biography reference only',
      }),
      work({
        title: 'King Porter Stomp',
        year: '1935',
        noteZh: '常被用来说明摇摆乐从编曲、广播到舞厅流通的成型。',
        noteEn: 'Often used to explain swing taking shape through arrangement, broadcast, and dance circulation.',
        sourceUrl: 'https://www.loc.gov/research-centers/recorded-sound/collections/',
        rightsLabel: 'Archive gateway reference only',
      }),
    ],
    linkedEventIds: ['europe-war', 'pearl-harbor'],
    linkedPhaseKeys: ['us:1931', 'us:1939'],
    portrait: sourcedPortrait({
      fileName: 'benny-goodman.webp',
      commonsFile: 'Benny_Goodman_1942.jpg',
      altZh: 'Portrait of Benny Goodman',
      altEn: 'Portrait of Benny Goodman',
    }),
  },
  {
    id: 'andrews-sisters',
    countryId: 'us',
    lat: 34.05,
    lng: -118.24,
    startYear: 1941,
    endYear: 1945,
    nameZh: '安德鲁斯姐妹',
    nameEn: 'The Andrews Sisters',
    noteZh: '美国战时娱乐体系中最具传播力的女声组合之一。',
    noteEn: 'One of the most widely circulated female groups in the U.S. wartime entertainment system.',
    countryRoleZh: '军中慰问、唱片和广播一起推开的士气声音。',
    countryRoleEn: 'A morale sound shaped by troop shows, records, and radio.',
    representativeWorks: [
      work({
        title: 'Boogie Woogie Bugle Boy',
        year: '1941',
        noteZh: '把军营形象、布吉节奏和流行合唱包装成战时大众娱乐。',
        noteEn: 'Wrapped camp imagery, boogie rhythm, and close harmony into wartime pop.',
        sourceUrl: 'https://blogs.loc.gov/loc/2020/10/a-soundtrack-of-world-war-ii/',
        rightsLabel: 'Archive essay reference only',
      }),
      work({
        title: "Don't Sit Under the Apple Tree",
        year: '1942',
        noteZh: '以轻快合唱表达离别和等待，是美国战时流行歌的重要情感公式。',
        noteEn: 'Used bright harmony to express separation and waiting, a key U.S. wartime pop formula.',
        sourceUrl: 'https://www.loc.gov/static/programs/national-recording-preservation-board/recording-registry/induction-years/2008.html',
        rightsLabel: 'Registry reference only',
      }),
    ],
    linkedEventIds: ['pearl-harbor', 'marshall-broadcast'],
    linkedPhaseKeys: ['us:1939'],
    portrait: sourcedPortrait({
      fileName: 'andrews-sisters.webp',
      commonsFile: 'Andrews_Sisters_Billboard_4.jpg',
      altZh: 'Group portrait of The Andrews Sisters',
      altEn: 'Group portrait of The Andrews Sisters',
    }),
  },
  {
    id: 'glenn-miller',
    countryId: 'us',
    lat: 39.74,
    lng: -104.99,
    startYear: 1939,
    endYear: 1945,
    nameZh: '格伦·米勒',
    nameEn: 'Glenn Miller',
    noteZh: '把摇摆乐、军乐团和盟军广播连接起来的代表人物。',
    noteEn: 'A key figure linking swing, military bands, and Allied broadcasting.',
    countryRoleZh: '美国战时跨大西洋传播中很容易听出来的大乐队声音。',
    countryRoleEn: 'An emblematic big-band sound of U.S. transatlantic wartime circulation.',
    representativeWorks: [
      work({
        title: 'In the Mood',
        year: '1939',
        noteZh: '成为盟军广播和战后欧洲舞厅中最醒目的美国摇摆乐符号之一。',
        noteEn: 'Became one of the most visible U.S. swing symbols in Allied radio and postwar European dance halls.',
        sourceUrl: 'https://www.loc.gov/research-centers/recorded-sound/collections/',
        rightsLabel: 'Archive gateway reference only',
      }),
      work({
        title: 'Moonlight Serenade',
        year: '1939',
        noteZh: '展示美国大乐队如何兼具亲密抒情和高流通度。',
        noteEn: 'Shows how U.S. big bands combined intimate lyricism with mass circulation.',
        sourceUrl: 'https://www.loc.gov/research-centers/recorded-sound/collections/',
        rightsLabel: 'Archive gateway reference only',
      }),
    ],
    linkedEventIds: ['pearl-harbor', 'germany-surrender', 'marshall-broadcast'],
    linkedPhaseKeys: ['us:1939', 'us:1946'],
    sourceIds: ['loc-recorded-sound', 'loc-soundtrack-wwii'],
    portrait: sourcedPortrait({
      fileName: 'glenn-miller.webp',
      commonsFile: 'Glenn_Miller_Billboard.jpg',
      altZh: 'Portrait of Glenn Miller',
      altEn: 'Portrait of Glenn Miller',
    }),
  },
  {
    id: 'vera-lynn',
    countryId: 'uk',
    lat: 51.5,
    lng: -0.12,
    startYear: 1939,
    endYear: 1945,
    nameZh: '薇拉·琳恩',
    nameEn: 'Vera Lynn',
    noteZh: '伦敦战时广播与慰问演出的象征性声音。',
    noteEn: 'An emblematic voice of London wartime broadcasting and morale performances.',
    countryRoleZh: '把离别、等待和重逢写成英国战时共同情绪。',
    countryRoleEn: 'Turned separation, waiting, and reunion into Britain’s wartime emotional commons.',
    representativeWorks: [
      work({
        title: "We'll Meet Again",
        year: '1939',
        noteZh: '英国战时广播中最具识别度的慰问歌曲之一。',
        noteEn: 'One of the most recognizable morale songs in British wartime broadcasting.',
        sourceUrl: 'https://www.iwm.org.uk/collections/sound',
        rightsLabel: 'Archive record only',
        rightsUrl: 'https://www.iwm.org.uk/terms-and-conditions',
      }),
      work({
        title: 'The White Cliffs of Dover',
        year: '1942',
        noteZh: '用地理意象承载家园、空袭和胜利期待。',
        noteEn: 'Uses geography to carry home, air-raid life, and the expectation of victory.',
        sourceUrl: 'https://www.iwm.org.uk/collections/sound',
        rightsLabel: 'Archive record only',
      }),
    ],
    linkedEventIds: ['europe-war', 'germany-surrender'],
    linkedPhaseKeys: ['uk:1939'],
    portrait: sourcedPortrait({
      fileName: 'vera-lynn.webp',
      commonsFile: 'Dame_Vera_Lynn_4_Allan_Warren.jpg',
      altZh: 'Portrait of Vera Lynn',
      altEn: 'Portrait of Vera Lynn',
    }),
  },
  {
    id: 'gracie-fields',
    countryId: 'uk',
    lat: 53.61,
    lng: -2.16,
    startYear: 1931,
    endYear: 1945,
    nameZh: '格雷西·菲尔兹',
    nameEn: 'Gracie Fields',
    noteZh: '音乐厅、电影和战时慰问之间的重要英国大众歌手。',
    noteEn: 'A major British popular singer linking music hall, film, and wartime morale.',
    countryRoleZh: '代表英国从音乐厅传统到战时群众娱乐的连续性。',
    countryRoleEn: 'Represents continuity from music hall tradition into wartime mass entertainment.',
    representativeWorks: [
      work({
        title: 'Sally',
        year: '1931',
        noteZh: '说明战前音乐厅和电影歌曲怎样影响英国大众声音。',
        noteEn: 'Shows how prewar music hall and film song shaped British popular sound.',
        sourceUrl: 'https://www.iwm.org.uk/collections/sound',
        rightsLabel: 'Archive gateway reference only',
      }),
      work({
        title: 'Wish Me Luck as You Wave Me Goodbye',
        year: '1939',
        noteZh: '把出征离别转换成可共同演唱的轻歌形式。',
        noteEn: 'Turned departure and farewell into a singable light-music form.',
        sourceUrl: 'https://www.iwm.org.uk/collections/sound',
        rightsLabel: 'Archive gateway reference only',
      }),
    ],
    linkedEventIds: ['europe-war'],
    linkedPhaseKeys: ['uk:1931', 'uk:1939'],
    sourceIds: ['iwm-sound', 'britannica-vera-lynn'],
    portrait: generatedPortrait({
      fileName: 'gracie-fields.webp',
      altZh: 'Generated portrait of Gracie Fields',
      altEn: 'Generated portrait of Gracie Fields',
    }),
  },
  {
    id: 'noel-coward',
    countryId: 'uk',
    lat: 51.5,
    lng: -0.1,
    startYear: 1931,
    endYear: 1945,
    nameZh: '诺埃尔·考沃德',
    nameEn: 'Noel Coward',
    noteZh: '以剧场、歌曲和讽刺文本记录英国战时心态。',
    noteEn: 'Used theatre, song, and satire to record British wartime mentality.',
    countryRoleZh: '连接伦敦舞台、广播和战时宣传幽默。',
    countryRoleEn: 'Connects the London stage, radio, and wartime propaganda humor.',
    representativeWorks: [
      work({
        title: 'London Pride',
        year: '1941',
        noteZh: '把城市坚韧转化为舞台化、广播化的伦敦形象。',
        noteEn: 'Turned urban endurance into a staged and broadcast image of London.',
        sourceUrl: 'https://www.iwm.org.uk/collections/sound',
        rightsLabel: 'Archive gateway reference only',
      }),
      work({
        title: "Don't Let's Be Beastly to the Germans",
        year: '1943',
        noteZh: '用讽刺口吻处理战争情绪和敌我想象。',
        noteEn: 'Handled war feeling and enemy imagery through satire.',
        sourceUrl: 'https://www.iwm.org.uk/collections/sound',
        rightsLabel: 'Archive gateway reference only',
      }),
    ],
    linkedEventIds: ['europe-war', 'germany-surrender'],
    linkedPhaseKeys: ['uk:1939'],
    sourceIds: ['iwm-sound', 'britannica-world-war-ii'],
    portrait: generatedPortrait({
      fileName: 'noel-coward.webp',
      altZh: 'Generated portrait of Noel Coward',
      altEn: 'Generated portrait of Noel Coward',
    }),
  },
  {
    id: 'kurt-weill',
    countryId: 'de',
    lat: 52.52,
    lng: 13.4,
    startYear: 1931,
    endYear: 1933,
    nameZh: '库尔特·魏尔',
    nameEn: 'Kurt Weill',
    noteZh: '魏玛余波中最重要的都市音乐与剧场作曲家之一。',
    noteEn: 'One of the key urban music and theatre composers of the late Weimar moment.',
    countryRoleZh: '代表被纳粹文化清洗切断的魏玛现代性。',
    countryRoleEn: 'Represents the Weimar modernity severed by Nazi cultural purge.',
    representativeWorks: [
      work({
        title: 'Mack the Knife',
        year: '1928',
        noteZh: '都市讽刺、剧场歌曲和现代主义混在一起的例子。',
        noteEn: 'A marker of urban satire, theatre song, and modernist hybridity.',
        sourceUrl: 'https://www.kwf.org/about/',
        rightsLabel: 'Foundation reference only',
      }),
      work({
        title: 'Alabama Song',
        year: '1927',
        noteZh: '展示魏玛舞台音乐的跨语种和跨大西洋潜力。',
        noteEn: 'Shows the multilingual and transatlantic potential of Weimar stage music.',
        sourceUrl: 'https://www.kwf.org/about/',
        rightsLabel: 'Foundation reference only',
      }),
    ],
    linkedEventIds: ['reich-chamber'],
    linkedPhaseKeys: ['de:1931'],
    portrait: generatedPortrait({
      fileName: 'kurt-weill.webp',
      altZh: 'Generated portrait of Kurt Weill',
      altEn: 'Generated portrait of Kurt Weill',
    }),
  },
  {
    id: 'lale-andersen',
    countryId: 'de',
    lat: 53.55,
    lng: 9.99,
    startYear: 1940,
    endYear: 1945,
    nameZh: '拉蕾·安德森',
    nameEn: 'Lale Andersen',
    noteZh: '《莉莉玛莲》让她成为横跨前线的战时声音。',
    noteEn: '“Lili Marleen” made her a wartime voice heard across multiple fronts.',
    countryRoleZh: '说明受控娱乐中仍可能出现跨阵营传播。',
    countryRoleEn: 'Shows how controlled entertainment could still cross enemy lines.',
    representativeWorks: [
      work({
        title: 'Lili Marleen',
        year: '1939 / wartime circulation',
        noteZh: '极少数真正跨越轴心国和盟军前线的战时歌曲。',
        noteEn: 'One of the rare wartime songs to cross Axis and Allied fronts.',
        sourceUrl: 'http://www.iwm.org.uk/collections/item/object/205124602',
        rightsLabel: 'Archive record only',
        rightsUrl: 'https://www.iwm.org.uk/terms-and-conditions',
      }),
    ],
    linkedEventIds: ['reich-chamber', 'europe-war', 'germany-surrender'],
    linkedPhaseKeys: ['de:1936', 'de:1944'],
    portrait: generatedPortrait({
      fileName: 'lale-andersen.webp',
      altZh: 'Generated portrait of Lale Andersen',
      altEn: 'Generated portrait of Lale Andersen',
    }),
  },
  {
    id: 'zarah-leander',
    countryId: 'de',
    lat: 52.52,
    lng: 13.4,
    startYear: 1936,
    endYear: 1945,
    nameZh: '莎拉·莱安德',
    nameEn: 'Zarah Leander',
    noteZh: '纳粹时期电影音乐与受控娱乐工业中的明星声音。',
    noteEn: 'A star voice of Nazi-era film music and controlled entertainment.',
    countryRoleZh: '代表宣传体制中被保留的轻娱乐和银幕歌唱。',
    countryRoleEn: 'Represents light entertainment and screen song retained inside propaganda systems.',
    representativeWorks: [
      work({
        title: 'Davon geht die Welt nicht unter',
        year: '1942',
        noteZh: '典型地把灾难感转化为维持秩序的银幕安慰。',
        noteEn: 'Turned crisis into screen consolation that helped sustain order.',
        sourceUrl: 'https://encyclopedia.ushmm.org/content/en/article/degenerate-art-1',
        rightsLabel: 'Historical context reference only',
      }),
      work({
        title: 'Ich weiss, es wird einmal ein Wunder geschehn',
        year: '1942',
        noteZh: '以希望修辞支撑战时娱乐的情绪管理功能。',
        noteEn: 'Used hope rhetoric to support wartime entertainment’s emotional-management role.',
        sourceUrl: 'https://encyclopedia.ushmm.org/content/en/article/degenerate-art-1',
        rightsLabel: 'Historical context reference only',
      }),
    ],
    linkedEventIds: ['rome-berlin-axis', 'stalingrad'],
    linkedPhaseKeys: ['de:1936'],
    sourceIds: ['ushmm-degenerate-art', 'britannica-world-war-ii'],
    portrait: generatedPortrait({
      fileName: 'zarah-leander.webp',
      altZh: 'Generated portrait of Zarah Leander',
      altEn: 'Generated portrait of Zarah Leander',
    }),
  },
  {
    id: 'klavdiya-shulzhenko',
    countryId: 'su',
    lat: 59.93,
    lng: 30.33,
    startYear: 1941,
    endYear: 1945,
    nameZh: '克拉夫季娅·舒尔任科',
    nameEn: 'Klavdiya Shulzhenko',
    noteZh: '列宁格勒和前线歌曲传统中很有辨识度的歌者。',
    noteEn: 'A defining singer of Leningrad and frontline song culture.',
    countryRoleZh: '代表苏联前线抒情和集体动员的柔性一面。',
    countryRoleEn: 'Represents the lyrical side of Soviet frontline mobilization.',
    representativeWorks: [
      work({
        title: 'The Blue Scarf',
        year: '1942',
        noteZh: '以离别和等待表达前线情感，成为苏联战时传播的重要歌曲。',
        noteEn: 'Expressed frontline feeling through separation and waiting, becoming a major Soviet wartime song.',
        sourceUrl: 'https://www.iwm.org.uk/collections/item/object/80030723',
        rightsLabel: 'Archive record only',
        rightsUrl: 'https://www.iwm.org.uk/terms-and-conditions',
      }),
    ],
    linkedEventIds: ['barbarossa', 'stalingrad'],
    linkedPhaseKeys: ['su:1939'],
    portrait: generatedPortrait({
      fileName: 'klavdiya-shulzhenko.webp',
      altZh: 'Generated portrait of Klavdiya Shulzhenko',
      altEn: 'Generated portrait of Klavdiya Shulzhenko',
    }),
  },
  {
    id: 'alexander-alexandrov',
    countryId: 'su',
    lat: 55.75,
    lng: 37.62,
    startYear: 1931,
    endYear: 1945,
    nameZh: '亚历山大·亚历山德罗夫',
    nameEn: 'Alexander Alexandrov',
    noteZh: '红军合唱传统和苏联国家化声响的重要组织者。',
    noteEn: 'A core organizer of the Red Army choir tradition and Soviet state sound.',
    countryRoleZh: '把合唱、国家仪式和战争动员连成一个声音系统。',
    countryRoleEn: 'Joined chorus, state ceremony, and wartime mobilization into one sound system.',
    representativeWorks: [
      work({
        title: 'Sacred War',
        year: '1941',
        noteZh: '以庄严合唱定型“卫国战争”的公共语气。',
        noteEn: 'Defined the public tone of the Great Patriotic War through solemn chorus.',
        sourceUrl: 'https://www.britannica.com/place/Russia/Music',
        rightsLabel: 'Historical reference only',
      }),
      work({
        title: 'State Anthem of the Soviet Union',
        year: '1944',
        noteZh: '展示战时胜利叙事如何进入国家仪式音乐。',
        noteEn: 'Shows wartime victory narrative entering state ceremonial music.',
        sourceUrl: 'https://www.britannica.com/place/Russia/Music',
        rightsLabel: 'Historical reference only',
      }),
    ],
    linkedEventIds: ['barbarossa', 'stalingrad', 'germany-surrender'],
    linkedPhaseKeys: ['su:1931', 'su:1939'],
    sourceIds: ['britannica-russia-music', 'britannica-barbarossa'],
    portrait: generatedPortrait({
      fileName: 'alexander-alexandrov.webp',
      altZh: 'Generated portrait of Alexander Alexandrov',
      altEn: 'Generated portrait of Alexander Alexandrov',
    }),
  },
  {
    id: 'dmitri-shostakovich',
    countryId: 'su',
    lat: 59.93,
    lng: 30.33,
    startYear: 1936,
    endYear: 1945,
    nameZh: '德米特里·肖斯塔科维奇',
    nameEn: 'Dmitri Shostakovich',
    noteZh: '把围城、国家叙事和交响音乐联系起来的苏联作曲家。',
    noteEn: 'A Soviet composer linking siege, state narrative, and symphonic music.',
    countryRoleZh: '代表战争压力下严肃音乐的公共政治角色。',
    countryRoleEn: 'Represents the public-political role of art music under wartime pressure.',
    representativeWorks: [
      work({
        title: 'Symphony No. 7 “Leningrad”',
        year: '1941',
        noteZh: '围城经验、广播传播和国际反法西斯叙事的交汇点。',
        noteEn: 'A junction of siege experience, broadcasting, and international anti-fascist narrative.',
        sourceUrl: 'https://www.britannica.com/place/Russia/Music',
        rightsLabel: 'Historical reference only',
      }),
      work({
        title: 'Piano Trio No. 2',
        year: '1944',
        noteZh: '以室内乐语言承载战争哀悼和个人创伤。',
        noteEn: 'Uses chamber language to carry wartime mourning and private trauma.',
        sourceUrl: 'https://www.britannica.com/place/Russia/Music',
        rightsLabel: 'Historical reference only',
      }),
    ],
    linkedEventIds: ['barbarossa', 'stalingrad'],
    linkedPhaseKeys: ['su:1939'],
    sourceIds: ['britannica-russia-music', 'britannica-stalingrad'],
    portrait: generatedPortrait({
      fileName: 'dmitri-shostakovich.webp',
      altZh: 'Generated portrait of Dmitri Shostakovich',
      altEn: 'Generated portrait of Dmitri Shostakovich',
    }),
  },
  {
    id: 'edith-piaf',
    countryId: 'fr',
    lat: 48.86,
    lng: 2.35,
    startYear: 1940,
    endYear: 1949,
    nameZh: '艾迪特·皮雅芙',
    nameEn: 'Edith Piaf',
    noteZh: '占领与解放之后巴黎香颂最具代表性的声音。',
    noteEn: 'One of the defining chanson voices of occupied and liberated Paris.',
    countryRoleZh: '连接占领时期的隐喻生存和解放后的国际化舞台。',
    countryRoleEn: 'Links occupation-era coded survival with the international post-liberation stage.',
    representativeWorks: [
      work({
        title: 'La Vie en rose',
        year: '1946',
        noteZh: '把战后巴黎亲密香颂变成国际化标识。',
        noteEn: 'Turned postwar Parisian intimate chanson into an international signature.',
        sourceUrl: 'https://www.ina.fr/ina-eclaire-actu/video/i00013654/edith-piaf-la-vie-en-rose',
        rightsLabel: 'External archive playback',
        rightsUrl: 'https://www.ina.fr/rights',
      }),
      work({
        title: 'Hymne a l’amour',
        year: '1949',
        noteZh: '延续战后法国香颂中私人情感和公共舞台的结合。',
        noteEn: 'Continues the postwar chanson blend of private feeling and public stage.',
        sourceUrl: 'https://www.britannica.com/biography/Edith-Piaf',
        rightsLabel: 'Biography reference only',
      }),
    ],
    linkedEventIds: ['liberation-paris', 'marshall-broadcast'],
    linkedPhaseKeys: ['fr:1939', 'fr:1945'],
    portrait: generatedPortrait({
      fileName: 'edith-piaf.webp',
      altZh: 'Generated portrait of Edith Piaf',
      altEn: 'Generated portrait of Edith Piaf',
    }),
  },
  {
    id: 'django-reinhardt',
    countryId: 'fr',
    lat: 48.86,
    lng: 2.29,
    startYear: 1935,
    endYear: 1946,
    nameZh: '姜戈·莱因哈特',
    nameEn: 'Django Reinhardt',
    noteZh: '巴黎俱乐部爵士与吉普赛爵士的重要象征。',
    noteEn: 'A central symbol of Paris club jazz and gypsy jazz.',
    countryRoleZh: '代表占领时期仍在延续的巴黎俱乐部爵士生命力。',
    countryRoleEn: 'Represents the survival of Paris club jazz under occupation.',
    representativeWorks: [
      work({
        title: 'Nuages',
        year: '1940',
        noteZh: '占领时期巴黎爵士的象征，战后继续连接本地俱乐部和国际网络。',
        noteEn: 'A symbol of occupation-era Paris jazz, later linking local clubs to international networks.',
        sourceUrl: 'https://www.britannica.com/biography/Django-Reinhardt',
        rightsLabel: 'Biography reference only',
      }),
      work({
        title: 'Minor Swing',
        year: '1937',
        noteZh: '战前巴黎爵士俱乐部文化里常被提到的曲目之一。',
        noteEn: 'A core number of prewar Paris jazz-club culture.',
        sourceUrl: 'https://www.britannica.com/biography/Django-Reinhardt',
        rightsLabel: 'Biography reference only',
      }),
    ],
    linkedEventIds: ['europe-war', 'liberation-paris'],
    linkedPhaseKeys: ['fr:1931', 'fr:1939', 'fr:1945'],
    portrait: generatedPortrait({
      fileName: 'django-reinhardt.webp',
      altZh: 'Generated portrait of Django Reinhardt',
      altEn: 'Generated portrait of Django Reinhardt',
    }),
  },
  {
    id: 'rina-ketty',
    countryId: 'fr',
    lat: 48.86,
    lng: 2.35,
    startYear: 1938,
    endYear: 1945,
    nameZh: '丽娜·凯蒂',
    nameEn: 'Rina Ketty',
    noteZh: '以《我会等待》连接战前流行歌和战时等待情绪。',
    noteEn: 'Linked prewar popular song to wartime waiting through “J’attendrai.”',
    countryRoleZh: '代表法国香颂中“等待”主题在战争中的再阐释。',
    countryRoleEn: 'Represents wartime reinterpretation of waiting in French chanson.',
    representativeWorks: [
      work({
        title: "J’attendrai",
        year: '1938',
        noteZh: '等待主题在战争初期被重新听见，成为法国流行歌中的悬置情绪。',
        noteEn: 'Its theme of waiting was re-heard in wartime as a suspended emotional register.',
        sourceUrl: 'https://gallica.bnf.fr/accueil/fr/html/damia-la-tragedienne-de-la-chanson',
        rightsLabel: 'Archive essay reference only',
      }),
      work({
        title: 'Sombreros et mantilles',
        year: '1938',
        noteZh: '展示战前法国轻歌和异国情调流行想象。',
        noteEn: 'Shows prewar French light song and exotic popular imagination.',
        sourceUrl: 'https://gallica.bnf.fr/accueil/fr/html/damia-la-tragedienne-de-la-chanson',
        rightsLabel: 'Archive essay reference only',
      }),
    ],
    linkedEventIds: ['europe-war'],
    linkedPhaseKeys: ['fr:1931', 'fr:1939'],
    sourceIds: ['gallica-damia', 'britannica-world-war-ii'],
    portrait: generatedPortrait({
      fileName: 'rina-ketty.webp',
      altZh: 'Generated portrait of Rina Ketty',
      altEn: 'Generated portrait of Rina Ketty',
    }),
  },
  {
    id: 'carlo-buti',
    countryId: 'it',
    lat: 43.77,
    lng: 11.25,
    startYear: 1931,
    endYear: 1940,
    nameZh: '卡洛·布蒂',
    nameEn: 'Carlo Buti',
    noteZh: '广播时代前期意大利抒情流行歌曲代表。',
    noteEn: 'An early radio-era representative of Italian lyrical popular song.',
    countryRoleZh: '说明意大利官方仪式和大众娱乐并行的声景。',
    countryRoleEn: 'Shows a soundscape where official ceremony and mass entertainment coexisted.',
    representativeWorks: [
      work({
        title: 'Faccetta Nera',
        year: '1935',
        noteZh: '殖民宣传和大众旋律结合的例子。',
        noteEn: 'An example of colonial propaganda fused with popular melody.',
        sourceUrl: 'https://canzoneitaliana.it/en/canzone/faccetta-nera-testo-ufficiale-dello-spartito-en/',
        rightsLabel: 'Archive record only',
      }),
      work({
        title: 'Reginella campagnola',
        year: '1939',
        noteZh: '以乡村怀旧和轻快旋律补充意大利战前大众歌唱图景。',
        noteEn: 'Adds rural nostalgia and light melody to Italy’s prewar popular-song picture.',
        sourceUrl: 'https://www.britannica.com/place/Italy/Music',
        rightsLabel: 'Overview reference only',
      }),
    ],
    linkedEventIds: ['rome-berlin-axis', 'europe-war'],
    linkedPhaseKeys: ['it:1931', 'it:1939'],
    portrait: generatedPortrait({
      fileName: 'carlo-buti.webp',
      altZh: 'Generated portrait of Carlo Buti',
      altEn: 'Generated portrait of Carlo Buti',
    }),
  },
  {
    id: 'nilla-pizzi',
    countryId: 'it',
    lat: 45.46,
    lng: 9.19,
    startYear: 1946,
    endYear: 1949,
    nameZh: '尼拉·皮齐',
    nameEn: 'Nilla Pizzi',
    noteZh: '战后大众歌谣和节庆型流行风格的重要人物。',
    noteEn: 'A major figure in postwar popular ballads and festival-oriented pop.',
    countryRoleZh: '代表意大利从仪式广播转向战后大众抒情流行。',
    countryRoleEn: 'Represents Italy’s turn from ceremonial broadcasting toward postwar lyrical pop.',
    representativeWorks: [
      work({
        title: 'Grazie dei fiori',
        year: '1951',
        noteZh: '虽略晚于时间轴，但代表战后节庆型流行歌的制度化方向。',
        noteEn: 'Slightly after the timeline, but marks the institutional direction of postwar festival pop.',
        sourceUrl: 'https://www.britannica.com/place/Italy/Music',
        rightsLabel: 'Overview reference only',
      }),
      work({
        title: 'Vola colomba',
        year: '1952',
        noteZh: '延续战后重建、民族情感和大众舞台的结合。',
        noteEn: 'Continues the blend of reconstruction, national feeling, and popular stage.',
        sourceUrl: 'https://www.britannica.com/place/Italy/Music',
        rightsLabel: 'Overview reference only',
      }),
    ],
    linkedEventIds: ['marshall-broadcast'],
    linkedPhaseKeys: ['it:1946'],
    portrait: generatedPortrait({
      fileName: 'nilla-pizzi.webp',
      altZh: 'Generated portrait of Nilla Pizzi',
      altEn: 'Generated portrait of Nilla Pizzi',
    }),
  },
  {
    id: 'lina-termini',
    countryId: 'it',
    lat: 38.12,
    lng: 13.36,
    startYear: 1937,
    endYear: 1945,
    nameZh: '莉娜·特米尼',
    nameEn: 'Lina Termini',
    noteZh: '战时广播与电影歌曲中的意大利抒情女声。',
    noteEn: 'An Italian lyrical female voice in wartime radio and film song.',
    countryRoleZh: '代表战争压力下仍维持的大众抒情娱乐。',
    countryRoleEn: 'Represents mass lyrical entertainment maintained under wartime pressure.',
    representativeWorks: [
      work({
        title: 'Ma l’amore no',
        year: '1943',
        noteZh: '用亲密抒情回应战时崩解和不确定感。',
        noteEn: 'Answered wartime breakdown and uncertainty with intimate lyricism.',
        sourceUrl: 'https://www.britannica.com/place/Italy/Music',
        rightsLabel: 'Overview reference only',
      }),
      work({
        title: 'Voglio vivere cosi',
        year: '1942',
        noteZh: '体现战时意大利轻歌中逃避、愿望和日常生活的混合。',
        noteEn: 'Shows escapism, desire, and everyday life mixed in Italian wartime light song.',
        sourceUrl: 'https://www.britannica.com/place/Italy/Music',
        rightsLabel: 'Overview reference only',
      }),
    ],
    linkedEventIds: ['europe-war', 'germany-surrender'],
    linkedPhaseKeys: ['it:1939'],
    sourceIds: ['italy-music-britannica', 'britannica-world-war-ii'],
    portrait: generatedPortrait({
      fileName: 'lina-termini.webp',
      altZh: 'Generated portrait of Lina Termini',
      altEn: 'Generated portrait of Lina Termini',
    }),
  },
  {
    id: 'noriko-awaya',
    countryId: 'jp',
    lat: 35.68,
    lng: 139.76,
    startYear: 1933,
    endYear: 1943,
    nameZh: '淡谷纪子',
    nameEn: 'Noriko Awaya',
    noteZh: '战前都市流行歌与电影歌曲的重要都会女声。',
    noteEn: 'A major urban female voice of prewar popular and film song.',
    countryRoleZh: '连接战前日本都会流行和逐渐收紧的文化管控。',
    countryRoleEn: 'Links prewar Japanese urban pop with tightening cultural control.',
    representativeWorks: [
      work({
        title: 'Wakare no Blues',
        year: '1937',
        noteZh: '战前日本都市忧郁歌唱的代表。',
        noteEn: 'A representative of prewar Japanese urban melancholy singing.',
        sourceUrl: 'https://sciendo.com/article/10.2478/vjeas-2011-0011',
        rightsLabel: 'Scholarship reference only',
      }),
      work({
        title: 'Yoru no Platform',
        year: '1939',
        noteZh: '以车站和离别意象连接都市流行歌与战时情绪。',
        noteEn: 'Uses station and farewell imagery to connect urban pop with wartime feeling.',
        sourceUrl: 'https://sciendo.com/article/10.2478/vjeas-2011-0011',
        rightsLabel: 'Scholarship reference only',
      }),
    ],
    linkedEventIds: ['mukden-incident', 'second-sino-japanese-war'],
    linkedPhaseKeys: ['jp:1931', 'jp:1938'],
    portrait: generatedPortrait({
      fileName: 'noriko-awaya.webp',
      altZh: 'Generated portrait of Noriko Awaya',
      altEn: 'Generated portrait of Noriko Awaya',
    }),
  },
  {
    id: 'shizuko-kasagi',
    countryId: 'jp',
    lat: 34.69,
    lng: 135.5,
    startYear: 1946,
    endYear: 1949,
    nameZh: '笠置静子',
    nameEn: 'Shizuko Kasagi',
    noteZh: '战后布吉和都市娱乐回潮的代表歌手。',
    noteEn: 'A defining singer of postwar boogie and urban entertainment revival.',
    countryRoleZh: '代表占领时期爵士、布吉和舞台能量的回归。',
    countryRoleEn: 'Represents the return of jazz, boogie, and stage energy under occupation.',
    representativeWorks: [
      work({
        title: 'Tokyo Boogie-Woogie',
        year: '1947',
        noteZh: '占领期重新流行起来的一首重要歌曲。',
        noteEn: 'A key song of occupation-era repopularization.',
        sourceUrl: 'https://www.nippon.com/en/japan-topics/g02332/',
        rightsLabel: 'Archive record only',
      }),
      work({
        title: 'Jungle Boogie',
        year: '1948',
        noteZh: '延续战后日本舞台表演和布吉节奏的高能量形象。',
        noteEn: 'Continues the high-energy image of postwar Japanese stage performance and boogie rhythm.',
        sourceUrl: 'https://www.nippon.com/en/japan-topics/g02332/',
        rightsLabel: 'Historical essay reference only',
      }),
    ],
    linkedEventIds: ['japan-surrender'],
    linkedPhaseKeys: ['jp:1946'],
    portrait: generatedPortrait({
      fileName: 'shizuko-kasagi.webp',
      altZh: 'Generated portrait of Shizuko Kasagi',
      altEn: 'Generated portrait of Shizuko Kasagi',
    }),
  },
  {
    id: 'ichiro-fujiyama',
    countryId: 'jp',
    lat: 35.68,
    lng: 139.76,
    startYear: 1931,
    endYear: 1945,
    nameZh: '藤山一郎',
    nameEn: 'Ichiro Fujiyama',
    noteZh: '连接都市流行歌、电影歌曲和战时国策歌曲的日本歌手。',
    noteEn: 'A Japanese singer linking urban pop, film song, and wartime policy song.',
    countryRoleZh: '代表日本流行歌从都会现代性转入国家动员的路径。',
    countryRoleEn: 'Represents Japanese pop moving from urban modernity into state mobilization.',
    representativeWorks: [
      work({
        title: 'Tokyo Rhapsody',
        year: '1936',
        noteZh: '战前日本都市流行歌的明亮面貌。',
        noteEn: 'Captures the bright urban side of prewar Japanese pop.',
        sourceUrl: 'https://sciendo.com/article/10.2478/vjeas-2011-0011',
        rightsLabel: 'Scholarship reference only',
      }),
      work({
        title: 'Aikoku Koshinkyoku',
        year: '1937',
        noteZh: '体现国策歌曲如何借助大众歌手和广播纪律扩散。',
        noteEn: 'Shows policy song spreading through popular singers and disciplined broadcasting.',
        sourceUrl: 'https://sciendo.com/article/10.2478/vjeas-2011-0011',
        rightsLabel: 'Scholarship reference only',
      }),
    ],
    linkedEventIds: ['mukden-incident', 'second-sino-japanese-war', 'japan-surrender'],
    linkedPhaseKeys: ['jp:1931', 'jp:1938'],
    sourceIds: ['japan-war-song-study'],
    portrait: generatedPortrait({
      fileName: 'ichiro-fujiyama.webp',
      altZh: 'Generated portrait of Ichiro Fujiyama',
      altEn: 'Generated portrait of Ichiro Fujiyama',
    }),
  },
  {
    id: 'zhou-xuan',
    countryId: 'cn',
    lat: 31.23,
    lng: 121.47,
    startYear: 1934,
    endYear: 1946,
    nameZh: '周璇',
    nameEn: 'Zhou Xuan',
    noteZh: '上海时代曲、电影歌曲和都市录音文化里绕不开的人物。',
    noteEn: 'A central figure in Shanghai popular song, film music, and urban recording culture.',
    countryRoleZh: '代表中国战前都市唱片工业和战后南迁电影歌唱。',
    countryRoleEn: 'Represents China’s prewar urban recording industry and postwar southward film-song movement.',
    representativeWorks: [
      work({
        title: 'Song of a Songstress',
        year: '1948',
        noteZh: '保存周璇战后影歌关系的重要线索。',
        noteEn: 'An important trail for Zhou Xuan’s postwar film-song repertoire.',
        sourceUrl: 'https://www.filmarchive.gov.hk/en/web/hkfa/pe-event-2023-cs-fs-film01.html',
        rightsLabel: 'Archive record only',
        rightsUrl: 'https://www.filmarchive.gov.hk/en/web/hkfa/policy.html',
      }),
      work({
        title: 'Nightlife in Shanghai',
        year: '1947',
        noteZh: '战后上海/香港影歌工业连续性的代表。',
        noteEn: 'Represents continuity in the postwar Shanghai and Hong Kong film-song industry.',
        sourceUrl: 'https://www.filmarchive.gov.hk/en_US/web/hkfa/20a-symposium.html',
        rightsLabel: 'Archive study reference only',
      }),
    ],
    linkedEventIds: ['mukden-incident', 'second-sino-japanese-war'],
    linkedPhaseKeys: ['cn:1931', 'cn:1946'],
    portrait: generatedPortrait({
      fileName: 'zhou-xuan.webp',
      altZh: 'Generated portrait of Zhou Xuan',
      altEn: 'Generated portrait of Zhou Xuan',
    }),
  },
  {
    id: 'xian-xinghai',
    countryId: 'cn',
    lat: 29.56,
    lng: 106.55,
    startYear: 1938,
    endYear: 1945,
    nameZh: '冼星海',
    nameEn: 'Xian Xinghai',
    noteZh: '抗战时期大型合唱和民族动员音乐中的重要作曲家。',
    noteEn: 'A core composer of wartime choral works and national mobilization music.',
    countryRoleZh: '把民族危机转化为可巡演、可组织、可共同演唱的公共音乐。',
    countryRoleEn: 'Turned national crisis into public music that could tour, organize, and be sung collectively.',
    representativeWorks: [
      work({
        title: 'Yellow River Cantata',
        year: '1939',
        noteZh: '中国抗战音乐中最具代表性的大型合唱作品之一。',
        noteEn: 'One of the defining large choral works of Chinese wartime music.',
        sourceUrl: 'https://www.icm.gov.mo/ef/news/detail/18214',
        rightsLabel: 'Museum reference only',
      }),
      work({
        title: 'Production Cantata',
        year: '1939',
        noteZh: '说明合唱如何服务劳动、动员和组织化公共生活。',
        noteEn: 'Shows chorus serving labor, mobilization, and organized public life.',
        sourceUrl: 'https://link.springer.com/article/10.1186/s41257-026-00150-4',
        rightsLabel: 'Scholarship reference only',
      }),
    ],
    linkedEventIds: ['second-sino-japanese-war', 'prc-founding'],
    linkedPhaseKeys: ['cn:1937', 'cn:1946'],
    portrait: generatedPortrait({
      fileName: 'xian-xinghai.webp',
      altZh: 'Generated portrait of Xian Xinghai',
      altEn: 'Generated portrait of Xian Xinghai',
    }),
  },
  {
    id: 'nie-er',
    countryId: 'cn',
    lat: 31.23,
    lng: 121.47,
    startYear: 1931,
    endYear: 1935,
    nameZh: '聂耳',
    nameEn: 'Nie Er',
    noteZh: '把电影歌曲、左翼文化和民族动员连接起来的中国作曲家。',
    noteEn: 'A Chinese composer linking film song, left cultural work, and national mobilization.',
    countryRoleZh: '代表中国抗战公共声音在电影和群众歌曲中的早期成型。',
    countryRoleEn: 'Represents early formation of Chinese wartime public sound in film and mass song.',
    representativeWorks: [
      work({
        title: 'March of the Volunteers',
        year: '1935',
        noteZh: '从电影歌曲进入民族动员语境，1949 年后成为新国家公共声音。',
        noteEn: 'Moved from film song into national mobilization and later state public sound.',
        sourceUrl: 'https://link.springer.com/article/10.1186/s41257-026-00150-4',
        rightsLabel: 'Scholarship reference only',
      }),
      work({
        title: 'Graduation Song',
        year: '1934',
        noteZh: '把青年、危机和公共歌唱联系起来的早期代表。',
        noteEn: 'An early example linking youth, crisis, and public singing.',
        sourceUrl: 'https://link.springer.com/article/10.1186/s41257-026-00150-4',
        rightsLabel: 'Scholarship reference only',
      }),
    ],
    linkedEventIds: ['mukden-incident', 'second-sino-japanese-war', 'prc-founding'],
    linkedPhaseKeys: ['cn:1931', 'cn:1937'],
    sourceIds: ['china-resistance-songs'],
    portrait: generatedPortrait({
      fileName: 'nie-er.webp',
      altZh: 'Generated portrait of Nie Er',
      altEn: 'Generated portrait of Nie Er',
    }),
  },
]

export function getArtistName(artist: ArtistMarker, language: Language) {
  return language === 'zh' ? artist.nameZh : artist.nameEn
}

export function getArtistNote(artist: ArtistMarker, language: Language) {
  return language === 'zh' ? artist.noteZh : artist.noteEn
}

export function getArtistRole(artist: ArtistMarker, language: Language) {
  return language === 'zh' ? artist.countryRoleZh : artist.countryRoleEn
}
