import { publicAssetPath } from '@/lib/publicAssets'

export type Language = 'zh' | 'en'
export type AtlasMode = 'story' | 'explore'
export type LayerKey = 'styles' | 'events' | 'influence'

export interface CountryProfile {
  id: string
  nameZh: string
  nameEn: string
  lat: number
  lng: number
  region: string
  color: string
}

export interface StylePhase {
  countryId: string
  startYear: number
  endYear: number
  styleNameZh: string
  styleNameEn: string
  keywords: string[]
  summaryZh: string
  summaryEn: string
  representativeWorks: string[]
  representativeArtists: string[]
  historicalContextZh?: string
  historicalContextEn?: string
  representativeSongs?: RelatedSong[]
  sourceIds?: string[]
  audioClipIds?: string[]
}

export interface GlobeFocus {
  lat: number
  lng: number
  altitude: number
}

export interface EventImage {
  src: string
  altZh: string
  altEn: string
  captionZh?: string
  captionEn?: string
  credit: string
  sourceUrl: string
  licenseLabel: string
  licenseUrl?: string
  generated: boolean
}

export type RelatedSongSensitivity = 'neutral' | 'patriotic' | 'resistance' | 'sensitive-context'

export interface RelatedSong {
  title: string
  performer: string
  year: string
  noteZh: string
  noteEn: string
  contextZh?: string
  contextEn?: string
  eventRelationZh?: string
  eventRelationEn?: string
  listeningGuideZh?: string
  listeningGuideEn?: string
  sourceUrl: string
  streamUrl?: string
  rightsLabel: string
  rightsUrl?: string
  sensitivity?: RelatedSongSensitivity
  audioCredit?: string
}

export interface HistoricEvent {
  id: string
  year: number
  titleZh: string
  titleEn: string
  descriptionZh: string
  descriptionEn: string
  longDescriptionZh?: string
  longDescriptionEn?: string
  musicImpactZh?: string
  musicImpactEn?: string
  relatedSongs?: RelatedSong[]
  image?: EventImage
  affectedCountryIds: string[]
  category: 'policy' | 'conflict' | 'broadcast' | 'occupation' | 'liberation' | 'reconstruction'
  globeFocus: GlobeFocus
  sourceIds?: string[]
  audioClipIds?: string[]
}

export interface SourceReference {
  id: string
  title: string
  archiveOrAuthor: string
  year: string
  url: string
  kind: SourceKind
  isPrimary: boolean
  noteZh: string
  noteEn: string
}

export type SourceKind =
  | 'archive'
  | 'biography'
  | 'history'
  | 'study'
  | 'museum'
  | 'recording'
  | 'overview'
  | 'essay'
  | 'foundation'

export interface AudioClip {
  id: string
  title: string
  performer: string
  year: string
  recordUrl: string
  streamUrl?: string
  rightsLabel: string
  rightsUrl?: string
  noteZh: string
  noteEn: string
}

export type BackgroundTrackSensitivity = 'neutral' | 'patriotic' | 'sensitive-context'

export interface BackgroundTrack {
  id: string
  titleZh: string
  titleEn: string
  countryId?: string
  yearLabel: string
  src: string
  sourceUrl: string
  licenseLabel: string
  licenseUrl?: string
  credit: string
  noteZh: string
  noteEn: string
  sensitivity: BackgroundTrackSensitivity
}

export interface BibliographySection {
  id: string
  titleZh: string
  titleEn: string
  descriptionZh: string
  descriptionEn: string
  sourceIds: string[]
}

export interface InfluenceArc {
  sourceCountryId: string
  targetCountryId: string
  startYear: number
  endYear: number
  reasonZh: string
  reasonEn: string
  weight: number
}

export type ChapterEvidenceKind = 'historical-trigger' | 'music-mechanism' | 'audible-evidence'

export interface ChapterEvidencePoint {
  kind: ChapterEvidenceKind
  labelZh: string
  labelEn: string
  titleZh: string
  titleEn: string
  bodyZh: string
  bodyEn: string
}

export interface ChapterScene {
  id: string
  titleZh: string
  titleEn: string
  summaryZh: string
  summaryEn: string
  detailZh: string
  detailEn: string
  evidencePoints: ChapterEvidencePoint[]
  thumbnail: EventImage
  yearRange: [number, number]
  focusCountryIds: string[]
  focusEventIds: string[]
  cameraPose: GlobeFocus
}

export const YEAR_MIN = 1931
export const YEAR_MAX = 1949

function generatedChapterImage(src: string, altZh: string, altEn: string): EventImage {
  return {
    src: publicAssetPath(src),
    altZh,
    altEn,
    credit: 'Generated with OpenAI image generation for this project',
    sourceUrl: `generated:imagegen:${src.replace(/^\/images\/generated\/|\.png$/g, '')}`,
    licenseLabel: 'Generated project asset; not a historical photograph',
    generated: true,
  }
}

export const countries: CountryProfile[] = [
  { id: 'us', nameZh: '美国', nameEn: 'United States', lat: 38.9, lng: -77.0, region: 'North America', color: '#c98f58' },
  { id: 'uk', nameZh: '英国', nameEn: 'United Kingdom', lat: 51.5, lng: -0.1, region: 'Europe', color: '#94b4c7' },
  { id: 'de', nameZh: '德国', nameEn: 'Germany', lat: 52.5, lng: 13.4, region: 'Europe', color: '#d0674d' },
  { id: 'su', nameZh: '苏联', nameEn: 'Soviet Union', lat: 55.7, lng: 37.6, region: 'Eurasia', color: '#cb8350' },
  { id: 'fr', nameZh: '法国', nameEn: 'France', lat: 48.9, lng: 2.3, region: 'Europe', color: '#8aa58d' },
  { id: 'it', nameZh: '意大利', nameEn: 'Italy', lat: 41.9, lng: 12.5, region: 'Europe', color: '#a67c52' },
  { id: 'jp', nameZh: '日本', nameEn: 'Japan', lat: 35.7, lng: 139.7, region: 'East Asia', color: '#b66b68' },
  { id: 'cn', nameZh: '中国', nameEn: 'China', lat: 39.9, lng: 116.4, region: 'East Asia', color: '#ba9457' },
]

export const stylePhases: StylePhase[] = [
  {
    countryId: 'us',
    startYear: 1931,
    endYear: 1938,
    styleNameZh: '大乐队与新政广播',
    styleNameEn: 'Big Band and New Deal Broadcasting',
    keywords: ['swing', 'radio', 'dance halls'],
    summaryZh: '商业电台和舞厅把摇摆乐带到很多普通听众那里。经济萧条还没完全过去，跳舞和收音机成了便宜的安慰。',
    summaryEn: 'Commercial radio and dance halls carried swing to ordinary listeners. With the Depression still close, dancing and radio offered cheap comfort.',
    representativeWorks: ['In the Mood', 'Sing, Sing, Sing'],
    representativeArtists: ['Glenn Miller', 'Benny Goodman'],
  },
  {
    countryId: 'us',
    startYear: 1939,
    endYear: 1945,
    styleNameZh: '战时娱乐与军队传播',
    styleNameEn: 'Wartime Entertainment and Military Circulation',
    keywords: ['USO', 'broadcast', 'morale'],
    summaryZh: '军中演出、短波广播和唱片把爵士、流行歌带到海外基地。美国音乐不只是娱乐，也开始服务盟军士气。',
    summaryEn: 'Troop shows, shortwave radio, and records carried jazz and pop to overseas bases. American music became entertainment and morale work at the same time.',
    representativeWorks: ['Boogie Woogie Bugle Boy', "I'll Be Seeing You"],
    representativeArtists: ['The Andrews Sisters', 'Bing Crosby'],
  },
  {
    countryId: 'us',
    startYear: 1946,
    endYear: 1949,
    styleNameZh: '战后跨大西洋流行扩散',
    styleNameEn: 'Postwar Transatlantic Popular Expansion',
    keywords: ['crooners', 'bebop', 'records'],
    summaryZh: '战后唱片和驻军文化让美国流行歌、比波普和电台节目更容易进入欧洲和日本。我把它看成后来流行音乐扩散的一条早期线索。',
    summaryEn: 'Postwar records and military presence helped American pop, bebop, and radio formats reach Europe and Japan. I treat this as an early trail for later pop circulation.',
    representativeWorks: ['Move', 'Nature Boy'],
    representativeArtists: ['Dizzy Gillespie', 'Nat King Cole'],
  },
  {
    countryId: 'uk',
    startYear: 1931,
    endYear: 1938,
    styleNameZh: '舞厅乐队与帝国广播',
    styleNameEn: 'Dance Bands and Imperial Broadcasting',
    keywords: ['BBC', 'dance band', 'light music'],
    summaryZh: 'BBC 的节目安排很规整，轻音乐、舞厅乐队和帝国联播常常一起出现。声音不激进，但传播很稳定。',
    summaryEn: 'BBC programming was orderly, with light music, dance bands, and imperial relays often sitting together. The sound was not radical, but it traveled reliably.',
    representativeWorks: ['The Very Thought of You', 'The Lambeth Walk'],
    representativeArtists: ['Al Bowlly', 'Ambrose'],
  },
  {
    countryId: 'uk',
    startYear: 1939,
    endYear: 1945,
    styleNameZh: '闪电战时期的韧性广播',
    styleNameEn: 'Blitz-Era Resilience Broadcasting',
    keywords: ['BBC Forces', 'morale', 'community singing'],
    summaryZh: '战时广播把歌舞厅传统带进防空洞、工厂和前线。Vera Lynn 这类歌曲听起来温柔，但背后是很现实的离别和等待。',
    summaryEn: 'Wartime radio carried music-hall habits into shelters, factories, and the front. Songs like Vera Lynn’s sound gentle, but they sit on real separation and waiting.',
    representativeWorks: ["We'll Meet Again", 'The White Cliffs of Dover'],
    representativeArtists: ['Vera Lynn', 'Gracie Fields'],
  },
  {
    countryId: 'uk',
    startYear: 1946,
    endYear: 1949,
    styleNameZh: '节后复苏与美式接触',
    styleNameEn: 'Austerity Recovery and American Contact',
    keywords: ['swing', 'skiffle seeds', 'youth culture'],
    summaryZh: '战后物资紧张，但美军基地和进口唱片让英国继续接触美国声音。后来青年流行文化的一部分，可以从这里往前找。',
    summaryEn: 'Postwar Britain was short on goods, but U.S. bases and imported records kept American sounds nearby. Part of later youth pop can be traced back here.',
    representativeWorks: ['A Nightingale Sang in Berkeley Square', 'Buttons and Bows'],
    representativeArtists: ['Anne Shelton', 'Ted Heath'],
  },
  {
    countryId: 'de',
    startYear: 1931,
    endYear: 1935,
    styleNameZh: '魏玛余波与文化清洗',
    styleNameEn: 'Weimar Echoes and Cultural Purge',
    keywords: ['cabaret', 'ban', 'state control'],
    summaryZh: '魏玛时期的歌舞厅、爵士和实验音乐很快被审查盯上。音乐场所从娱乐空间变成政治筛选的一部分。',
    summaryEn: 'Weimar cabaret, jazz, and experimental music quickly came under censorship. Music venues became part of political screening, not just entertainment.',
    representativeWorks: ['Mack the Knife', 'Falling in Love Again'],
    representativeArtists: ['Marlene Dietrich', 'Kurt Weill'],
  },
  {
    countryId: 'de',
    startYear: 1936,
    endYear: 1943,
    styleNameZh: '宣传编制与受控娱乐',
    styleNameEn: 'Propaganda Programming and Controlled Entertainment',
    keywords: ['march', 'radio orchestra', 'approved swing'],
    summaryZh: '纳粹政权压制所谓“堕落音乐”，但也保留被筛选过的轻音乐和舞曲。这样既能管控，又能让广播听起来没那么紧绷。',
    summaryEn: 'The Nazi regime suppressed so-called degenerate music but kept filtered light music and dance tunes. Control and everyday listening existed side by side.',
    representativeWorks: ['Lili Marleen', 'Wunschkonzert themes'],
    representativeArtists: ['Zarah Leander', 'Lale Andersen'],
  },
  {
    countryId: 'de',
    startYear: 1944,
    endYear: 1949,
    styleNameZh: '废墟中的再定向',
    styleNameEn: 'Reorientation in the Ruins',
    keywords: ['occupation radio', 'denazification', 'jazz return'],
    summaryZh: '战败后，占领区电台和文化重建让爵士、室内乐和公共广播重新出现。德国音乐需要和纳粹时期切开关系。',
    summaryEn: 'After defeat, occupation radio and rebuilding brought jazz, chamber music, and public broadcasting back into view. German music had to separate itself from the Nazi years.',
    representativeWorks: ['In jenen Tagen', 'Rundfunk Tanzorchester'],
    representativeArtists: ['Wolfgang Langhoff', 'Horst Winter'],
  },
  {
    countryId: 'su',
    startYear: 1931,
    endYear: 1938,
    styleNameZh: '社会主义现实主义定型',
    styleNameEn: 'Socialist Realist Consolidation',
    keywords: ['mass song', 'state ensembles', 'folk symphonism'],
    summaryZh: '国家组织的合唱、群众歌曲和民间曲调改编很常见。这些歌容易传唱，也方便在集体活动中使用。',
    summaryEn: 'State-organized choirs, mass songs, and arranged folk tunes were common. They were easy to spread and useful in group settings.',
    representativeWorks: ['Song of the Motherland', 'Polyushko Pole'],
    representativeArtists: ['Isaak Dunaevsky', 'Alexandrov Ensemble'],
  },
  {
    countryId: 'su',
    startYear: 1939,
    endYear: 1945,
    styleNameZh: '卫国战争歌曲传统',
    styleNameEn: 'Great Patriotic War Song Tradition',
    keywords: ['front songs', 'choral patriotism', 'film music'],
    summaryZh: '前线歌曲、电影配乐和大型合唱把“家园”和“牺牲”唱得很直接。它们是苏联战时声音里最容易听出来的一层。',
    summaryEn: 'Frontline songs, film scores, and massed choirs made homeland and sacrifice very direct. They are one of the clearest layers in Soviet wartime sound.',
    representativeWorks: ['Katyusha', 'Sacred War'],
    representativeArtists: ['Klavdiya Shulzhenko', 'Red Army Choir'],
  },
  {
    countryId: 'su',
    startYear: 1946,
    endYear: 1949,
    styleNameZh: '胜利庆典与冷战调门',
    styleNameEn: 'Victory Pageantry and Cold War Tone',
    keywords: ['official festivals', 'heroic song', 'doctrine'],
    summaryZh: '战后歌曲继续使用英雄化的语气。胜利庆典还没结束，冷战式的紧张感也已经出现。',
    summaryEn: 'Postwar songs kept a heroic tone. Victory celebration was still present, but Cold War pressure was already entering the sound.',
    representativeWorks: ['March of the Enthusiasts', 'Victory Day cantatas'],
    representativeArtists: ['Tikhon Khrennikov', 'Lyudmila Zykina'],
  },
  {
    countryId: 'fr',
    startYear: 1931,
    endYear: 1938,
    styleNameZh: '都市香颂与左岸实验',
    styleNameEn: 'Urban Chanson and Left Bank Experiment',
    keywords: ['chanson', 'cabaret', 'jazz clubs'],
    summaryZh: '战前巴黎同时有歌舞厅、香颂和爵士俱乐部。我查资料时觉得它不像一条单线，更像好几种城市声音挤在一起。',
    summaryEn: 'Prewar Paris held cabaret, chanson, and jazz clubs at the same time. In my notes, it feels less like one line and more like several city sounds sharing space.',
    representativeWorks: ['Parlez-moi d’amour', 'J’attendrai'],
    representativeArtists: ['Lucienne Boyer', 'Django Reinhardt'],
  },
  {
    countryId: 'fr',
    startYear: 1939,
    endYear: 1944,
    styleNameZh: '占领时期的隐喻与生存',
    styleNameEn: 'Occupation-Era Metaphor and Survival',
    keywords: ['coded lyrics', 'cafe music', 'resistance'],
    summaryZh: '占领和审查让很多话不能直说。香颂里的等待、夜晚和私人情绪，有时就成了保留记忆和想象抵抗的方式。',
    summaryEn: 'Occupation and censorship made direct speech risky. Waiting, night, and private feeling in chanson could become ways to hold memory and imagine resistance.',
    representativeWorks: ['La Vie en rose', 'Nuages'],
    representativeArtists: ['Edith Piaf', 'Django Reinhardt'],
  },
  {
    countryId: 'fr',
    startYear: 1945,
    endYear: 1949,
    styleNameZh: '解放后的新巴黎声景',
    styleNameEn: 'Post-Liberation Paris Soundscape',
    keywords: ['jazz revival', 'cabaret return', 'existential clubs'],
    summaryZh: '解放后，盟军爵士和法国香颂一起回到夜生活里。巴黎的声音变得更开放，也更容易和国外连接。',
    summaryEn: 'After liberation, Allied jazz and French chanson returned to nightlife together. Paris sounded more open and more connected to music abroad.',
    representativeWorks: ['Les feuilles mortes', 'C’est si bon'],
    representativeArtists: ['Yves Montand', 'Juliette Greco'],
  },
  {
    countryId: 'it',
    startYear: 1931,
    endYear: 1938,
    styleNameZh: '法西斯仪式与轻歌剧余温',
    styleNameEn: 'Fascist Ceremony and Operetta Echoes',
    keywords: ['marches', 'EIAR', 'operetta'],
    summaryZh: '法西斯仪式、广播和轻歌剧传统同时存在。意大利战前音乐一边有官方秩序，一边还有城市娱乐。',
    summaryEn: 'Fascist ceremony, radio, and operetta traditions existed together. Prewar Italian music carried official order and urban entertainment at once.',
    representativeWorks: ['Faccetta Nera', 'Parlami d’amore Mariu'],
    representativeArtists: ['Carlo Buti', 'Beniamino Gigli'],
  },
  {
    countryId: 'it',
    startYear: 1939,
    endYear: 1945,
    styleNameZh: '战时广播与地方韧性',
    styleNameEn: 'Wartime Broadcasting and Local Resilience',
    keywords: ['radio', 'regional songs', 'survival'],
    summaryZh: '战争压力变大后，官方广播之外的地方歌曲和生存情绪更明显。音乐听起来不再只是整齐的国家声音。',
    summaryEn: 'As the war worsened, regional songs and survival feelings became more visible beyond official radio. The sound no longer feels like one neat state voice.',
    representativeWorks: ['Voglio vivere cosi', 'Ma l’amore no'],
    representativeArtists: ['Lina Termini', 'Quartetto Cetra'],
  },
  {
    countryId: 'it',
    startYear: 1946,
    endYear: 1949,
    styleNameZh: '电影歌谣与大众重建',
    styleNameEn: 'Cinematic Ballads and Popular Reconstruction',
    keywords: ['neorealism', 'festival culture', 'crooners'],
    summaryZh: '战后电影、广播节目和流行歌手把意大利音乐带回大众抒情歌。它和战前的仪式感很不一样。',
    summaryEn: 'Postwar cinema, radio shows, and popular singers moved Italian music back toward lyrical pop. It feels very different from the earlier ceremonial tone.',
    representativeWorks: ['Torna a Surriento', 'Vola colomba'],
    representativeArtists: ['Nilla Pizzi', 'Natalino Otto'],
  },
  {
    countryId: 'jp',
    startYear: 1931,
    endYear: 1937,
    styleNameZh: '都会流行与帝国扩张前夜',
    styleNameEn: 'Urban Ryuko-ka before Imperial Expansion',
    keywords: ['ryuko-ka', 'film songs', 'dance music'],
    summaryZh: '战前日本流行歌和电影歌曲很都市化，但广播审查和检阅制度已经在改变它们的方向。',
    summaryEn: 'Prewar Japanese popular song and film music were very urban, but broadcast review and inspection were already changing their direction.',
    representativeWorks: ['Tokyo Rhapsody', 'Wakare no Blues'],
    representativeArtists: ['Ichiro Fujiyama', 'Noriko Awaya'],
  },
  {
    countryId: 'jp',
    startYear: 1938,
    endYear: 1945,
    styleNameZh: '国策歌谣与情绪管理',
    styleNameEn: 'National Policy Songs and Emotional Management',
    keywords: ['gunka', 'radio discipline', 'state songs'],
    summaryZh: '战时日本把国策歌谣、军歌和抒情歌曲都放进动员系统里。有的很强硬，有的反而用乡愁和家庭感来维持情绪。',
    summaryEn: 'Wartime Japan placed policy songs, military songs, and sentimental songs inside the mobilization system. Some were forceful; others used nostalgia and family feeling.',
    representativeWorks: ['Aikoku Koshinkyoku', 'Umi Yukaba'],
    representativeArtists: ['Bin Uehara', 'Yoshiko Yamaguchi'],
  },
  {
    countryId: 'jp',
    startYear: 1946,
    endYear: 1949,
    styleNameZh: '占领期再流行化',
    styleNameEn: 'Occupation-Era Repopularization',
    keywords: ['jazz bars', 'boogie-woogie', 'occupation radio'],
    summaryZh: '占领军广播、俱乐部和夜总会让爵士与布吉重新流行。旧流行歌很快被改造成战后都市娱乐。',
    summaryEn: 'Occupation radio, clubs, and nightlife brought jazz and boogie back. Older pop habits were quickly reshaped into postwar urban entertainment.',
    representativeWorks: ['Tokyo Boogie-Woogie', 'Ringo no Uta'],
    representativeArtists: ['Hibari Misora', 'Shizuko Kasagi'],
  },
  {
    countryId: 'cn',
    startYear: 1931,
    endYear: 1936,
    styleNameZh: '上海时代曲与都会录音',
    styleNameEn: 'Shanghai Shidaiqu and Urban Recording',
    keywords: ['shidaiqu', 'gramophone', 'film songs'],
    summaryZh: '上海的唱片公司、电影公司和夜总会让时代曲很快流行起来。它是我理解战前东亚都市声音的重要入口。',
    summaryEn: 'Shanghai’s record companies, studios, and dance halls helped shidaiqu spread quickly. It is one of my main entry points for prewar urban sound in East Asia.',
    representativeWorks: ['夜来香', '天涯歌女'],
    representativeArtists: ['周璇', '黎锦晖'],
  },
  {
    countryId: 'cn',
    startYear: 1937,
    endYear: 1945,
    styleNameZh: '抗战歌曲与民族动员',
    styleNameEn: 'Resistance Songs and National Mobilization',
    keywords: ['mass songs', 'choral movement', 'migration'],
    summaryZh: '战争让很多音乐人和学生团体往内地转移。抗战歌曲和合唱不只是作品，也是募捐、教育和动员的方法。',
    summaryEn: 'War pushed many musicians and student groups inland. Resistance songs and choruses became works people could also use for fundraising, education, and mobilization.',
    representativeWorks: ['义勇军进行曲', '黄河大合唱'],
    representativeArtists: ['聂耳', '冼星海'],
  },
  {
    countryId: 'cn',
    startYear: 1946,
    endYear: 1949,
    styleNameZh: '重建、分流与新国家声部',
    styleNameEn: 'Reconstruction, Fragmentation, and New State Voice',
    keywords: ['broadcast', 'regional split', 'mass chorus'],
    summaryZh: '战后电影歌曲、广播歌曲和群众音乐同时存在。到 1949 年，战时形成的合唱和动员经验被放进新的国家叙事里。',
    summaryEn: 'After the war, film songs, radio songs, and mass music existed together. By 1949, wartime chorus and mobilization habits were being folded into a new state narrative.',
    representativeWorks: ['我的祖国', '渔光曲'],
    representativeArtists: ['白光', '郭兰英'],
  },
]

export const historicEvents: HistoricEvent[] = [
  {
    id: 'mukden-incident',
    year: 1931,
    titleZh: '九一八事变',
    titleEn: 'Mukden Incident',
    descriptionZh: '日本占领东北后，东亚音乐不再只是都市娱乐。宣传、流亡和救亡歌曲开始变得更重要。',
    descriptionEn: 'After Japan occupied Northeast China, East Asian music was no longer only urban entertainment. Propaganda, exile, and resistance songs became harder to ignore.',
    affectedCountryIds: ['jp', 'cn'],
    category: 'conflict',
    globeFocus: { lat: 41.8, lng: 123.4, altitude: 1.9 },
  },
  {
    id: 'reich-chamber',
    year: 1933,
    titleZh: '帝国文化院整编',
    titleEn: 'Reich Chamber of Culture',
    descriptionZh: '纳粹文化机构把音乐工作纳入审批。魏玛时期的爵士、卡巴莱和实验音乐很快被排挤。',
    descriptionEn: 'Nazi cultural institutions put music work under approval. Weimar jazz, cabaret, and experimental music were quickly pushed aside.',
    affectedCountryIds: ['de'],
    category: 'policy',
    globeFocus: { lat: 52.5, lng: 13.4, altitude: 1.75 },
  },
  {
    id: 'rome-berlin-axis',
    year: 1936,
    titleZh: '罗马-柏林轴心形成',
    titleEn: 'Rome-Berlin Axis',
    descriptionZh: '德意政治靠近后，进行曲、集会、广播和宣传片里的声音也越来越像一套系统。',
    descriptionEn: 'As Germany and Italy moved closer politically, marches, rallies, radio, and newsreels began to sound like parts of one system.',
    affectedCountryIds: ['de', 'it'],
    category: 'policy',
    globeFocus: { lat: 46.8, lng: 11.0, altitude: 2.0 },
  },
  {
    id: 'second-sino-japanese-war',
    year: 1937,
    titleZh: '全面侵华战争爆发',
    titleEn: 'Second Sino-Japanese War',
    descriptionZh: '上海等地的音乐和电影工业被战争打断。中国抗战歌曲变多，日本国策歌谣也更强。',
    descriptionEn: 'War disrupted music and film work in Shanghai and elsewhere. Chinese resistance songs grew, while Japanese policy songs intensified.',
    affectedCountryIds: ['jp', 'cn'],
    category: 'conflict',
    globeFocus: { lat: 31.2, lng: 121.5, altitude: 1.9 },
  },
  {
    id: 'europe-war',
    year: 1939,
    titleZh: '欧洲战争爆发',
    titleEn: 'War Breaks Out in Europe',
    descriptionZh: '广播不再只是放音乐和节目。英法德意都开始用它传递新闻、情绪和战时纪律。',
    descriptionEn: 'Radio was no longer just music and programming. Britain, France, Germany, and Italy used it for news, feeling, and wartime discipline.',
    affectedCountryIds: ['uk', 'fr', 'de', 'it'],
    category: 'broadcast',
    globeFocus: { lat: 50.7, lng: 6.8, altitude: 2.15 },
  },
  {
    id: 'barbarossa',
    year: 1941,
    titleZh: '巴巴罗萨行动',
    titleEn: 'Operation Barbarossa',
    descriptionZh: '东线战争让苏德两侧都更依赖爱国歌曲、军队合唱和宣传电影音乐。',
    descriptionEn: 'The Eastern Front made both Soviet and German sides rely more on patriotic songs, army choirs, and propaganda film music.',
    affectedCountryIds: ['de', 'su'],
    category: 'conflict',
    globeFocus: { lat: 54.5, lng: 28.0, altitude: 2.15 },
  },
  {
    id: 'pearl-harbor',
    year: 1941,
    titleZh: '珍珠港事件',
    titleEn: 'Pearl Harbor',
    descriptionZh: '美国参战后，军中演出、V-Disc 和盟军广播把美国流行乐带到更多战区。',
    descriptionEn: 'After the United States entered the war, troop shows, V-Discs, and Allied radio carried American pop to more war zones.',
    affectedCountryIds: ['us', 'jp', 'uk'],
    category: 'broadcast',
    globeFocus: { lat: 21.3, lng: -157.8, altitude: 2.3 },
  },
  {
    id: 'stalingrad',
    year: 1943,
    titleZh: '斯大林格勒转折',
    titleEn: 'Stalingrad Turning Point',
    descriptionZh: '斯大林格勒之后，苏联歌曲里的胜利感更强；德国受控娱乐的轻松感越来越难维持。',
    descriptionEn: 'After Stalingrad, Soviet songs carried a stronger sense of coming victory, while German controlled entertainment struggled to stay light.',
    affectedCountryIds: ['su', 'de'],
    category: 'conflict',
    globeFocus: { lat: 48.7, lng: 44.5, altitude: 1.95 },
  },
  {
    id: 'liberation-paris',
    year: 1944,
    titleZh: '巴黎解放',
    titleEn: 'Liberation of Paris',
    descriptionZh: '巴黎解放后，香颂、爵士俱乐部和夜生活重新打开。盟军爵士也回到城市里。',
    descriptionEn: 'After Paris was liberated, chanson, jazz clubs, and nightlife reopened. Allied jazz returned to the city too.',
    affectedCountryIds: ['fr', 'us', 'uk'],
    category: 'liberation',
    globeFocus: { lat: 48.9, lng: 2.3, altitude: 1.8 },
  },
  {
    id: 'germany-surrender',
    year: 1945,
    titleZh: '德国投降',
    titleEn: 'German Surrender',
    descriptionZh: '德国投降后，占领区广播和文化重建开始。欧洲音乐也慢慢受到美苏两边的影响。',
    descriptionEn: 'After Germany surrendered, occupation broadcasting and cultural rebuilding began. European music slowly felt pressure from both U.S. and Soviet influence.',
    affectedCountryIds: ['de', 'fr', 'uk', 'su', 'us', 'it'],
    category: 'reconstruction',
    globeFocus: { lat: 52.5, lng: 13.4, altitude: 1.85 },
  },
  {
    id: 'japan-surrender',
    year: 1945,
    titleZh: '日本投降',
    titleEn: 'Japan Surrenders',
    descriptionZh: '占领期广播和夜总会把爵士、布吉和电影歌曲带回来，日本音乐很快离开战时国策歌谣。',
    descriptionEn: 'Occupation radio and nightlife brought back jazz, boogie, and film songs, moving Japanese music away from wartime policy songs.',
    affectedCountryIds: ['jp', 'us', 'cn'],
    category: 'occupation',
    globeFocus: { lat: 35.7, lng: 139.7, altitude: 1.85 },
  },
  {
    id: 'marshall-broadcast',
    year: 1947,
    titleZh: '马歇尔援助与广播现代化',
    titleEn: 'Marshall Aid and Broadcast Modernization',
    descriptionZh: '重建资金、唱片和广播更新让西欧更容易听到美国流行音乐。',
    descriptionEn: 'Reconstruction funding, records, and broadcast renewal made American popular music easier to hear in Western Europe.',
    affectedCountryIds: ['fr', 'it', 'uk', 'us'],
    category: 'reconstruction',
    globeFocus: { lat: 48.0, lng: 7.0, altitude: 2.05 },
  },
  {
    id: 'prc-founding',
    year: 1949,
    titleZh: '中华人民共和国成立',
    titleEn: 'Founding of the PRC',
    descriptionZh: '中国音乐进入新的国家叙事。抗战时期的群众歌曲和合唱经验被继续使用。',
    descriptionEn: 'Chinese music entered a new state narrative. Wartime mass-song and choral habits continued to be used after 1949.',
    affectedCountryIds: ['cn'],
    category: 'reconstruction',
    globeFocus: { lat: 39.9, lng: 116.4, altitude: 1.8 },
  },
]

export const influenceArcs: InfluenceArc[] = [
  {
    sourceCountryId: 'us',
    targetCountryId: 'uk',
    startYear: 1941,
    endYear: 1949,
    reasonZh: '盟军基地、唱片与广播让美国摇摆乐持续输入英国。',
    reasonEn: 'Allied bases, records, and broadcasts kept American swing flowing into Britain.',
    weight: 0.92,
  },
  {
    sourceCountryId: 'us',
    targetCountryId: 'fr',
    startYear: 1944,
    endYear: 1949,
    reasonZh: '解放后的巴黎快速吸收盟军爵士和夜生活文化。',
    reasonEn: 'Post-liberation Paris rapidly absorbed Allied jazz and nightlife culture.',
    weight: 0.86,
  },
  {
    sourceCountryId: 'us',
    targetCountryId: 'jp',
    startYear: 1945,
    endYear: 1949,
    reasonZh: '占领军广播、俱乐部和唱片改变了日本战后流行音乐的走向。',
    reasonEn: 'Occupation radio, clubs, and records changed the direction of postwar Japanese pop.',
    weight: 0.95,
  },
  {
    sourceCountryId: 'su',
    targetCountryId: 'cn',
    startYear: 1945,
    endYear: 1949,
    reasonZh: '群众歌曲与革命合唱的组织逻辑影响中国战后公共音乐书写。',
    reasonEn: 'Mass-song and revolutionary choral organization influenced China’s postwar public music writing.',
    weight: 0.8,
  },
  {
    sourceCountryId: 'de',
    targetCountryId: 'it',
    startYear: 1936,
    endYear: 1943,
    reasonZh: '轴心合作强化了仪式音乐与宣传编排的互通。',
    reasonEn: 'Axis cooperation strengthened exchange in ceremonial music and propaganda programming.',
    weight: 0.68,
  },
  {
    sourceCountryId: 'fr',
    targetCountryId: 'uk',
    startYear: 1931,
    endYear: 1938,
    reasonZh: '巴黎爵士与都市香颂长期影响伦敦舞厅和俱乐部审美。',
    reasonEn: 'Parisian jazz and chanson influenced London dance hall and club taste.',
    weight: 0.56,
  },
]

export const chapterScenes: ChapterScene[] = [
  {
    id: 'chapter-1',
    titleZh: '战前文化张力',
    titleEn: 'Pre-war Cultural Tension',
    summaryZh: '我从这里开始看：同样是电台和唱片，不同国家已经走向很不一样的用途。',
    summaryEn: 'This is where I start: the same radio and record systems were already being used in very different ways.',
    detailZh:
      '这一阶段还不是全面战争，但我已经能看到音乐用途在分开。美国、英国和法国还在用广播、舞厅和唱片扩大流行音乐；德国、日本和中国更早遇到审查、殖民扩张和民族危机。同样是流行歌曲或电台节目，有的还在服务商业娱乐，有的开始被国家审批，有的被写进救亡和动员。',
    detailEn:
      'This chapter is not about total war yet. It is about music starting to do different jobs. The United States, Britain, and France still expanded pop through radio, dance halls, and records, while Germany, Japan, and China felt earlier pressure from censorship, imperial expansion, and national crisis. The same song or broadcast could mean entertainment in one place, approval in another, and survival work somewhere else.',
    evidencePoints: [
      {
        kind: 'historical-trigger',
        labelZh: '历史触发',
        labelEn: 'Historical trigger',
        titleZh: '东北亚危机与德国文化审批同时抬头',
        titleEn: 'East Asian crisis and German cultural approval rise together',
        bodyZh: '九一八事变和帝国文化院让我看到，战争还没全面爆发，扩张、审查和职业准入已经在改变谁能做音乐。',
        bodyEn: 'The Mukden Incident and the Reich Chamber of Culture show that before full-scale war, expansion, censorship, and professional admission were already changing who could make music.',
      },
      {
        kind: 'music-mechanism',
        labelZh: '音乐怎么起作用',
        labelEn: 'How music worked',
        titleZh: '广播和唱片从娱乐渠道变成治理对象',
        titleEn: 'Radio and records become objects of governance',
        bodyZh: '都市流行还在发展，但电台、电影歌曲和唱片已经被国家、殖民行政和审查制度盯上。',
        bodyEn: 'Urban pop kept growing, but radio, film songs, and records were already being watched by states, colonial offices, and censors.',
      },
      {
        kind: 'audible-evidence',
        labelZh: '可见/可听证据',
        labelEn: 'Visible and audible evidence',
        titleZh: '从魏玛舞台到中国救亡歌曲',
        titleEn: 'From Weimar stage song to Chinese resistance song',
        bodyZh: 'Kurt Weill、聂耳、周璇这些人物能把抽象历史拉回作品本身：歌舞厅、电影歌曲和群众歌曲已经不是同一条路。',
        bodyEn: 'Kurt Weill, Nie Er, and Zhou Xuan pull the big history back to actual works: cabaret, film song, and mass song were no longer on the same path.',
      },
    ],
    thumbnail: generatedChapterImage(
      '/images/generated/chapter-prewar-tension.png',
      '战前文化张力章节的生成式档案缩略图',
      'Generated archival thumbnail for the Pre-war Cultural Tension chapter',
    ),
    yearRange: [1931, 1935],
    focusCountryIds: ['de', 'jp', 'cn'],
    focusEventIds: ['mukden-incident', 'reich-chamber'],
    cameraPose: { lat: 42, lng: 82, altitude: 2.15 },
  },
  {
    id: 'chapter-2',
    titleZh: '扩张与宣传',
    titleEn: 'Expansion and Propaganda',
    summaryZh: '扩张让歌曲更直接地进入宣传、仪式和抗战动员。',
    summaryEn: 'Expansion pushed songs more directly into propaganda, ceremony, and resistance mobilization.',
    detailZh:
      '1936-1940 年的线索更直观。罗马-柏林轴心让进行曲、群众集会、新闻影像和电台纪律连在一起；全面侵华战争迫使中国音乐中心内迁，抗战合唱和救亡歌曲变成公共动员工具；欧洲战争爆发后，英法德意的广播也不只是娱乐，而是在组织恐惧、希望、纪律和士气。',
    detailEn:
      'From 1936 to 1940, the trail gets more direct. The Rome-Berlin Axis linked marches, rallies, newsreels, and disciplined radio; the full-scale Sino-Japanese War pushed Chinese music centers inland and turned resistance chorus into public mobilization; once war broke out in Europe, broadcasting in Britain, France, Germany, and Italy was no longer just entertainment. It organized fear, hope, discipline, and morale.',
    evidencePoints: [
      {
        kind: 'historical-trigger',
        labelZh: '历史触发',
        labelEn: 'Historical trigger',
        titleZh: '轴心整合、侵华战争与欧洲战争连成一条扩张线',
        titleEn: 'Axis alignment, China war, and European war form one expansion line',
        bodyZh: '罗马-柏林轴心、全面侵华战争和欧洲战争爆发，把原来分散的管制推向宣传、广播和仪式系统。',
        bodyEn: 'The Rome-Berlin Axis, the full-scale war in China, and war in Europe pushed scattered controls into propaganda, broadcasting, and ceremony systems.',
      },
      {
        kind: 'music-mechanism',
        labelZh: '音乐怎么起作用',
        labelEn: 'How music worked',
        titleZh: '进行曲、国策歌谣和抗战合唱占据前台',
        titleEn: 'Marches, policy songs, and resistance chorus move forward',
        bodyZh: '歌曲不再只是消费品。它可以是政治口号、仪式节奏，也可以跟着募捐巡演和学校教育走。',
        bodyEn: 'Songs were no longer just consumer entertainment. They could be slogans, ceremony rhythm, fundraising tour material, or school education.',
      },
      {
        kind: 'audible-evidence',
        labelZh: '可见/可听证据',
        labelEn: 'Visible and audible evidence',
        titleZh: '事件图片、相关歌曲和国家风格阶段互相印证',
        titleEn: 'Event images, songs, and country phases corroborate each other',
        bodyZh: '轴心仪式、上海战事、欧洲战争和相关歌曲放在一起看，宣传节奏怎样进入音乐就清楚了。',
        bodyEn: 'When the Axis ceremony, Shanghai war disruption, European war context, and songs sit together, the movement of propaganda rhythm into music becomes easier to hear.',
      },
    ],
    thumbnail: generatedChapterImage(
      '/images/generated/chapter-expansion-propaganda.png',
      '扩张与宣传章节的生成式档案缩略图',
      'Generated archival thumbnail for the Expansion and Propaganda chapter',
    ),
    yearRange: [1936, 1940],
    focusCountryIds: ['de', 'it', 'jp', 'cn'],
    focusEventIds: ['rome-berlin-axis', 'second-sino-japanese-war', 'europe-war'],
    cameraPose: { lat: 36, lng: 58, altitude: 2.25 },
  },
  {
    id: 'chapter-3',
    titleZh: '总体战与压制',
    titleEn: 'Total War and Suppression',
    summaryZh: '到总体战阶段，歌曲、军中演出和广播都在帮战争维持情绪。',
    summaryEn: 'By the total-war years, songs, troop shows, and radio were all helping the war manage feeling.',
    detailZh:
      '1941-1943 年，音乐几乎已经被总体战吸进去。巴巴罗萨行动、珍珠港事件和斯大林格勒转折把苏德东线、美国参战和战争拐点连在一起。前线歌曲、大型合唱、军中娱乐、短波广播和宣传电影不是背景声，它们在维持士气、划分敌我，也在处理家庭离别带来的情绪。',
    detailEn:
      'By 1941-1943, music was almost fully pulled into total war. Operation Barbarossa, Pearl Harbor, and Stalingrad connect the Eastern Front, U.S. entry, and the wartime turning point. Frontline songs, massed chorus, troop entertainment, shortwave radio, and propaganda film were not background sound. They held morale, marked enemies, and helped people live with separation.',
    evidencePoints: [
      {
        kind: 'historical-trigger',
        labelZh: '历史触发',
        labelEn: 'Historical trigger',
        titleZh: '东线、太平洋和全球盟军网络同时扩大',
        titleEn: 'Eastern Front, Pacific war, and Allied networks expand together',
        bodyZh: '巴巴罗萨、珍珠港和斯大林格勒让战争强度升高，音乐也跟着军队、广播和电影系统扩散。',
        bodyEn: 'Barbarossa, Pearl Harbor, and Stalingrad intensified the war, and music spread with armies, broadcasting, and film systems.',
      },
      {
        kind: 'music-mechanism',
        labelZh: '音乐怎么起作用',
        labelEn: 'How music worked',
        titleZh: '士气音乐和压制性文化管制并行',
        titleEn: 'Morale music and coercive cultural control run in parallel',
        bodyZh: '同一时期既有盟军娱乐和苏联合唱动员，也有德国和日本继续筛选、规训音乐空间。',
        bodyEn: 'The same years include Allied entertainment and Soviet choral mobilization, while Germany and Japan continued filtering and disciplining musical space.',
      },
      {
        kind: 'audible-evidence',
        labelZh: '可见/可听证据',
        labelEn: 'Visible and audible evidence',
        titleZh: 'V-Disc、前线歌曲和广播人物呈现发展过程',
        titleEn: 'V-Discs, frontline songs, and radio figures show the development process',
        bodyZh: 'Andrews Sisters、Glenn Miller、Klavdiya Shulzhenko、Lale Andersen 这些例子，让大历史变成可以点开听的声音。',
        bodyEn: 'The Andrews Sisters, Glenn Miller, Klavdiya Shulzhenko, and Lale Andersen turn the big war story into sounds I can actually open and hear.',
      },
    ],
    thumbnail: generatedChapterImage(
      '/images/generated/chapter-total-war.png',
      '总体战与压制章节的生成式档案缩略图',
      'Generated archival thumbnail for the Total War and Suppression chapter',
    ),
    yearRange: [1941, 1943],
    focusCountryIds: ['us', 'uk', 'su', 'de', 'jp'],
    focusEventIds: ['barbarossa', 'pearl-harbor', 'stalingrad'],
    cameraPose: { lat: 48, lng: 10, altitude: 2.6 },
  },
  {
    id: 'chapter-4',
    titleZh: '转折与交流',
    titleEn: 'Turning Points and Exchange',
    summaryZh: '城市解放和投降之后，音乐开始重新流动，但已经不是战前那种样子。',
    summaryEn: 'After liberation and surrender, music started moving again, but not in the same way as before the war.',
    detailZh:
      '1944-1945 年，我看到的变化是从封闭转向重新流动。巴黎解放后，香颂、爵士俱乐部和夜生活恢复，盟军爵士也回到城市；德国投降后，去纳粹化广播、文化重建和爵士回归成了新起点；日本投降后，占领军广播、俱乐部和电影歌曲很快改变了战后流行听觉。音乐当然在庆祝胜利，但它也记录占领、重建和跨国接触重新开始。',
    detailEn:
      'In 1944-1945, the pattern changes from closure to movement again. The Liberation of Paris reopened chanson, jazz clubs, and nightlife while bringing Allied jazz back into the city; German surrender began denazified broadcasting, cultural reconstruction, and the return of jazz; Japan’s surrender let occupation radio, clubs, and film song quickly change postwar listening. The music celebrates victory, but it also records occupation, rebuilding, and contact starting again.',
    evidencePoints: [
      {
        kind: 'historical-trigger',
        labelZh: '历史触发',
        labelEn: 'Historical trigger',
        titleZh: '解放与投降改变文化流动方向',
        titleEn: 'Liberation and surrender redirect cultural movement',
        bodyZh: '巴黎解放、德国投降和日本投降，让被战争封住的城市、广播和俱乐部重新接上盟军与占领期网络。',
        bodyEn: 'Paris liberation, German surrender, and Japanese surrender reconnected wartime-restricted cities, broadcasts, and clubs to Allied and occupation networks.',
      },
      {
        kind: 'music-mechanism',
        labelZh: '音乐怎么起作用',
        labelEn: 'How music worked',
        titleZh: '爵士、香颂和广播重建重新定义城市声音',
        titleEn: 'Jazz, chanson, and rebuilt broadcasting redefine city sound',
        bodyZh: '胜利没有让音乐简单回到战前。盟军流动、占领政策和本地记忆混在一起，城市声音变了。',
        bodyEn: 'Victory did not simply restore prewar music. Allied circulation, occupation policy, and local memory mixed together, changing city sound.',
      },
      {
        kind: 'audible-evidence',
        labelZh: '可见/可听证据',
        labelEn: 'Visible and audible evidence',
        titleZh: '巴黎、柏林、东京的声音转向互相对照',
        titleEn: 'Paris, Berlin, and Tokyo provide contrasting turns',
        bodyZh: 'Piaf、Django Reinhardt、Glenn Miller 和日本战后 boogie 放在一起，能看出同一个胜利时刻带来的后果并不一样。',
        bodyEn: 'Piaf, Django Reinhardt, Glenn Miller, and Japan’s postwar boogie show that the same victory moment did not lead to one single musical result.',
      },
    ],
    thumbnail: generatedChapterImage(
      '/images/generated/chapter-turning-points.png',
      '转折与交流章节的生成式档案缩略图',
      'Generated archival thumbnail for the Turning Points and Exchange chapter',
    ),
    yearRange: [1944, 1945],
    focusCountryIds: ['fr', 'us', 'uk', 'de', 'jp'],
    focusEventIds: ['liberation-paris', 'germany-surrender', 'japan-surrender'],
    cameraPose: { lat: 43, lng: 1, altitude: 2.1 },
  },
  {
    id: 'chapter-5',
    titleZh: '战后重建与遗产',
    titleEn: 'Post-war Reconstruction and Legacy',
    summaryZh: '战后广播、唱片和占领期网络，把战时留下的声音带进新的流行音乐环境。',
    summaryEn: 'Postwar broadcasting, records, and occupation networks carried wartime sounds into a new popular-music setting.',
    detailZh:
      '1946-1949 年，我关心的是战时声音怎样被带到战后。马歇尔援助、唱片市场和广播现代化让西欧更快接触美国流行工业；占领期日本把爵士、布吉和电影歌曲重新组织成都市娱乐；中国把抗战时期形成的群众歌曲、合唱组织和电影歌曲经验纳入新的国家叙事。战争结束了，但战时形成的传播方式没有立刻消失。',
    detailEn:
      'For 1946-1949, I focus on how wartime sounds were carried into the postwar years. Marshall Aid, record markets, and broadcast modernization brought Western Europe closer to the U.S. popular industry; occupation Japan reorganized jazz, boogie, and film song into urban entertainment; China folded wartime mass song, choral organization, and film-song experience into a new state narrative. The war ended, but wartime circulation habits did not vanish.',
    evidencePoints: [
      {
        kind: 'historical-trigger',
        labelZh: '历史触发',
        labelEn: 'Historical trigger',
        titleZh: '援助、占领和建国改变音乐去向',
        titleEn: 'Aid, occupation, and state founding change music’s direction',
        bodyZh: '马歇尔援助、占领广播和中华人民共和国成立，让战后音乐同时和经济、军事、国家制度有关。',
        bodyEn: 'Marshall Aid, occupation broadcasting, and the founding of the PRC tied postwar music to economics, military presence, and state systems.',
      },
      {
        kind: 'music-mechanism',
        labelZh: '音乐怎么起作用',
        labelEn: 'How music worked',
        titleZh: '唱片工业、公共广播和国家叙事接管战时遗产',
        titleEn: 'Records, public broadcasting, and state narrative inherit wartime systems',
        bodyZh: '战时的传播网络没有消失。唱片公司、电台、占领机构和新国家制度继续使用它，只是换了目的。',
        bodyEn: 'Wartime circulation networks did not disappear. Record companies, broadcasters, occupation authorities, and new state systems kept using them for new purposes.',
      },
      {
        kind: 'audible-evidence',
        labelZh: '可见/可听证据',
        labelEn: 'Visible and audible evidence',
        titleZh: '从 Nat King Cole 到《义勇军进行曲》',
        titleEn: 'From Nat King Cole to March of the Volunteers',
        bodyZh: '美国流行唱片、西欧广播、日本 boogie 和中国群众歌曲放在一起，能看出战后流行音乐没有从零开始。',
        bodyEn: 'U.S. popular records, Western European broadcasting, Japanese boogie, and Chinese mass song show that postwar popular music did not start from zero.',
      },
    ],
    thumbnail: generatedChapterImage(
      '/images/generated/chapter-reconstruction.png',
      '战后重建与遗产章节的生成式档案缩略图',
      'Generated archival thumbnail for the Post-war Reconstruction and Legacy chapter',
    ),
    yearRange: [1946, 1949],
    focusCountryIds: ['us', 'fr', 'jp', 'cn', 'uk'],
    focusEventIds: ['marshall-broadcast', 'prc-founding'],
    cameraPose: { lat: 34, lng: 55, altitude: 2.4 },
  },
]
