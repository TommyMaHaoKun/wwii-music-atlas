import type { HistoricEvent } from '@/data/ww2MusicAtlas'

export interface LocalizedText {
  zh: string
  en: string
}

export interface ResearchEvent extends HistoricEvent {
  dateLabel: LocalizedText
  place: LocalizedText
  participants: LocalizedText
  fact: LocalizedText
  musicRelation: LocalizedText
  relationTypes: number[]
  relatedWorks: string[]
  uncertainty: LocalizedText
  sourceIds: string[]
}

export interface RegionScene {
  id: string
  name: LocalizedText
  overview: LocalizedText
  politics: LocalizedText
  media: LocalizedText
  officialUse: LocalizedText
  dailyLife: LocalizedText
  movement: LocalizedText
  examples: string[]
  differences: LocalizedText
  sourceIds: string[]
}

export interface ResearchPerson {
  id: string
  name: string
  years: string
  role: LocalizedText
  location: LocalizedText
  activity: LocalizedText
  institutionalRelation: LocalizedText
  works: string[]
  boundary: LocalizedText
  sourceIds: string[]
}

export interface ResearchInstitution {
  id: string
  name: LocalizedText
  period: string
  activity: LocalizedText
  materials: LocalizedText
  boundary: LocalizedText
  sourceIds: string[]
}

export type VersionStatus = 'A' | 'B' | 'C'

export interface ResearchWork {
  id: string
  title: string
  translatedTitle: LocalizedText
  creators: LocalizedText
  composition: LocalizedText
  firstUse: LocalizedText
  recording: LocalizedText
  languageAndType: LocalizedText
  circulation: LocalizedText
  relation: LocalizedText
  status: VersionStatus
  statusNote: LocalizedText
  sourceIds: string[]
}

export interface ResearchSource {
  id: string
  group: 'east-asia' | 'europe' | 'methods'
  institution: string
  title: string
  kind: LocalizedText
  support: LocalizedText
  url: string
}

export interface MethodSection {
  id: string
  title: LocalizedText
  summary: LocalizedText
  points: LocalizedText[]
}

export const relationTypes = [
  {
    id: 1,
    title: { zh: '为事件直接创作', en: 'Created directly for an event' },
    description: {
      zh: '创作缘由能够由手稿、报刊、节目单或可靠研究明确指向事件。',
      en: 'A manuscript, contemporary report, programme or reliable study directly links the work to the event.',
    },
  },
  {
    id: 2,
    title: { zh: '在事件期间演出或广播', en: 'Performed or broadcast during an event' },
    description: {
      zh: '有节目表、演出单、广播稿或档案记录证明当时的使用。',
      en: 'Schedules, programmes, scripts or archival records document its use at the time.',
    },
  },
  {
    id: 3,
    title: { zh: '被政府、军队或政治组织使用', en: 'Used by a government, military or political organisation' },
    description: {
      zh: '机构行为有文件支持；这不证明全体社会都接受该作品。',
      en: 'Institutional use is documented, but it does not prove universal social acceptance.',
    },
  },
  {
    id: 4,
    title: { zh: '反映更广泛的社会环境', en: 'Reflects a broader social setting' },
    description: {
      zh: '作品涉及离别、军旅、城市娱乐等环境，但不能归因于某一具体事件。',
      en: 'The work relates to separation, military life or urban entertainment without being caused by one event.',
    },
  },
  {
    id: 5,
    title: { zh: '1945年以前用于纪念较早事件', en: 'Used before 1945 to commemorate an earlier event' },
    description: {
      zh: '纪念性创作、演出或广播必须发生在本项目时间范围内。',
      en: 'The commemorative work, performance or broadcast must itself fall within 1931–1945.',
    },
  },
] as const

export const researchEvents: ResearchEvent[] = [
  {
    id: 'mukden-incident',
    year: 1931,
    titleZh: '沈阳事变及日本占领中国东北',
    titleEn: 'Mukden Incident and the Occupation of Northeast China',
    descriptionZh: '日本关东军扩大军事行动并占领中国东北主要地区。',
    descriptionEn: 'The Kwantung Army expanded military operations and occupied major areas of Northeast China.',
    dateLabel: { zh: '1931年9月18日起', en: 'From 18 September 1931' },
    place: { zh: '沈阳及中国东北', en: 'Shenyang and Northeast China' },
    participants: { zh: '日本关东军、中国东北军、地方行政机构及其后出现的“满洲国”机构', en: 'The Kwantung Army, Northeast Army, local administrations and later Manchukuo institutions' },
    fact: { zh: '南满铁路柳条湖附近发生爆炸后，关东军迅速占领沈阳并继续控制东北主要地区。1932年成立的“满洲国”名义上设有政府，实际受到日本军事和政治力量控制。', en: 'After an explosion near Liutiaohu, the Kwantung Army seized Shenyang and expanded across the region. Manchukuo, established in 1932, had nominal institutions but remained under decisive Japanese military and political control.' },
    musicRelation: { zh: '本事件作为东亚政治与传播体系变化的背景。后来的占领区广播和动员歌曲需要按各自年份另行举证，不能倒贴到1931年。', en: 'The event provides the political background for later changes in broadcasting and mobilisation. Later songs cannot be projected back onto 1931 without evidence.' },
    relationTypes: [4],
    relatedWorks: [],
    uncertainty: { zh: '地图应同时区分中华民国法理领土、日本军事占领和“满洲国”傀儡政权/实际控制，不能合并成单一国界。', en: 'The map must distinguish legal territory, military occupation and Manchukuo’s puppet administration rather than collapse them into one border.' },
    affectedCountryIds: ['jp', 'cn'],
    category: 'conflict',
    globeFocus: { lat: 41.8, lng: 123.4, altitude: 1.9 },
    sourceIds: ['S01', 'S02', 'S03'],
  },
  {
    id: 'reich-chamber',
    year: 1933,
    titleZh: '纳粹德国建立帝国文化院体系',
    titleEn: 'Nazi Germany Establishes the Reich Chamber of Culture',
    descriptionZh: '职业准入、演出和广播被纳入国家文化控制体系。',
    descriptionEn: 'Professional access, performance and broadcasting were brought under state cultural control.',
    dateLabel: { zh: '1933年9月22日', en: '22 September 1933' },
    place: { zh: '柏林及德国全国', en: 'Berlin and Germany' },
    participants: { zh: '国民教育与宣传部、帝国文化院、帝国音乐院及德国音乐从业者', en: 'The Propaganda Ministry, Reich Chamber of Culture, Reich Music Chamber and music professionals' },
    fact: { zh: '纳粹政权以法律和职业组织控制音乐、广播、戏剧和电影。会员资格直接影响从业资格，犹太人及其他被排斥者逐步失去正式工作空间。', en: 'Law and professional organisations brought music and broadcasting under control. Membership determined access to work, while Jewish and other excluded practitioners were removed from official cultural life.' },
    musicRelation: { zh: '事件直接改变谁可以工作、什么节目可以演出和广播，属于音乐制度本身的历史。', en: 'The event directly changed who could work and what could be performed or broadcast.' },
    relationTypes: [3],
    relatedWorks: [],
    uncertainty: { zh: '“获准演出”不等于主动认同政权；个人的妥协、受益、被迫与抵抗必须逐人判断。', en: 'Permission to work does not by itself prove ideological commitment; coercion, benefit, compromise and resistance require individual evidence.' },
    affectedCountryIds: ['de'],
    category: 'policy',
    globeFocus: { lat: 52.5, lng: 13.4, altitude: 1.75 },
    sourceIds: ['S13', 'S14'],
  },
  {
    id: 'ethiopia-invasion',
    year: 1935,
    titleZh: '意大利侵略埃塞俄比亚与殖民战争宣传',
    titleEn: 'Italy Invades Ethiopia and Mobilises Colonial Propaganda',
    descriptionZh: '殖民战争歌曲通过唱片和广播进入法西斯政治动员。',
    descriptionEn: 'Colonial-war songs circulated through records and radio as part of Fascist mobilisation.',
    dateLabel: { zh: '1935年10月3日起', en: 'From 3 October 1935' },
    place: { zh: '埃塞俄比亚及意大利传播空间', en: 'Ethiopia and Italian media networks' },
    participants: { zh: '法西斯意大利政府与军队、埃塞俄比亚政府与军队、意大利广播与唱片机构', en: 'Fascist Italy, Ethiopia and Italian broadcasting and record institutions' },
    fact: { zh: '意大利从厄立特里亚和意属索马里方向进攻埃塞俄比亚，战争伴随殖民占领、国际制裁与国内政治动员。', en: 'Italy invaded Ethiopia from Eritrea and Italian Somaliland, combining colonial conquest with domestic mobilisation and an international crisis.' },
    musicRelation: { zh: '《Faccetta nera》等作品属于被政治运动使用并反映殖民社会环境的材料，不是对战争事实的中立记录。', en: 'Works such as Faccetta nera were used politically and reflect a colonial setting; they are not neutral records of the war.' },
    relationTypes: [3, 4],
    relatedWorks: ['Faccetta nera'],
    uncertainty: { zh: '销量、广播频率或流行度不能直接证明所有意大利人支持侵略。', en: 'Sales, airplay and popularity do not prove that all Italians supported the invasion.' },
    affectedCountryIds: ['it'],
    category: 'conflict',
    globeFocus: { lat: 12.5, lng: 40.5, altitude: 2.05 },
    sourceIds: ['S11', 'S12'],
  },
  {
    id: 'second-sino-japanese-war',
    year: 1937,
    titleZh: '七七事变与中日战争全面扩大',
    titleEn: 'Marco Polo Bridge Incident and the Expansion of the Sino-Japanese War',
    descriptionZh: '局部冲突迅速扩大，战争改变了演出、广播和音乐家的流动。',
    descriptionEn: 'A local clash expanded rapidly, transforming performance, broadcasting and musical mobility.',
    dateLabel: { zh: '1937年7月7日起', en: 'From 7 July 1937' },
    place: { zh: '卢沟桥、宛平及随后扩大的中国战场', en: 'Marco Polo Bridge, Wanping and the expanding war in China' },
    participants: { zh: '中国军队、日本军队及此后卷入的政府、武装和迁移人口', en: 'Chinese and Japanese forces, governments, armed groups and displaced populations' },
    fact: { zh: '卢沟桥附近冲突未能局部解决，军事行动扩展至华北、上海、南京和其他地区，全面战争开始。', en: 'The clash near the Marco Polo Bridge was not contained and military operations spread across North China, Shanghai, Nanjing and beyond.' },
    musicRelation: { zh: '《义勇军进行曲》创作于1935年，1937年后扩大传播；《游击队歌》创作于1937年冬。二者都不能写成卢沟桥战斗的现场歌曲。', en: 'March of the Volunteers predates the incident, while Song of the Guerrillas was written later in 1937. Neither is a sound record of the clash itself.' },
    relationTypes: [2, 3, 4],
    relatedWorks: ['义勇军进行曲', '游击队歌'],
    uncertainty: { zh: '不同版本的首次演出、录音和传播路线仍需节目单、唱片目录和地方报纸逐条核查。', en: 'First performances, recordings and circulation routes still require item-level verification.' },
    affectedCountryIds: ['jp', 'cn'],
    category: 'conflict',
    globeFocus: { lat: 39.85, lng: 116.22, altitude: 1.85 },
    sourceIds: ['S04', 'S06'],
  },
  {
    id: 'europe-war',
    year: 1939,
    titleZh: '欧洲战争爆发',
    titleEn: 'War Breaks Out in Europe',
    descriptionZh: '德国进攻波兰后，广播、演出管理和人员流动迅速进入战时状态。',
    descriptionEn: 'After Germany invaded Poland, broadcasting, performance and mobility moved rapidly onto a wartime footing.',
    dateLabel: { zh: '1939年9月1—3日', en: '1–3 September 1939' },
    place: { zh: '波兰、德国、英国、法国及欧洲广播空间', en: 'Poland, Germany, Britain, France and European broadcasting space' },
    participants: { zh: '德国、波兰、英国、法国及随后参战或被占领的欧洲国家', en: 'Germany, Poland, Britain, France and other belligerent or occupied European states' },
    fact: { zh: '德国于9月1日进攻波兰，英国和法国于9月3日对德宣战。此时苏德战争、美国参战和太平洋战争尚未开始。', en: 'Germany invaded Poland on 1 September; Britain and France declared war on 3 September. The German-Soviet war, United States entry and Pacific War had not yet begun.' },
    musicRelation: { zh: '《We’ll Meet Again》于1939年9月28日录制，属于战争初期离别和等待的社会环境，不是为进攻波兰直接创作。', en: 'We’ll Meet Again was recorded on 28 September 1939 and belongs to the social setting of separation, not to the invasion of Poland as a commissioned response.' },
    relationTypes: [2, 4],
    relatedWorks: ["We'll Meet Again"],
    uncertainty: { zh: '1953年合唱重录版与1939年原唱片必须分开。', en: 'The 1953 choral remake must be distinguished from the 1939 record.' },
    affectedCountryIds: ['uk', 'fr', 'de', 'it'],
    category: 'conflict',
    globeFocus: { lat: 52.0, lng: 19.2, altitude: 2.15 },
    sourceIds: ['S19', 'S22'],
  },
  {
    id: 'france-occupation-radio',
    year: 1940,
    titleZh: '法国战败、占领与竞争性广播空间',
    titleEn: 'French Defeat, Occupation and Competing Broadcast Spaces',
    descriptionZh: '占领区、维希政权、自由法国和抵抗网络争夺法语听众。',
    descriptionEn: 'Occupation authorities, Vichy, Free France and resistance networks competed for French-speaking listeners.',
    dateLabel: { zh: '1940年5—6月起', en: 'From May–June 1940' },
    place: { zh: '法国本土、伦敦及海外法语广播范围', en: 'France, London and overseas French-language broadcasting' },
    participants: { zh: '德国占领当局、维希政府、自由法国、抵抗网络及多家广播机构', en: 'German occupation authorities, Vichy, Free France, resistance networks and broadcasters' },
    fact: { zh: '法国战败后，本土被划分为不同统治区，行政控制与广播发射权分裂。伦敦、维希和被占领巴黎的节目争夺听众。', en: 'Defeat divided France into different zones of rule and fragmented control over broadcasting. London, Vichy and occupied Paris competed for audiences.' },
    musicRelation: { zh: '《J’attendrai》是1938年的商业流行录音，战争中获得等待与分离的新解释，但不是抵抗歌曲。', en: 'J’attendrai was a 1938 commercial recording that acquired wartime meanings of waiting and separation; it was not a resistance song.' },
    relationTypes: [2, 4],
    relatedWorks: ["J'attendrai"],
    uncertainty: { zh: '战后记忆中的“时代象征”需要与当年节目单、销售记录和私人记述互证。', en: 'Postwar memory must be checked against contemporary schedules, sales evidence and private accounts.' },
    affectedCountryIds: ['fr', 'de', 'uk'],
    category: 'occupation',
    globeFocus: { lat: 48.86, lng: 2.35, altitude: 1.8 },
    sourceIds: ['S16', 'S17', 'S23'],
  },
  {
    id: 'barbarossa',
    year: 1941,
    titleZh: '德国进攻苏联与《神圣的战争》',
    titleEn: 'Germany Invades the Soviet Union and The Sacred War',
    descriptionZh: '德国发动“巴巴罗萨行动”，苏联随即展开军事、工业和文化动员。',
    descriptionEn: 'Operation Barbarossa triggered Soviet military, industrial and cultural mobilisation.',
    dateLabel: { zh: '1941年6月22—26日', en: '22–26 June 1941' },
    place: { zh: '苏联西部战场与莫斯科白俄罗斯火车站', en: 'The western Soviet front and Moscow’s Belorussky Station' },
    participants: { zh: '德国及其盟军、苏联、列别杰夫-库马奇、亚历山德罗夫与红军歌舞团', en: 'Germany and its allies, the Soviet Union, Lebedev-Kumach, Alexandrov and the Red Army ensemble' },
    fact: { zh: '德国于6月22日发动进攻。苏联迅速动员军队、工业、广播和文化机构。', en: 'Germany attacked on 22 June. The Soviet Union rapidly mobilised military, industry, broadcasting and cultural institutions.' },
    musicRelation: { zh: '《神圣的战争》在进攻后数日内完成，并于6月26日在莫斯科白俄罗斯火车站演唱。', en: 'The Sacred War was completed within days of the invasion and performed at Belorussky Station on 26 June.' },
    relationTypes: [1, 3],
    relatedWorks: ['Священная война'],
    uncertainty: { zh: '不同资料对首张唱片的录制、压片和发行日期表述不一，精确日期仍需唱片目录补证。', en: 'Recording, pressing and release dates differ across sources and require discographic confirmation.' },
    affectedCountryIds: ['de', 'su'],
    category: 'conflict',
    globeFocus: { lat: 55.75, lng: 37.62, altitude: 1.9 },
    sourceIds: ['S25', 'S28'],
  },
  {
    id: 'pearl-harbor',
    year: 1941,
    titleZh: '珍珠港袭击与美国参战',
    titleEn: 'Attack on Pearl Harbor and United States Entry into the War',
    descriptionZh: '美国正式参战，军方广播、慰问演出和V-Disc计划随后扩大。',
    descriptionEn: 'United States entry was followed by expanded military broadcasting, troop entertainment and the V-Disc programme.',
    dateLabel: { zh: '1941年12月7—8日', en: '7–8 December 1941' },
    place: { zh: '夏威夷珍珠港、美国及太平洋地区', en: 'Pearl Harbor, the United States and the Pacific' },
    participants: { zh: '日本、美国及随后正式宣战的同盟国和轴心国', en: 'Japan, the United States and the belligerents drawn into formal declarations of war' },
    fact: { zh: '日本海军于12月7日袭击珍珠港，美国于次日对日宣战，太平洋与欧洲战争的政治联系进一步加强。', en: 'Japan attacked Pearl Harbor on 7 December and the United States declared war the next day, tightening the political connection between the Pacific and European wars.' },
    musicRelation: { zh: '《Boogie Woogie Bugle Boy》在1941年1月已录制，只能作为参战前军旅娱乐环境的材料，不能写成对珍珠港的回应。', en: 'Boogie Woogie Bugle Boy was recorded in January 1941 and reflects pre-entry military entertainment; it was not a response to Pearl Harbor.' },
    relationTypes: [4],
    relatedWorks: ['Boogie Woogie Bugle Boy'],
    uncertainty: { zh: '商业流行、军队使用和政府宣传是三种机制，必须分别举证。', en: 'Commercial popularity, military use and government propaganda are distinct mechanisms and require separate evidence.' },
    affectedCountryIds: ['us', 'jp', 'uk'],
    category: 'conflict',
    globeFocus: { lat: 21.35, lng: -157.95, altitude: 2.2 },
    sourceIds: ['S29', 'S30', 'S31'],
  },
  {
    id: 'leningrad-symphony',
    year: 1942,
    titleZh: '列宁格勒演出第七交响曲',
    titleEn: 'Performance of the Seventh Symphony in Leningrad',
    descriptionZh: '围城中的演出通过广播和扩音系统成为一次音乐与政治事件。',
    descriptionEn: 'The siege performance, relayed by radio and loudspeaker, became both a musical and political event.',
    dateLabel: { zh: '1942年8月9日', en: '9 August 1942' },
    place: { zh: '被围困的列宁格勒', en: 'Besieged Leningrad' },
    participants: { zh: '列宁格勒广播交响乐团、卡尔·埃利亚斯贝格、城市听众及苏联广播和军事机构', en: 'The Leningrad Radio Orchestra, Karl Eliasberg, city listeners, broadcasters and military authorities' },
    fact: { zh: '第七交响曲于1941年完成，1942年3月在古比雪夫首演。8月9日，该曲在列宁格勒经过补充乐手和排练后演出。', en: 'Completed in 1941 and premiered in Kuibyshev in March 1942, the symphony was performed in besieged Leningrad after musicians were assembled and rehearsed.' },
    musicRelation: { zh: '演出本身就是事件，既是音乐活动，也是由城市和国家机构赋予战时作用的象征性行为。', en: 'The performance itself was the event: a musical act given wartime symbolic force by city and state institutions.' },
    relationTypes: [2, 3],
    relatedWorks: ['第七交响曲“列宁格勒”'],
    uncertainty: { zh: '1942年托斯卡尼尼/NBC录音不是8月9日列宁格勒现场录音；作品政治含义也存在长期争论。', en: 'The 1942 Toscanini/NBC recording is not the Leningrad performance, and the work’s political meaning remains disputed.' },
    affectedCountryIds: ['su', 'de'],
    category: 'broadcast',
    globeFocus: { lat: 59.93, lng: 30.34, altitude: 1.75 },
    sourceIds: ['S26', 'S27'],
  },
  {
    id: 'chant-partisans',
    year: 1943,
    titleZh: '《游击队之歌》进入自由法国广播',
    titleEn: 'Le Chant des partisans Enters Free French Broadcasting',
    descriptionZh: '旋律、法语歌词、演唱和广播识别信号在伦敦形成抵抗网络的声音标志。',
    descriptionEn: 'Melody, French lyrics, performance and broadcast signature combined into an audible emblem of resistance.',
    dateLabel: { zh: '1943年5月30—31日', en: '30–31 May 1943' },
    place: { zh: '伦敦', en: 'London' },
    participants: { zh: 'Anna Marly、Joseph Kessel、Maurice Druon、Germaine Sablon、自由法国与BBC法语广播', en: 'Anna Marly, Joseph Kessel, Maurice Druon, Germaine Sablon, Free France and the BBC' },
    fact: { zh: 'Marly创作旋律，Kessel与Druon写成法语歌词。Sablon于5月30日演唱，旋律随后用于BBC法语节目识别。', en: 'Marly composed the melody, Kessel and Druon wrote the French lyrics, and Sablon performed it on 30 May before the tune entered BBC French broadcasting.' },
    musicRelation: { zh: '法语版本为抵抗语境创作并被自由法国广播网络直接使用。', en: 'The French version was created for a resistance setting and directly used by Free French broadcasting.' },
    relationTypes: [1, 2, 3],
    relatedWorks: ['Le Chant des partisans'],
    uncertainty: { zh: '首演、首次录音、首次印刷和1963年电视演唱必须分别标注。', en: 'First performance, recording, printing and the 1963 television performance are separate records.' },
    affectedCountryIds: ['fr', 'uk'],
    category: 'broadcast',
    globeFocus: { lat: 51.51, lng: -0.13, altitude: 1.75 },
    sourceIds: ['S16', 'S17'],
  },
  {
    id: 'italy-armistice',
    year: 1943,
    titleZh: '意大利停战、德国占领与抵抗战争',
    titleEn: 'Italian Armistice, German Occupation and Resistance',
    descriptionZh: '停战后意大利出现分裂统治、德国占领和多派抵抗网络。',
    descriptionEn: 'The armistice was followed by divided rule, German occupation and multiple resistance networks.',
    dateLabel: { zh: '1943年9月8日起', en: 'From 8 September 1943' },
    place: { zh: '意大利北部和中部', en: 'Northern and central Italy' },
    participants: { zh: '意大利王国政府、盟军、德国军队、意大利社会共和国与不同抵抗组织', en: 'The Kingdom of Italy, Allies, German forces, Italian Social Republic and resistance groups' },
    fact: { zh: '停战公开后，德国占领意大利大片地区，德军支持的意大利社会共和国成立，抵抗战争与内战并行。', en: 'After the armistice was announced, Germany occupied much of Italy and supported the Italian Social Republic while resistance and civil war developed.' },
    musicRelation: { zh: 'Felice Cascione为《喀秋莎》旋律填入意大利语歌词，形成《Fischia il vento》，在抵抗队伍中口传。', en: 'Felice Cascione adapted the melody of Katyusha with Italian lyrics as Fischia il vento, circulated orally among partisans.' },
    relationTypes: [1, 2],
    relatedWorks: ['Fischia il vento'],
    uncertainty: { zh: '现有战后演唱不能标成1943—1945年原声；《Bella ciao》的战时证据也不足以支持后来的普遍性叙述。', en: 'Postwar performances are not wartime recordings, and Bella ciao lacks evidence for the widespread wartime status later attributed to it.' },
    affectedCountryIds: ['it', 'de'],
    category: 'occupation',
    globeFocus: { lat: 44.4, lng: 9.0, altitude: 1.85 },
    sourceIds: ['S32', 'S33', 'S34'],
  },
  {
    id: 'liberation-paris',
    year: 1944,
    titleZh: '巴黎解放',
    titleEn: 'Liberation of Paris',
    descriptionZh: '抵抗力量、自由法国部队和盟军行动结束了巴黎的德国占领。',
    descriptionEn: 'Resistance action and Free French and Allied forces ended the German occupation of Paris.',
    dateLabel: { zh: '1944年8月19—25日', en: '19–25 August 1944' },
    place: { zh: '巴黎', en: 'Paris' },
    participants: { zh: '法国内务部队、自由法国部队、盟军、德军与巴黎市民', en: 'French Forces of the Interior, Free French forces, Allies, German forces and Parisians' },
    fact: { zh: '巴黎抵抗力量发动起义，自由法国第二装甲师等部队进入城市，德军守备部队于8月25日投降。', en: 'Parisian resistance forces rose, Free French forces entered the city, and the German garrison surrendered on 25 August.' },
    musicRelation: { zh: '广播、街头歌唱、舞会和随后创作的解放歌曲发生在不同时间。《Fleur de Paris》属于1944年的庆祝和纪念。', en: 'Broadcasting, street singing, dances and later liberation songs occurred at different moments. Fleur de Paris belongs to celebration and commemoration in 1944.' },
    relationTypes: [1, 5],
    relatedWorks: ['Fleur de Paris', 'Le Chant des partisans'],
    uncertainty: { zh: '战后影片常将不同日期的声音剪入解放画面，必须核对每段录音的制作和播出日期。', en: 'Postwar films often combine sounds from different dates; each recording requires independent dating.' },
    affectedCountryIds: ['fr', 'de', 'us', 'uk'],
    category: 'liberation',
    globeFocus: { lat: 48.86, lng: 2.35, altitude: 1.75 },
    sourceIds: ['S17', 'S24'],
  },
  {
    id: 'germany-surrender',
    year: 1945,
    titleZh: '德国无条件投降与欧洲战争结束',
    titleEn: 'German Surrender and the End of the War in Europe',
    descriptionZh: '兰斯与柏林的签署程序结束了欧洲主要战事。',
    descriptionEn: 'The surrender procedures at Reims and Berlin ended the principal war in Europe.',
    dateLabel: { zh: '1945年5月7—9日', en: '7–9 May 1945' },
    place: { zh: '兰斯、柏林及欧洲各地', en: 'Reims, Berlin and locations across Europe' },
    participants: { zh: '德国、美国、英国、苏联、法国及其他盟国', en: 'Germany, the United States, Britain, the Soviet Union, France and other Allies' },
    fact: { zh: '德国无条件投降文件先在兰斯签署，随后在柏林完成签署程序。不同国家因法律程序和时区纪念5月8日或9日。', en: 'Surrender was signed first at Reims and completed in Berlin. Legal procedure and time zones contributed to commemoration on 8 or 9 May.' },
    musicRelation: { zh: '广播公告、教堂钟声、街头舞会和既有歌曲构成战争结束的声音环境，必须区分同期录音与纪录片后配音乐。', en: 'Announcements, bells, dances and existing songs formed the soundscape of victory; contemporary recordings must be distinguished from later documentary scoring.' },
    relationTypes: [2, 5],
    relatedWorks: [],
    uncertainty: { zh: '“欧洲胜利日”存在5月8日和9日两种纪念日期，页面同时解释。', en: 'The page explains both 8 and 9 May commemorations.' },
    affectedCountryIds: ['de', 'fr', 'uk', 'su', 'us', 'it'],
    category: 'liberation',
    globeFocus: { lat: 52.52, lng: 13.4, altitude: 1.85 },
    sourceIds: ['S19', 'S20'],
  },
  {
    id: 'japan-surrender',
    year: 1945,
    titleZh: '日本宣布接受投降条件并签署投降书',
    titleEn: 'Japan Announces Acceptance and Signs the Instrument of Surrender',
    descriptionZh: '天皇录音于8月15日广播，正式投降书于9月2日签署。',
    descriptionEn: 'The imperial recording was broadcast on 15 August and the formal instrument signed on 2 September.',
    dateLabel: { zh: '1945年8月14—15日、9月2日', en: '14–15 August and 2 September 1945' },
    place: { zh: '东京及“密苏里”号战列舰', en: 'Tokyo and USS Missouri' },
    participants: { zh: '日本政府、天皇、盟国政府与军队，以及日本统治或占领地区的人口', en: 'The Japanese government and emperor, Allied governments and forces, and populations under Japanese rule or occupation' },
    fact: { zh: '投降诏书录音于8月14日制作、8月15日广播；正式投降书于9月2日签署。各战区解除武装与接收并非同日完成。', en: 'The rescript was recorded on 14 August and broadcast on 15 August; the formal instrument was signed on 2 September. Disarmament and transfer of control varied by theatre.' },
    musicRelation: { zh: '“玉音放送”是国家广播讲话，不是歌曲。它作为原始声音证据说明广播如何传达战争结束。', en: 'The Gyokuon-hōsō is a state broadcast speech, not a song. It is primary audio evidence of how surrender was communicated.' },
    relationTypes: [2],
    relatedWorks: ['玉音放送'],
    uncertainty: { zh: '8月15日、9月2日及各地受降日期不能合并为一个时点。', en: '15 August, 2 September and local surrender dates cannot be reduced to a single moment.' },
    affectedCountryIds: ['jp', 'us', 'cn'],
    category: 'broadcast',
    globeFocus: { lat: 35.68, lng: 139.76, altitude: 1.8 },
    sourceIds: ['S35', 'S36'],
  },
]

export const regionScenes: RegionScene[] = [
  {
    id: 'cn',
    name: { zh: '中国', en: 'China' },
    overview: { zh: '战争时期的中国不存在一种能够代表全国的“国家风格”。商业唱片、电影歌曲、救亡演出、军队文艺、地方戏曲和根据地广播处在不同制度与传播条件中。', en: 'Wartime China had no single national style. Commercial records, film songs, resistance performance, military culture, local traditions and base-area broadcasting operated under different conditions.' },
    politics: { zh: '1931年日本军队占领中国东北，1937年后战争全面扩大。国民政府、中共根据地、日军占领区和合作政权必须分别标示。', en: 'Japanese occupation in the northeast from 1931 and full-scale war after 1937 produced Nationalist, Communist, occupied and collaborationist zones that must be distinguished.' },
    media: { zh: '国民政府广播集中在城市，未能垄断全部听觉空间；上海唱片、电影和商业广播在审查与资本重组中继续运作；延安新华广播电台于1940年开播。', en: 'Nationalist broadcasting remained urban and incomplete; Shanghai commercial media continued under pressure; Yan’an Xinhua Radio began in 1940.' },
    officialUse: { zh: '抗战歌曲经救亡演出队、学校、军队文艺组织和群众集会传播。“政府推广”“部队演唱”和“社会普遍认同”必须分别举证。', en: 'Resistance songs circulated through troupes, schools, military organisations and rallies. Promotion, performance and public acceptance are separate claims.' },
    dailyLife: { zh: '上海流行歌曲依靠唱片、电影和广播形成跨媒介市场，地方戏曲、舞厅、茶楼与家庭收听并未因战争立即消失。', en: 'Shanghai popular song moved across records, film and radio, while local theatre, dance halls, teahouses and home listening continued.' },
    movement: { zh: '音乐家、学生和演出团体从沿海迁往武汉、重庆、桂林、昆明和延安，重组了创作、培训与演出网络。仅凭所在地不能给个人作政治定性。', en: 'Musicians, students and troupes moved inland, reshaping creation, education and performance. Location alone cannot determine political alignment.' },
    examples: ['义勇军进行曲', '游击队歌', '黄河大合唱', '聂耳', '田汉', '贺绿汀', '冼星海'],
    differences: { zh: '上海商业唱片、重庆战时首都广播、延安政治文艺组织、日占城市审查和广大乡村的口耳传播不能互相替代为“全国经验”。', en: 'Shanghai commerce, Chongqing broadcasting, Yan’an political culture, occupied-city censorship and rural oral circulation cannot stand in for one another.' },
    sourceIds: ['S01', 'S03', 'S04', 'S05', 'S06', 'S07', 'S41', 'S42'],
  },
  {
    id: 'jp',
    name: { zh: '日本及其控制区域', en: 'Japan and Areas under Japanese Control' },
    overview: { zh: '日本本土、殖民地、军事占领区和傀儡政权不是同一个音乐空间。语言、唱片商标或行政控制都不能自动把当地材料归为“日本音乐”。', en: 'Japan proper, colonies, occupied territories and puppet administrations were not one musical space. Language, labels and control do not automatically make local material Japanese music.' },
    politics: { zh: '朝鲜和台湾处于殖民统治；中国东北由日本军事占领并通过“满洲国”名义管理；华北、华中等地的占领与合作政权随战局变化。', en: 'Korea and Taiwan were colonies; Manchuria was occupied and administered through Manchukuo; occupation and collaboration regimes elsewhere changed with the war.' },
    media: { zh: 'NHK形成全国广播体系，1937年以后收听户增加，广播的国家政策地位提高。商业唱片继续生产，但选题、语言和表演者逐渐受到情报与审查机构约束。', en: 'NHK built a national system and wartime mobilisation expanded broadcasting. Commercial production continued under growing information and censorship controls.' },
    officialUse: { zh: '《爱国行进曲》的征集与多公司发行显示国家机构、报纸、广播和唱片公司共同参与动员。官方推广不能当作全民意见调查。', en: 'The official competition and multi-label release of Aikoku Kōshinkyoku show cooperation among state, press, radio and industry without proving universal approval.' },
    dailyLife: { zh: '流行歌、电影音乐、传统表演和家庭收听没有立即消失；娱乐内容也可能被赋予安抚、维持士气或规范日常生活的作用。', en: 'Popular song, film music, traditional performance and home listening continued, sometimes taking on morale and regulatory functions.' },
    movement: { zh: '日本唱片和媒体机构进入上海、东北等控制区，重组当地企业与艺人网络。殖民地和占领区表演者处于不对等制度中。', en: 'Japanese media firms entered occupied markets and reorganised local networks under unequal colonial and occupation structures.' },
    examples: ['愛国行進曲', '濑户口藤吉', '森川幸雄', '日本放送协会', '内阁情报部', '帝国海军军乐队'],
    differences: { zh: '东京中央广播、地方接收条件、军队驻地、殖民地行政广播、“满洲国”机构和占领城市合作广播必须分别叙述。', en: 'Tokyo broadcasting, regional reception, military stations, colonial services, Manchukuo institutions and collaboration broadcasters require separate treatment.' },
    sourceIds: ['S02', 'S03', 'S08', 'S09', 'S10', 'S43', 'S44'],
  },
  {
    id: 'su',
    name: { zh: '苏联', en: 'Soviet Union' },
    overview: { zh: '国家组织的广播、唱片、军队歌舞团和音乐机构在战争中承担动员任务，但各加盟共和国、被占领区、疏散城市与前线的经验并不相同。', en: 'State broadcasting, recording, military ensembles and music institutions mobilised for war, but republics, occupied regions, evacuation centres and fronts differed sharply.' },
    politics: { zh: '1930年代文化生产受到高度集中管理。1941年德国入侵后，工业、人口和文化机构向东疏散，战争压力因地区而异。', en: 'Culture was centrally organised in the 1930s. After the 1941 invasion, institutions and populations were evacuated east under highly unequal wartime pressure.' },
    media: { zh: '国家广播和唱片系统传播新闻、演说、音乐和前线信息。国家播出证明制度行为，不等于听众只有一种解释。', en: 'State radio and records carried news, speeches, music and front information. Broadcast documents institutional action, not a single audience response.' },
    officialUse: { zh: '红军歌舞团推广《神圣的战争》等作品；第七交响曲的列宁格勒演出也被组织成国家与城市的象征性事件。', en: 'The Red Army ensemble promoted The Sacred War, while the Leningrad Seventh Symphony performance became a state and civic symbol.' },
    dailyLife: { zh: '剧院、音乐厅、广播乐团和业余歌唱在物资短缺中继续存在，条件取决于城市是否被围困、疏散或远离前线。', en: 'Theatres, radio orchestras and amateur music continued under shortages, with conditions shaped by siege, evacuation and distance from the front.' },
    movement: { zh: '作曲家、乐团、学校和制片机构迁往古比雪夫、塔什干、阿拉木图等地；疏散合作不能掩盖强制迁移与政治压迫。', en: 'Artists and institutions moved to Kuibyshev, Tashkent, Alma-Ata and elsewhere, alongside coercion and political repression.' },
    examples: ['Священная война', '第七交响曲“列宁格勒”', '亚历山大·亚历山德罗夫', '肖斯塔科维奇', '红军歌舞团'],
    differences: { zh: '莫斯科、被围困的列宁格勒、前线、疏散城市、被占领领土和各加盟共和国不能合成一种“苏联声音”。', en: 'Moscow, besieged Leningrad, the front, evacuation cities, occupied territories and republics cannot be collapsed into one Soviet sound.' },
    sourceIds: ['S25', 'S26', 'S27', 'S28'],
  },
  {
    id: 'de',
    name: { zh: '德国', en: 'Germany' },
    overview: { zh: '纳粹政权将种族政策和职业控制嵌入音乐制度，同时继续利用轻音乐、舞曲和点播节目维持日常收听。制度控制与娱乐并不矛盾。', en: 'The Nazi regime embedded racial and professional control in musical life while retaining light music, dance music and request programmes. Control and entertainment coexisted.' },
    politics: { zh: '1933年后政治多元被取消，1939年德国发动欧洲战争。德国本土、吞并地区和军事占领区必须分别标示。', en: 'Political pluralism ended after 1933 and Germany launched war in Europe in 1939. Germany proper, annexed territory and occupied zones require separate labels.' },
    media: { zh: '帝国文化院控制职业准入，广播纳入宣传体系；廉价“人民收音机”扩大覆盖，新闻、演说、舞曲与轻音乐同时存在。', en: 'The Reich cultural system controlled work and broadcasting, while cheap receivers expanded a mix of news, speeches, dance and light music.' },
    officialUse: { zh: '《点播音乐会》把前线士兵、家庭留言、捐赠和娱乐连接起来；进行曲与政治歌曲用于仪式，但不能代表全部日常收听。', en: 'Request concerts linked soldiers, family messages, donations and entertainment; marches and political songs did not exhaust everyday listening.' },
    dailyLife: { zh: '舞厅、电影、私人唱片和广播娱乐继续存在。爵士与摇摆受到种族化攻击，却通过改名、改编、私下收听和青年亚文化延续。', en: 'Dance halls, cinema and private records continued. Jazz and swing survived racialised attacks through adaptation and private listening.' },
    movement: { zh: '犹太音乐家、政治反对者和被列为“颓废”的艺术家被解雇、流亡、监禁或杀害；占领区发射站又被纳入德国广播网络。', en: 'Jewish and politically excluded musicians faced dismissal, exile, imprisonment and murder, while occupied transmitters entered German networks.' },
    examples: ['Lili Marleen', '拉勒·安德森', '帝国音乐院', '帝国广播体系', '点播音乐会'],
    differences: { zh: '官方仪式、军队广播、商业娱乐、秘密收听、集中营和占领城市中的强迫文化活动不能合并为一种“德国风格”。', en: 'Official ritual, military radio, commerce, clandestine listening, camps and coerced culture in occupied cities were radically different settings.' },
    sourceIds: ['S13', 'S14', 'S15', 'S19', 'S37', 'S38', 'S45'],
  },
  {
    id: 'uk',
    name: { zh: '英国', en: 'United Kingdom' },
    overview: { zh: 'BBC、部队节目、工厂广播和现场慰问构成重要传播网络，但英国本土经验不能代表殖民地、自治领或不同族裔军人的全部经验。', en: 'BBC services, factory broadcasts and live troop entertainment formed a major network, but metropolitan Britain cannot stand for colonies, dominions or all service personnel.' },
    politics: { zh: '英国于1939年9月对德宣战，经历海上封锁、空袭、海外战场和帝国军队动员。', en: 'Britain declared war in September 1939 and experienced blockade, bombing, overseas war and imperial military mobilisation.' },
    media: { zh: 'BBC战时重组为Home Service、Forces Programme等服务，结合新闻、教育与娱乐。节目表是确认播出日期和对象的核心证据。', en: 'BBC wartime services combined news, education and entertainment. Programme schedules are central evidence for dates and audiences.' },
    officialUse: { zh: 'ENSA组织军人演出；工厂音乐节目把音乐与生产节奏结合，但工人反应并不一致。', en: 'ENSA organised live entertainment, while factory music linked sound to production without producing one uniform worker response.' },
    dailyLife: { zh: '电影院、舞厅、酒吧、家庭钢琴和收音机在空袭与限电条件下继续存在，娱乐也可能传递新闻和公共指令。', en: 'Cinema, dance halls, pubs, pianos and radios continued under raids and blackout, sometimes carrying information as well as entertainment.' },
    movement: { zh: '伦敦汇集欧洲流亡者和自由政府广播人员；儿童疏散、征兵和海外驻军则打散家庭与乐团。', en: 'London gathered exiles and government-in-exile broadcasters, while evacuation and service disrupted families and ensembles.' },
    examples: ["We'll Meet Again", 'Vera Lynn', 'BBC', 'ENSA', 'Music While You Work'],
    differences: { zh: '伦敦空袭区、工业城市、乡村疏散地、军营、舰艇和海外部队的接收条件与节目需求不同。', en: 'Bombed London, industrial cities, evacuation areas, camps, ships and overseas forces had different reception and programme needs.' },
    sourceIds: ['S18', 'S19', 'S20', 'S21', 'S22', 'S46'],
  },
  {
    id: 'fr',
    name: { zh: '法国', en: 'France' },
    overview: { zh: '1940年战败后，法国出现占领区、维希政权、自由法国和抵抗网络相互竞争的声音空间，不能概括成一种法国音乐。', en: 'After defeat in 1940, occupation authorities, Vichy, Free France and resistance networks created competing sound spaces rather than one French music.' },
    politics: { zh: '法国1939年参战，1940年战败后本土被分区统治；自由法国在伦敦和海外活动，国内抵抗逐渐发展。', en: 'France entered the war in 1939, was defeated and partitioned in 1940, while Free French and resistance networks developed.' },
    media: { zh: 'Radio Paris、维希广播、BBC法语广播和秘密收听争夺听众。反犹政策排斥犹太音乐家并限制职业活动。', en: 'Radio Paris, Vichy radio, BBC French broadcasting and clandestine listening competed, amid antisemitic exclusion from musical work.' },
    officialUse: { zh: '自由法国广播使用旋律、口号和歌曲进行识别与动员；占领广播也以音乐吸引听众，因此娱乐节目并非政治中立。', en: 'Free French broadcasting used music for identification and mobilisation; occupation radio also used entertainment politically.' },
    dailyLife: { zh: '音乐厅、歌舞厅、电影院和唱片消费继续，却受到宵禁、物资、审查、身份法令和合作关系影响。', en: 'Concerts, cabaret, cinema and records continued under curfew, scarcity, censorship and racial law.' },
    movement: { zh: '音乐家逃往未占区、伦敦、美洲或被迫隐藏；殖民地和海外自由法国网络也参与法语广播。', en: 'Musicians fled, hid or joined overseas networks, while colonial and Free French systems also shaped broadcasting.' },
    examples: ["J'attendrai", 'Le Chant des partisans', 'Fleur de Paris', 'Rina Ketty', 'Anna Marly', 'Radio Paris'],
    differences: { zh: '被占巴黎、维希控制区、阿尔萨斯—洛林、伦敦流亡网络、殖民地和抵抗山区必须分别叙述。', en: 'Occupied Paris, Vichy territory, Alsace-Lorraine, London exile networks, colonies and resistance areas require separate narratives.' },
    sourceIds: ['S16', 'S17', 'S19', 'S23', 'S24', 'S47'],
  },
  {
    id: 'it',
    name: { zh: '意大利', en: 'Italy' },
    overview: { zh: '法西斯广播、殖民战争歌曲、城市娱乐、地方传统和1943年后的抵抗网络并存。1943年前后的政治断裂尤其需要分阶段叙述。', en: 'Fascist broadcasting, colonial songs, urban entertainment, local traditions and post-1943 resistance coexisted. The rupture of 1943 requires periodised treatment.' },
    politics: { zh: '法西斯政权1935年侵略埃塞俄比亚，1940年参战；1943年停战后，南部王国、盟军、北部德军占领和意大利社会共和国并存。', en: 'Fascist Italy invaded Ethiopia and entered the European war; after the 1943 armistice, control divided among the monarchy, Allies, German occupation and the Italian Social Republic.' },
    media: { zh: 'EIAR承担新闻、教育、娱乐和宣传；唱片、电影歌曲与地方表演继续生产，语言规范和文化“自给”政策影响节目。', en: 'EIAR combined information, education, entertainment and propaganda, while records and regional performance continued under cultural regulation.' },
    officialUse: { zh: '殖民歌曲和法西斯仪式音乐服务于政权动员；《Faccetta nera》的版本与审查变化也显示宣传内部并非完全一致。', en: 'Colonial and ceremonial music served mobilisation, while changes to Faccetta nera reveal tensions within official propaganda.' },
    dailyLife: { zh: '那不勒斯歌曲、歌剧、舞曲、广播综艺和地方传统没有被单一的法西斯音乐取代。', en: 'Neapolitan song, opera, dance music, variety radio and local traditions were not replaced by one Fascist style.' },
    movement: { zh: '1943年后，前士兵、政治活动者和居民加入不同阵营；山区抵抗通过口传和改词形成歌曲网络，却很少留下同期录音。', en: 'After 1943, people entered competing camps and partisan song circulated orally, often without contemporary recordings.' },
    examples: ['Faccetta nera', 'Fischia il vento', 'Felice Cascione', 'EIAR', 'Carlo Buti'],
    differences: { zh: '盟军控制南部、德国占领北部、城市广播市场和山区游击队不能混写；《Bella ciao》的战后地位不能倒写成战时普遍事实。', en: 'Allied south, German-occupied north, urban media and mountain partisans must be separated; Bella ciao’s later status cannot be projected backward.' },
    sourceIds: ['S11', 'S12', 'S32', 'S33', 'S34', 'S39'],
  },
  {
    id: 'us',
    name: { zh: '美国', en: 'United States' },
    overview: { zh: '商业广播、电影、唱片、军方娱乐和政府信息项目相互连接，但大乐队不能代表全部美国社会，战争动员也处在种族隔离与强制迁移的结构中。', en: 'Commercial media, military entertainment and government information programmes interacted, but big bands did not represent all of American society, which remained structured by segregation and forced removal.' },
    politics: { zh: '美国在1941年12月以前未正式参战，但已通过援助、征兵准备和国防生产逐步卷入；珍珠港袭击后进入战争。', en: 'Before December 1941 the United States was not formally at war but had moved toward involvement through aid, conscription and defence production.' },
    media: { zh: '商业广播网、地方电台、电影和唱片业继续运行；1942年成立的战争信息署协调国内外信息项目，军方广播面向海外部队。', en: 'Commercial networks, film and records continued while the Office of War Information and military broadcasting expanded.' },
    officialUse: { zh: '军方委员会、军乐队、USO和V-Disc为部队提供乐谱、乐器、录音和演出。V-Disc的军用录制安排不能与商业发行混为一谈。', en: 'Military committees, bands, USO and V-Disc supplied music to forces; military pressings were distinct from commercial releases.' },
    dailyLife: { zh: '摇摆乐、乡村音乐、布鲁斯、福音、拉丁和族裔音乐在舞厅、广播、点唱机与家庭中并存。', en: 'Swing, country, blues, gospel, Latin and ethnic traditions coexisted across halls, radio, jukeboxes and homes.' },
    movement: { zh: '征兵、军工迁移和“大迁徙”改变乐手与听众分布；非裔美国音乐广泛流通，却仍处于隔离和不平等的行业体系中。', en: 'Service, war industry and the Great Migration changed musical geography while Black musicians remained subject to segregation and unequal industries.' },
    examples: ['Boogie Woogie Bugle Boy', 'Andrews Sisters', 'Glenn Miller', '战争信息署', 'V-Disc计划'],
    differences: { zh: '不同海岸、南方隔离制度、军营、日裔拘禁营、海外基地与本土家庭广播具有不同条件，热门唱片不能当作全国统一态度。', en: 'Coasts, the segregated South, camps, Japanese American incarceration sites, overseas bases and households had different conditions.' },
    sourceIds: ['S29', 'S30', 'S31', 'S40', 'S48', 'S49', 'S50'],
  },
]

export const researchPeople: ResearchPerson[] = [
  {
    id: 'nie-er', name: '聂耳｜Nie Er', years: '1912—1935',
    role: { zh: '作曲家', en: 'Composer' },
    location: { zh: '上海电影与左翼文化网络；1935年赴日本后去世。', en: 'Shanghai film and left-wing cultural networks; died in Japan in 1935.' },
    activity: { zh: '为电影、戏剧和群众歌曲作曲。《义勇军进行曲》用于1935年电影《风云儿女》，1937年后在抗战动员中扩大传播。', en: 'Composed for film, theatre and mass song. March of the Volunteers was linked to the 1935 film Children of the Storm and circulated more widely after 1937.' },
    institutionalRelation: { zh: '作品后来被不同抗日组织和公共场合使用，但创作早于全面战争。', en: 'The work was later used across resistance organisations, but it predates full-scale war.' },
    works: ['义勇军进行曲', '毕业歌'],
    boundary: { zh: '1949年后的国歌地位不在主体展开；战时传播范围仍需节目单与报刊支持。', en: 'Its post-1949 anthem status is outside the core narrative; wartime use requires contemporary evidence.' },
    sourceIds: ['S04'],
  },
  {
    id: 'tian-han', name: '田汉｜Tian Han', years: '1898—1968',
    role: { zh: '剧作家、作词者', en: 'Playwright and lyricist' },
    location: { zh: '上海及后来的抗战文艺网络。', en: 'Shanghai and later wartime cultural networks.' },
    activity: { zh: '为《风云儿女》写作与《义勇军进行曲》相关的歌词文本，并继续从事戏剧和抗战宣传活动。', en: 'Wrote the lyric text associated with March of the Volunteers and continued theatre and wartime cultural work.' },
    institutionalRelation: { zh: '与左翼文化组织关系密切，歌曲后来进入多种政治和军事使用场景。', en: 'Closely linked to left-wing cultural organisations; the song later entered varied political and military settings.' },
    works: ['义勇军进行曲', '抗战戏剧作品'],
    boundary: { zh: '电影文本、歌词版本与后来的正式国歌文本必须分开。', en: 'Film text, lyric versions and the later anthem text must be distinguished.' },
    sourceIds: ['S04'],
  },
  {
    id: 'he-luting', name: '贺绿汀｜He Luting', years: '1903—1999',
    role: { zh: '作曲家、音乐教育者', en: 'Composer and educator' },
    location: { zh: '上海及内地抗战文艺网络。', en: 'Shanghai and inland wartime cultural networks.' },
    activity: { zh: '1937年冬创作《游击队歌》，1938年初已在抗战文艺活动中传播，同时从事电影和群众音乐创作。', en: 'Wrote Song of the Guerrillas in winter 1937; it circulated in wartime cultural activity by early 1938.' },
    institutionalRelation: { zh: '作品被部队、演出队和群众组织使用；具体演唱仍需逐次记录。', en: 'Used by military, performance and mass organisations, with individual performances requiring evidence.' },
    works: ['游击队歌', '牧童短笛'],
    boundary: { zh: '后来的标准合唱录音不能当作1938年原声。', en: 'Later standard choral recordings are not 1938 audio.' },
    sourceIds: ['S06'],
  },
  {
    id: 'xian-xinghai', name: '冼星海｜Xian Xinghai', years: '1905—1945',
    role: { zh: '作曲家、音乐教育者', en: 'Composer and educator' },
    location: { zh: '1938年到延安；1940年后赴苏联并因战争滞留。', en: 'Moved to Yan’an in 1938 and later became stranded in the Soviet Union.' },
    activity: { zh: '1939年根据光未然诗作创作《黄河大合唱》，4月在延安首演，并创作多部抗战声乐作品。', en: 'Composed the Yellow River Cantata in 1939 to Guang Weiran’s text; premiered in Yan’an in April.' },
    institutionalRelation: { zh: '与延安文艺机构关系直接，作品服务抗战动员，也具有独立的音乐结构与演出史。', en: 'Directly connected to Yan’an institutions; the work served mobilisation while retaining a complex performance history.' },
    works: ['黄河大合唱', '到敌人后方去'],
    boundary: { zh: '1970年代钢琴协奏曲和后期录音不是1939年首演原貌。', en: 'The 1970s piano concerto and later recordings are not the 1939 premiere version.' },
    sourceIds: ['S07'],
  },
  {
    id: 'setoguchi', name: '濑户口藤吉｜Setoguchi Tōkichi', years: '1868—1941',
    role: { zh: '作曲家、海军军乐体系从业者', en: 'Composer associated with naval band institutions' },
    location: { zh: '日本', en: 'Japan' },
    activity: { zh: '为1937年由内阁情报部组织征集的《爱国行进曲》谱曲，作品于1938年前后由多家公司发行。', en: 'Composed the selected melody for the 1937 official Aikoku Kōshinkyoku competition; multiple labels issued versions.' },
    institutionalRelation: { zh: '作品来自官方征集，馆藏版本由帝国海军军乐队演奏。', en: 'The work came from an official competition; one archive copy features the Imperial Japanese Navy Band.' },
    works: ['愛国行進曲'],
    boundary: { zh: '官方委托、个人职业和社会接受是三个不同问题。', en: 'Official commission, personal career and social reception are separate questions.' },
    sourceIds: ['S09', 'S10'],
  },
  {
    id: 'alexandrov', name: '亚历山大·亚历山德罗夫｜Alexander Alexandrov', years: '1883—1946',
    role: { zh: '作曲家、指挥家', en: 'Composer and conductor' },
    location: { zh: '莫斯科；红军歌舞团', en: 'Moscow; Red Army ensemble' },
    activity: { zh: '1941年为列别杰夫-库马奇的歌词谱写《神圣的战争》，由红军歌舞团在德国入侵后迅速演出。', en: 'Set Lebedev-Kumach’s text as The Sacred War in 1941, rapidly performed by the Red Army ensemble.' },
    institutionalRelation: { zh: '与红军文化机构直接相连，作品由国家和军队传播系统使用。', en: 'Directly linked to Red Army cultural institutions and state dissemination.' },
    works: ['Священная война'],
    boundary: { zh: '国家推广不能自动解释为所有士兵的同一种感受。', en: 'State promotion does not prove one uniform soldier response.' },
    sourceIds: ['S28'],
  },
  {
    id: 'shostakovich', name: '德米特里·肖斯塔科维奇｜Dmitri Shostakovich', years: '1906—1975',
    role: { zh: '作曲家', en: 'Composer' },
    location: { zh: '列宁格勒，后疏散至古比雪夫和莫斯科。', en: 'Leningrad, later evacuated to Kuibyshev and Moscow.' },
    activity: { zh: '1936年遭官方报刊批判；1941年创作第七交响曲，1942年在苏联和海外演出、广播并录音。', en: 'Publicly condemned in 1936; composed the Seventh Symphony in 1941, performed and broadcast widely in 1942.' },
    institutionalRelation: { zh: '作品被国家传播为抵抗象征，作曲家本人同时处于审查和政治压力之中。', en: 'The symphony became a state symbol while its composer remained under censorship and pressure.' },
    works: ['第七交响曲“列宁格勒”'],
    boundary: { zh: '作品对纳粹入侵和斯大林主义暴力的指向存在争论，主卡只陈述可核实的创作与演出史。', en: 'Interpretations remain disputed; the main record limits itself to verifiable composition and performance history.' },
    sourceIds: ['S25', 'S26', 'S27'],
  },
  {
    id: 'lale-andersen', name: '拉勒·安德森｜Lale Andersen', years: '1905—1972',
    role: { zh: '歌手', en: 'Singer' },
    location: { zh: '德国及欧洲演出、唱片和广播网络。', en: 'German and European performance, recording and broadcasting networks.' },
    activity: { zh: '1939年录制《Lili Marleen》，1941年经贝尔格莱德电台播放后在多个战场传播。', en: 'Recorded Lili Marleen in 1939; it spread across fronts after Radio Belgrade broadcasts in 1941.' },
    institutionalRelation: { zh: '歌曲通过德军控制电台扩散，也被对方士兵收听；安德森后来受到纳粹当局限制。', en: 'The song spread via a German-controlled station and crossed enemy lines; Andersen later faced Nazi restrictions.' },
    works: ['Lili Marleen'],
    boundary: { zh: '她既不能只写成宣传者，也不能因禁播经历被简单塑造成抵抗英雄。', en: 'She should be reduced neither to propagandist nor resistance hero.' },
    sourceIds: ['S15'],
  },
  {
    id: 'vera-lynn', name: 'Vera Lynn', years: '1917—2020',
    role: { zh: '歌手、广播表演者', en: 'Singer and broadcaster' },
    location: { zh: '英国BBC、商业唱片和现场演出网络；1944年赴亚洲战区慰问。', en: 'BBC, commercial records and live performance; toured troops in Asia in 1944.' },
    activity: { zh: '1939年与Arthur Young录制《We’ll Meet Again》，主持BBC节目，为部队与家庭传递歌曲和信息。', en: 'Recorded We’ll Meet Again in 1939 and presented BBC programmes linking forces and families.' },
    institutionalRelation: { zh: 'BBC节目和军队慰问使她成为公共战时声音，但她不是政府政策的正式发言人。', en: 'Broadcast and troop work made her a public wartime voice, not an official policy spokesperson.' },
    works: ["We'll Meet Again", 'The White Cliffs of Dover'],
    boundary: { zh: '“部队甜心”是传播形象；1953年版本与1939年唱片必须分开。', en: '“Forces’ Sweetheart” is a media image; the 1953 remake differs from the 1939 record.' },
    sourceIds: ['S18', 'S20', 'S22'],
  },
  {
    id: 'marly-sablon', name: 'Anna Marly 与 Germaine Sablon', years: '1917—2006 / 1899—1985',
    role: { zh: '作曲者与演唱者', en: 'Composer and singer' },
    location: { zh: '伦敦自由法国与BBC法语广播网络。', en: 'Free French and BBC French networks in London.' },
    activity: { zh: 'Marly创作旋律，Kessel与Druon于1943年写成法语歌词；Sablon于5月30日演唱并为宣传影片录音。', en: 'Marly composed the tune; Kessel and Druon wrote French lyrics; Sablon performed and recorded it in May 1943.' },
    institutionalRelation: { zh: '与自由法国广播和抵抗动员直接相连，旋律被用作节目识别信号。', en: 'Directly connected to Free French broadcasting and resistance mobilisation.' },
    works: ['Le Chant des partisans'],
    boundary: { zh: '旋律、歌词、首次演唱、首次录音和秘密印刷各有日期；1963年影像不是1943年原声。', en: 'Tune, lyrics, first performance, recording and underground printing have separate dates; 1963 footage is not wartime audio.' },
    sourceIds: ['S16', 'S17'],
  },
  {
    id: 'felice-cascione', name: 'Felice Cascione', years: '1918—1944',
    role: { zh: '医生、抵抗运动成员、作词者', en: 'Doctor, partisan and lyricist' },
    location: { zh: '意大利利古里亚地区。', en: 'Liguria, Italy.' },
    activity: { zh: '1943年后参加抵抗，为《喀秋莎》旋律写作意大利语歌词，形成《Fischia il vento》；1944年阵亡。', en: 'Joined the resistance and adapted Katyusha as Fischia il vento; killed in 1944.' },
    institutionalRelation: { zh: '与武装抵抗组织直接相关，主要通过队伍演唱和口传传播。', en: 'Directly connected to armed resistance and oral group circulation.' },
    works: ['Fischia il vento'],
    boundary: { zh: '口述材料能支持创作与传唱，不能自动证明现存音频录于1943年。', en: 'Oral testimony supports creation and singing, not the date of surviving recordings.' },
    sourceIds: ['S32', 'S33'],
  },
  {
    id: 'andrews-sisters', name: 'Andrews Sisters', years: 'LaVerne 1911—1967 / Maxene 1916—1995 / Patty 1918—2013',
    role: { zh: '声乐组合', en: 'Vocal group' },
    location: { zh: '美国唱片、电影、广播与军队慰问网络。', en: 'United States records, film, radio and troop entertainment.' },
    activity: { zh: '1941年录制《Boogie Woogie Bugle Boy》，战争中参加广播、电影、募款与部队演出。', en: 'Recorded Boogie Woogie Bugle Boy in 1941 and appeared in broadcasts, films, fundraising and troop entertainment.' },
    institutionalRelation: { zh: '商业表演与战时动员相连，但并非所有作品都由政府委托。', en: 'Commercial performance intersected with mobilisation without every work being government commissioned.' },
    works: ['Boogie Woogie Bugle Boy'],
    boundary: { zh: '作品借用非裔美国音乐语汇，却在种族隔离的产业与军队环境中传播。', en: 'The music drew on Black idioms while circulating through segregated industries and armed forces.' },
    sourceIds: ['S30', 'S48'],
  },
  {
    id: 'glenn-miller', name: 'Glenn Miller', years: '1904—1944',
    role: { zh: '乐队领队、军方音乐人', en: 'Band leader and military musician' },
    location: { zh: '美国陆军航空队乐队；英国及欧洲盟军广播与演出网络。', en: 'Army Air Forces band and Allied broadcasting in Britain and Europe.' },
    activity: { zh: '1942年入伍，组建军方大乐队，为部队演出和广播；1944年12月在飞往法国途中失踪。', en: 'Enlisted in 1942, led an AAF band for broadcasts and performances, and disappeared en route to France in December 1944.' },
    institutionalRelation: { zh: '正式军职和军方乐队使其战时活动与军队组织直接相连。', en: 'Formal service and a military band directly linked his wartime work to armed forces organisation.' },
    works: ['陆军航空队乐队战时广播', '战前商业录音'],
    boundary: { zh: '战前民用唱片、军方广播和战后整理唱片必须分别标注。', en: 'Prewar commercial records, wartime broadcasts and postwar compilations require separate labels.' },
    sourceIds: ['S40', 'S50'],
  },
]

export const researchInstitutions: ResearchInstitution[] = [
  { id: 'central-radio-cn', name: { zh: '国民政府中央广播体系', en: 'Nationalist Central Broadcasting System' }, period: '1928—1945', activity: { zh: '随政府从南京向内地迁移，发布新闻、教育与政治动员节目。', en: 'Moved inland with the government and broadcast news, education and mobilisation.' }, materials: { zh: '节目表、广播稿、台刊', en: 'Schedules, scripts and station journals' }, boundary: { zh: '中央广播不能代表全部中国听众，地方台、商业台和占领台需另列。', en: 'Central radio did not represent all Chinese listening.' }, sourceIds: ['S05'] },
  { id: 'yanan-radio', name: { zh: '延安新华广播电台', en: 'Yan’an Xinhua Radio' }, period: '1940—1945', activity: { zh: '在有限设备和发射条件下传播新闻与政治内容。', en: 'Broadcast news and political material under limited technical conditions.' }, materials: { zh: '开播档案、节目记录', en: 'Foundation and programme records' }, boundary: { zh: '后来的广播规模不能倒写进1940—1945年。', en: 'Later scale cannot be projected back onto wartime operations.' }, sourceIds: ['S42'] },
  { id: 'nhk', name: { zh: '日本放送协会（NHK）', en: 'Nippon Hōsō Kyōkai (NHK)' }, period: '1926—1945', activity: { zh: '广播集中化，1937年以后在国家动员中的作用增加。', en: 'Centralised broadcasting and expanded mobilisation after 1937.' }, materials: { zh: '台刊、节目表、收听户统计', en: 'Journals, schedules and licence statistics' }, boundary: { zh: '日本本土、殖民地和占领区合作台必须分开。', en: 'Japan proper, colonial and occupation broadcasters must be separated.' }, sourceIds: ['S08', 'S44'] },
  { id: 'japan-cabinet-info', name: { zh: '日本内阁情报部', en: 'Japanese Cabinet Information Department' }, period: '1937—1940', activity: { zh: '组织《爱国行进曲》等征集与推广，协调新闻和宣传。', en: 'Organised competitions and coordinated information and propaganda.' }, materials: { zh: '征集公告、获选名单、唱片目录', en: 'Competition notices, selections and discographies' }, boundary: { zh: '官方选定只证明制度用途，不证明全民态度。', en: 'Official selection proves institutional use, not universal opinion.' }, sourceIds: ['S09', 'S10'] },
  { id: 'reich-culture', name: { zh: '帝国文化院与帝国音乐院', en: 'Reich Chamber of Culture and Reich Music Chamber' }, period: '1933—1945', activity: { zh: '控制职业准入、演出与审查，排斥犹太及政治上不受容许的音乐家。', en: 'Controlled work and performance while excluding Jewish and politically targeted musicians.' }, materials: { zh: '法令、会员档案、禁演与任职记录', en: 'Laws, membership, bans and employment records' }, boundary: { zh: '会员身份可能来自谋生压力、制度强制或主动参与，需逐人判断。', en: 'Membership may reflect coercion, survival or participation and requires individual analysis.' }, sourceIds: ['S13', 'S14'] },
  { id: 'reich-radio', name: { zh: '德国帝国广播体系', en: 'German Reich Broadcasting System' }, period: '1933—1945', activity: { zh: '传播新闻、演说、娱乐和军队点播节目，并利用廉价收音机扩大覆盖。', en: 'Carried news, speeches, entertainment and request programmes through expanded receiver ownership.' }, materials: { zh: '节目表、广播统计、点播音乐会记录', en: 'Schedules, statistics and request-programme records' }, boundary: { zh: '娱乐具有政治功能，但每首舞曲不能自动标成宣传。', en: 'Entertainment could be political without every dance tune being propaganda.' }, sourceIds: ['S37', 'S38'] },
  { id: 'bbc', name: { zh: '英国广播公司（BBC）', en: 'British Broadcasting Corporation' }, period: '1922—1945', activity: { zh: '战时重组国内、部队与对外节目，提供新闻、娱乐、工厂音乐和流亡政府广播平台。', en: 'Reorganised domestic, forces and overseas services during the war.' }, materials: { zh: 'Programme Index、广播稿、录音', en: 'Programme Index, scripts and recordings' }, boundary: { zh: '国内节目与对外服务分开；播出不等于听众接受。', en: 'Domestic and overseas services differ, and transmission does not equal reception.' }, sourceIds: ['S18', 'S21'] },
  { id: 'ensa', name: { zh: 'ENSA', en: 'Entertainments National Service Association' }, period: '1939—1945', activity: { zh: '为军人和军需工人组织戏剧、音乐与综艺演出。', en: 'Organised theatre, music and variety for service personnel and war workers.' }, materials: { zh: '演出单、照片、人员记录', en: 'Programmes, photographs and personnel records' }, boundary: { zh: '只叙述1939—1945年的活动。', en: 'Only wartime activity is included.' }, sourceIds: ['S18'] },
  { id: 'french-radios', name: { zh: 'Radio Paris、维希广播与BBC法语服务', en: 'Radio Paris, Vichy Radio and BBC French Services' }, period: '1940—1944', activity: { zh: '分属不同政治力量，利用新闻、音乐和识别信号争夺法语听众。', en: 'Competing authorities used news, music and signatures to reach French listeners.' }, materials: { zh: '节目表、识别信号、广播稿', en: 'Schedules, signatures and scripts' }, boundary: { zh: '不能统称“法国国家广播”，控制者、发射地和年份都需标明。', en: 'They cannot be grouped as one French national broadcaster.' }, sourceIds: ['S16', 'S17'] },
  { id: 'eiar', name: { zh: 'EIAR', en: 'EIAR' }, period: '1927—1944', activity: { zh: '编排法西斯时期的新闻、宣传、音乐与娱乐；1943年后随控制区分裂。', en: 'Programmed Fascist news, propaganda, music and entertainment, then fragmented after 1943.' }, materials: { zh: '节目表、台刊、唱片与演出资料', en: 'Schedules, journals, records and performance documents' }, boundary: { zh: '1943年后北部与南部广播不能继续作为一个场景。', en: 'Northern and southern broadcasting diverged after 1943.' }, sourceIds: ['S39'] },
  { id: 'red-army-ensemble', name: { zh: '红军歌舞团与苏联广播机构', en: 'Red Army Ensemble and Soviet Broadcasting' }, period: '1928—1945', activity: { zh: '组织军队歌曲演出、录音、广播与前线慰问。', en: 'Organised military song, recording, broadcasting and frontline performance.' }, materials: { zh: '演出、唱片与广播档案', en: 'Performance, record and broadcast archives' }, boundary: { zh: '国家机构材料需与士兵和听众的个人材料区分。', en: 'Institutional records differ from individual listener evidence.' }, sourceIds: ['S28'] },
  { id: 'leningrad-radio-orchestra', name: { zh: '列宁格勒广播交响乐团', en: 'Leningrad Radio Orchestra' }, period: '1930s—1945', activity: { zh: '围城中维持广播音乐活动并组织1942年第七交响曲演出。', en: 'Maintained music broadcasting during the siege and performed the Seventh Symphony in 1942.' }, materials: { zh: '排练、人员、广播与演出档案', en: 'Rehearsal, personnel, broadcast and performance records' }, boundary: { zh: '列宁格勒现场与同年海外录音不是同一声音文件。', en: 'The Leningrad performance is not the same recording as overseas versions.' }, sourceIds: ['S26'] },
  { id: 'owi', name: { zh: '美国战争信息署（OWI）', en: 'U.S. Office of War Information' }, period: '1942—1945', activity: { zh: '协调国内外战争信息、广播与影片项目。', en: 'Coordinated domestic and overseas information, radio and film projects.' }, materials: { zh: 'RG 208档案、广播脚本与录音', en: 'Record Group 208, scripts and recordings' }, boundary: { zh: '商业唱片进入节目不等于由OWI创作或委托。', en: 'A commercial record in a programme was not necessarily commissioned by OWI.' }, sourceIds: ['S29', 'S49'] },
  { id: 'vdisc', name: { zh: '陆海军联合音乐委员会与V-Disc计划', en: 'Joint Army-Navy Music Committee and V-Disc' }, period: '1941—1945', activity: { zh: '为军队提供音乐材料并制作军用唱片。', en: 'Supplied music and produced special records for armed forces use.' }, materials: { zh: 'V-Disc唱片、矩阵号、军方文件', en: 'V-Discs, matrices and military records' }, boundary: { zh: '本项目只收录1943—1945年录制或使用的V-Disc。', en: 'Only V-Discs recorded or used by 1945 enter the core period.' }, sourceIds: ['S31', 'S40'] },
]

export const researchWorks: ResearchWork[] = [
  {
    id: 'march-volunteers', title: '义勇军进行曲', translatedTitle: { zh: 'March of the Volunteers', en: 'March of the Volunteers' },
    creators: { zh: '聂耳作曲，田汉作词；1935年电影《风云儿女》相关演唱与后来的合唱版本需分开。', en: 'Music by Nie Er, words by Tian Han; film, wartime and later choral versions must be distinguished.' },
    composition: { zh: '1935年', en: '1935' }, firstUse: { zh: '1935年随电影和相关宣传材料出现；准确首映、首张唱片和首版乐谱仍需分列。', en: 'Appeared with the 1935 film and related material; premiere, first record and first score require separate documentation.' },
    recording: { zh: '当前实验音频没有可由权威目录确认的1935—1945年录音日期。', en: 'The current experimental audio lacks an authoritative 1935–1945 recording date.' },
    languageAndType: { zh: '汉语；电影歌曲、进行曲、群众歌曲。', en: 'Chinese; film song, march and mass song.' }, circulation: { zh: '电影、学校、救亡演出、军队和公共集会；1937年后传播扩大。', en: 'Film, schools, resistance performance, military and public gatherings; wider circulation after 1937.' },
    relation: { zh: '对1935年电影与救亡主题属于1/4；对1937年战争扩大属于2/3/4，不是为七七事变创作。', en: 'Types 1/4 for the 1935 film setting and 2/3/4 for post-1937 use; not written for the Marco Polo Bridge Incident.' },
    status: 'C', statusNote: { zh: '作品进入核心，当前音频版本待核验。', en: 'Core work; current audio version awaiting verification.' }, sourceIds: ['S04'],
  },
  {
    id: 'song-guerrillas-cn', title: '游击队歌', translatedTitle: { zh: 'Song of the Guerrillas', en: 'Song of the Guerrillas' },
    creators: { zh: '贺绿汀词曲；各合唱团和部队演唱版本另列。', en: 'Words and music by He Luting; performance versions require separate records.' },
    composition: { zh: '1937年冬', en: 'Winter 1937' }, firstUse: { zh: '1938年初已在抗战文艺活动中演出，首次乐谱与逐场演出继续核查。', en: 'Performed in wartime cultural activity by early 1938; first score and individual programmes remain under review.' },
    recording: { zh: '现有网络合集缺少可接受的录音年代和唱片目录。', en: 'Current online compilations lack acceptable recording dates and discographic evidence.' }, languageAndType: { zh: '汉语；群众歌曲、游击战争题材。', en: 'Chinese; mass song with guerrilla-war subject.' },
    circulation: { zh: '抗战演出队、学校、部队和群众歌唱。', en: 'Wartime troupes, schools, units and mass singing.' }, relation: { zh: '与1937年后游击战争环境属于1/2/3；不是卢沟桥战斗现场歌曲。', en: 'Types 1/2/3 for the expanded guerrilla-war setting; not a sound record of the bridge clash.' }, status: 'C', statusNote: { zh: '作品进入核心，现有音频待核验。', en: 'Core work; current audio unverified.' }, sourceIds: ['S06'],
  },
  {
    id: 'yellow-river', title: '黄河大合唱', translatedTitle: { zh: 'The Yellow River Cantata', en: 'The Yellow River Cantata' },
    creators: { zh: '冼星海作曲，光未然作词；1939年首演与后来的大型改编分开。', en: 'Music by Xian Xinghai, text by Guang Weiran; the 1939 premiere differs from later large-scale arrangements.' },
    composition: { zh: '1939年', en: '1939' }, firstUse: { zh: '1939年4月13日，延安陕北公学礼堂首演。', en: 'Premiered 13 April 1939 in Yan’an.' }, recording: { zh: '现有LP资料不足以证明战时录音；1970年代钢琴协奏曲不是1939年合唱原声。', en: 'Current LP evidence does not prove a wartime recording; the later piano concerto is not the 1939 cantata.' },
    languageAndType: { zh: '汉语；大型合唱套曲。', en: 'Chinese; large-scale cantata.' }, circulation: { zh: '延安及抗战文化演出、合唱组织和政治动员。', en: 'Yan’an performance, wartime choral organisation and mobilisation.' }, relation: { zh: '与全面战争社会环境属于1/2/3，不指向单一战役。', en: 'Types 1/2/3 for the broader war setting, not one battle.' }, status: 'C', statusNote: { zh: '作品进入核心，现有音频只能作为战后版本或待核验材料。', en: 'Core work; current audio is postwar or unverified.' }, sourceIds: ['S07'],
  },
  {
    id: 'aikoku', title: '愛国行進曲', translatedTitle: { zh: '爱国行进曲', en: 'Patriotic March' }, creators: { zh: '森川幸雄作词，濑户口藤吉作曲；馆藏版本由帝国海军军乐队演奏。', en: 'Words by Morikawa Yukio, music by Setoguchi Tōkichi; an archive copy features the Imperial Navy Band.' },
    composition: { zh: '1937年公开征集并选定', en: 'Selected through a 1937 public competition' }, firstUse: { zh: '1937年12月已有公开演奏，唱片公司在1938年前后发行多个版本。', en: 'Publicly performed by December 1937 and issued in multiple versions around 1938.' }, recording: { zh: '国立国会图书馆保存波利多2573号唱片；精确录音日待补证，数字化日期不是录音日期。', en: 'NDL holds Polydor 2573; the exact recording date needs confirmation and digitisation date is not recording date.' },
    languageAndType: { zh: '日语；官方征集爱国歌曲、进行曲。', en: 'Japanese; officially selected patriotic song and march.' }, circulation: { zh: '报纸征集、公共演出、唱片、广播和国家动员。', en: 'Press competition, performance, records, radio and mobilisation.' }, relation: { zh: '与1937年后日本战争动员属于1/3。', en: 'Types 1/3 for Japanese wartime mobilisation after 1937.' }, status: 'C', statusNote: { zh: '高度可信的历史唱片，精确录音日待目录补证。', en: 'Highly credible historical disc; precise recording date pending.' }, sourceIds: ['S09', 'S10'],
  },
  {
    id: 'faccetta-nera', title: 'Faccetta nera', translatedTitle: { zh: '《黑脸小姑娘》（说明性译名）', en: 'Faccetta nera' }, creators: { zh: 'Mario Ruccione作曲，Renato Micheli作词；Carlo Buti等歌手录制。', en: 'Music by Mario Ruccione, words by Renato Micheli; recorded by Carlo Buti and others.' },
    composition: { zh: '1935年', en: '1935' }, firstUse: { zh: '埃塞俄比亚战争动员期间出现并发行唱片。', en: 'Appeared and was recorded during mobilisation for the Ethiopian war.' }, recording: { zh: 'Canzone Italiana提供1935年历史版本；正式采用前需补录唱片公司和编号。', en: 'Canzone Italiana documents a 1935 version; label and catalogue number remain to be added.' },
    languageAndType: { zh: '意大利语；殖民战争流行/宣传歌曲，含种族化语境。', en: 'Italian; colonial-war popular and propaganda song with racialised context.' }, circulation: { zh: '唱片、广播、公共歌唱和法西斯战争动员。', en: 'Records, radio, public singing and Fascist mobilisation.' }, relation: { zh: '对1935年侵略埃塞俄比亚属于1/3/4。', en: 'Types 1/3/4 for the invasion of Ethiopia.' }, status: 'A', statusNote: { zh: '权威馆藏版本补齐编号后可作为战时录音；现代混音排除。', en: 'Archive version can qualify after full catalogue metadata; modern mixes are excluded.' }, sourceIds: ['S11', 'S12'],
  },
  {
    id: 'well-meet-again', title: "We'll Meet Again", translatedTitle: { zh: '我们会再相见', en: "We'll Meet Again" }, creators: { zh: 'Ross Parker与Hughie Charles词曲；Vera Lynn演唱，Arthur Young钢琴伴奏。', en: 'Written by Ross Parker and Hughie Charles; sung by Vera Lynn with Arthur Young.' },
    composition: { zh: '1939年', en: '1939' }, firstUse: { zh: '1939年出版并发行唱片。', en: 'Published and recorded in 1939.' }, recording: { zh: '1939年9月28日，Decca F 7268；1953年合唱版是重录。', en: 'Recorded 28 September 1939 as Decca F 7268; the 1953 choral version is a remake.' }, languageAndType: { zh: '英语；离别与重逢题材流行歌曲。', en: 'English popular song of separation and reunion.' },
    circulation: { zh: '商业唱片、BBC节目、家庭和部队收听。', en: 'Commercial records, BBC programmes, homes and forces.' }, relation: { zh: '对1939年英国参战后的社会环境属于2/4，不是为敦刻尔克或伦敦大轰炸创作。', en: 'Types 2/4 for Britain after entry into war; not written for Dunkirk or the Blitz.' }, status: 'A', statusNote: { zh: '1939年Decca版本已核验；现代替代音频不合格。', en: 'The 1939 Decca version is verified; modern substitutes do not qualify.' }, sourceIds: ['S18', 'S22'],
  },
  {
    id: 'jattendrai', title: "J'attendrai", translatedTitle: { zh: '我会等待', en: "J'attendrai" }, creators: { zh: 'Dino Olivieri作曲，Louis Poterat写法语歌词；Rina Ketty演唱。', en: 'Music by Dino Olivieri, French words by Louis Poterat, performed by Rina Ketty.' },
    composition: { zh: '意大利原作1937年；法语版本1938年', en: 'Italian original 1937; French version 1938' }, firstUse: { zh: '1938年法语唱片发行。', en: 'French recording issued in 1938.' }, recording: { zh: 'BnF目录所见1976年唱片为1938年录音的后期再版资料，原录音、再版和数字化日期需同时显示。', en: 'A 1976 BnF item documents a reissue of the 1938 recording; original, reissue and digitisation dates must all be shown.' },
    languageAndType: { zh: '法语；商业流行歌曲。', en: 'French commercial popular song.' }, circulation: { zh: '战前和战争初期唱片、广播与家庭收听。', en: 'Prewar and early-war records, radio and home listening.' }, relation: { zh: '与法国1939—1940年社会环境属于2/4，不是抵抗歌曲。', en: 'Types 2/4 for 1939–1940 France; not a resistance song.' }, status: 'A', statusNote: { zh: '若再版确认使用1938年母版，可标为历史母版的战后再版。', en: 'Qualifies when the reissue is confirmed to use the 1938 master.' }, sourceIds: ['S23'],
  },
  {
    id: 'lili-marleen', title: 'Lili Marleen', translatedTitle: { zh: '莉莉玛莲', en: 'Lili Marleen' }, creators: { zh: 'Hans Leip诗作，Norbert Schultze谱曲，Lale Andersen演唱。', en: 'Text by Hans Leip, music by Norbert Schultze, sung by Lale Andersen.' },
    composition: { zh: '诗作更早；歌曲1938年谱曲', en: 'Earlier poem; set to music in 1938' }, firstUse: { zh: '1939年8月2日录制；1941年8月18日贝尔格莱德电台播放后传播扩大。', en: 'Recorded 2 August 1939; wider circulation followed Radio Belgrade broadcasts in 1941.' }, recording: { zh: '推荐使用1939年原唱片，现代修复日期单列。', en: 'Use the 1939 original record and list restoration separately.' },
    languageAndType: { zh: '德语；士兵、离别题材流行歌曲。', en: 'German popular song of soldiers and separation.' }, circulation: { zh: '德军控制电台、前线收听、盟军翻唱和多语版本。', en: 'German-controlled radio, frontline listening, Allied covers and translations.' }, relation: { zh: '与1941年战场广播传播属于2/4，不是为某一战役创作。', en: 'Types 2/4 for wartime broadcasting, not written for one battle.' }, status: 'A', statusNote: { zh: '1939年Lale Andersen版本可作为战时原录音。', en: 'The 1939 Lale Andersen version is a wartime original.' }, sourceIds: ['S15'],
  },
  {
    id: 'sacred-war', title: 'Священная война', translatedTitle: { zh: '神圣的战争', en: 'The Sacred War' }, creators: { zh: 'Alexander Alexandrov作曲，Vasily Lebedev-Kumach作词；红军歌舞团演唱。', en: 'Music by Alexander Alexandrov, words by Vasily Lebedev-Kumach, performed by the Red Army ensemble.' },
    composition: { zh: '1941年6月', en: 'June 1941' }, firstUse: { zh: '1941年6月26日在莫斯科白俄罗斯火车站演出。', en: 'Performed at Belorussky Station on 26 June 1941.' }, recording: { zh: '俄罗斯档案项目保存1941年唱片资料；精确录制、压片和发行日需目录互证。', en: 'Russian archival catalogues document a 1941 disc; exact recording, pressing and issue dates require confirmation.' },
    languageAndType: { zh: '俄语；群众合唱、军队动员歌曲。', en: 'Russian mass chorus and military mobilisation song.' }, circulation: { zh: '火车站送行、红军演出、广播和唱片。', en: 'Station send-offs, Red Army performance, radio and records.' }, relation: { zh: '对德国进攻苏联属于1/3。', en: 'Types 1/3 in response to the German invasion.' }, status: 'C', statusNote: { zh: '作品和战时唱片可确认，具体声音文件待矩阵号核验。', en: 'The work and wartime disc are documented; the specific audio awaits matrix confirmation.' }, sourceIds: ['S28'],
  },
  {
    id: 'leningrad-symphony-work', title: 'Symphony No. 7 “Leningrad”', translatedTitle: { zh: '第七交响曲“列宁格勒”', en: 'Symphony No. 7 “Leningrad”' }, creators: { zh: 'Dmitri Shostakovich作曲；纯器乐。', en: 'Composed by Dmitri Shostakovich; instrumental.' },
    composition: { zh: '1941年完成', en: 'Completed 1941' }, firstUse: { zh: '1942年3月5日古比雪夫首演；8月9日列宁格勒演出。', en: 'Premiered 5 March 1942 in Kuibyshev; performed in Leningrad on 9 August.' }, recording: { zh: '1942年7月19日托斯卡尼尼/NBC录音可用，但不是列宁格勒现场。', en: 'The Toscanini/NBC broadcast of 19 July 1942 is usable but is not the Leningrad performance.' },
    languageAndType: { zh: '无歌词；交响曲。', en: 'Instrumental symphony.' }, circulation: { zh: '音乐厅、广播、海外文化外交和围城中的象征性演出。', en: 'Concert hall, broadcasting, cultural diplomacy and symbolic siege performance.' }, relation: { zh: '与列宁格勒围城属于2/3/4。', en: 'Types 2/3/4 in relation to the siege.' }, status: 'A', statusNote: { zh: '1942年NBC录音是战时原录音，但不是列宁格勒现场。', en: 'The 1942 NBC recording is wartime audio, not the Leningrad performance.' }, sourceIds: ['S26', 'S27'],
  },
  {
    id: 'boogie-bugle', title: 'Boogie Woogie Bugle Boy', translatedTitle: { zh: '布吉伍吉号兵', en: 'Boogie Woogie Bugle Boy' }, creators: { zh: 'Don Raye与Hughie Prince词曲；Andrews Sisters演唱，Vic Schoen乐队伴奏。', en: 'Written by Don Raye and Hughie Prince; performed by the Andrews Sisters with Vic Schoen.' },
    composition: { zh: '1940—1941年电影制作期', en: '1940–1941 film production' }, firstUse: { zh: '用于1941年电影Buck Privates，并于同年发行唱片。', en: 'Used in the 1941 film Buck Privates and issued on record.' }, recording: { zh: '1941年1月2日，洛杉矶；Decca 3598，矩阵DLA 2326。', en: 'Recorded 2 January 1941 in Los Angeles; Decca 3598, matrix DLA 2326.' },
    languageAndType: { zh: '英语；摇摆乐、大乐队军旅喜剧歌曲。', en: 'English swing and big-band military comedy song.' }, circulation: { zh: '商业唱片、电影、广播和战时部队娱乐。', en: 'Records, film, radio and wartime troop entertainment.' }, relation: { zh: '与美国参战准备和其后军队娱乐属于4；录制早于珍珠港。', en: 'Type 4 for pre-entry and later military entertainment; recorded before Pearl Harbor.' }, status: 'A', statusNote: { zh: '有完整矩阵记录的1941年版本。', en: 'Verified 1941 version with matrix evidence.' }, sourceIds: ['S30'],
  },
  {
    id: 'chant-partisans-work', title: 'Le Chant des partisans', translatedTitle: { zh: '游击队之歌（法国）', en: 'Le Chant des partisans' }, creators: { zh: 'Anna Marly作曲，Joseph Kessel与Maurice Druon作词；Germaine Sablon早期演唱。', en: 'Music by Anna Marly, French words by Joseph Kessel and Maurice Druon, early performance by Germaine Sablon.' },
    composition: { zh: '法语版本完成于1943年', en: 'French version completed in 1943' }, firstUse: { zh: '1943年5月30日伦敦演唱，随后录入宣传影片；9月地下刊物刊载歌词。', en: 'Performed in London on 30 May 1943, recorded for a propaganda film and printed underground in September.' }, recording: { zh: 'INA常见1963年影像不是1943年录音；战时电影声音需另取馆藏。', en: 'Common 1963 INA footage is not wartime audio; the 1943 film soundtrack requires archive access.' },
    languageAndType: { zh: '法语；抵抗运动歌曲、广播识别旋律。', en: 'French resistance song and broadcast signature.' }, circulation: { zh: 'BBC法语广播、自由法国宣传、地下印刷和抵抗网络。', en: 'BBC French broadcasts, Free French media, underground print and resistance networks.' }, relation: { zh: '与法国抵抗运动属于1/2/3。', en: 'Types 1/2/3 for French resistance.' }, status: 'B', statusNote: { zh: '现有1963年影像是战后演出；1943年音源尚未取得。', en: 'Current 1963 footage is postwar; wartime audio not yet obtained.' }, sourceIds: ['S16', 'S17'],
  },
  {
    id: 'fischia', title: 'Fischia il vento', translatedTitle: { zh: '风在呼啸', en: 'Fischia il vento' }, creators: { zh: '旋律来自Matvei Blanter的《喀秋莎》，Felice Cascione写意大利语歌词。', en: 'Uses Matvei Blanter’s Katyusha melody with Italian words by Felice Cascione.' },
    composition: { zh: '1943年', en: '1943' }, firstUse: { zh: '1943—1944年在利古里亚抵抗队伍中口传。', en: 'Circulated orally among Ligurian partisans in 1943–1944.' }, recording: { zh: '尚未找到权威目录支持的1943—1945原始录音。', en: 'No authoritative 1943–1945 recording has been located.' },
    languageAndType: { zh: '意大利语；抵抗运动改词歌曲。', en: 'Italian resistance adaptation.' }, circulation: { zh: '利古里亚及意大利北部抵抗队伍。', en: 'Partisan groups in Liguria and northern Italy.' }, relation: { zh: '与1943年停战后的抵抗战争属于1/2。', en: 'Types 1/2 for resistance after the 1943 armistice.' }, status: 'B', statusNote: { zh: '作品进入核心，现有声音为战后演唱。', en: 'Core work; available audio is postwar.' }, sourceIds: ['S32', 'S33'],
  },
  {
    id: 'fleur-paris', title: 'Fleur de Paris', translatedTitle: { zh: '巴黎之花', en: 'Fleur de Paris' }, creators: { zh: 'Henri Bourtayre作曲，Maurice Vandair作词；Ginette Garcin早期演唱。', en: 'Music by Henri Bourtayre, words by Maurice Vandair; early performance by Ginette Garcin.' },
    composition: { zh: '1944年', en: '1944' }, firstUse: { zh: '巴黎解放后在广播和演出中传播；首播和首张唱片号仍需补证。', en: 'Circulated after the Liberation of Paris; first broadcast and catalogue number remain to be verified.' }, recording: { zh: 'INA页面的1966年影像和1994年访谈都不是1944年原声。', en: 'INA’s 1966 performance and 1994 interview are not 1944 audio.' },
    languageAndType: { zh: '法语；解放庆祝流行歌曲。', en: 'French liberation celebration song.' }, circulation: { zh: '广播、舞会、乐队演出与解放庆祝。', en: 'Radio, dances, band performance and liberation celebration.' }, relation: { zh: '与1944年巴黎解放属于1/5。', en: 'Types 1/5 for the Liberation of Paris.' }, status: 'B', statusNote: { zh: '现有片段为战后演出；1944年唱片未核实。', en: 'Available footage is postwar; a 1944 record remains unverified.' }, sourceIds: ['S24'],
  },
  {
    id: 'gyokuon', title: '玉音放送｜Gyokuon-hōsō', translatedTitle: { zh: '日本宣布接受投降条件的广播录音', en: 'Broadcast recording announcing acceptance of surrender terms' }, creators: { zh: '诏书由政府体系拟定，昭和天皇裕仁朗读；不是歌曲。', en: 'A state-authored rescript read by Emperor Hirohito; not a song.' },
    composition: { zh: '1945年国家广播讲话', en: '1945 state broadcast speech' }, firstUse: { zh: '8月14日录制，8月15日中午广播。', en: 'Recorded 14 August and broadcast at noon on 15 August.' }, recording: { zh: '宫内厅保存原盘，2015年公开数字化材料；数字化日期不是录音日期。', en: 'The Imperial Household Agency preserves the discs; 2015 digitisation is not the recording date.' },
    languageAndType: { zh: '日语文言体；国家广播讲话、历史声音档案。', en: 'Formal Japanese; state speech and historical audio document.' }, circulation: { zh: '通过全国广播传达接受投降条件的决定，各地接收和理解并不一致。', en: 'Broadcast acceptance of surrender terms; reception varied across territories.' }, relation: { zh: '事件本身的原始声音证据，不套用歌曲关系1—5。', en: 'Primary sound evidence of the event; the song relation scheme does not apply.' }, status: 'A', statusNote: { zh: '1945年原始讲话录音，分类为历史广播。', en: 'Original 1945 speech recording, classified as historical broadcast.' }, sourceIds: ['S35', 'S36'],
  },
]

function makeSource(
  id: string,
  group: ResearchSource['group'],
  institution: string,
  title: string,
  kindZh: string,
  supportZh: string,
  url: string,
): ResearchSource {
  return {
    id,
    group,
    institution,
    title,
    kind: { zh: kindZh, en: kindZh },
    support: { zh: supportZh, en: supportZh },
    url,
  }
}

export const researchSources: ResearchSource[] = [
  makeSource('S01', 'east-asia', 'U.S. Department of State, Office of the Historian', 'The Mukden Incident of 1931 and the Stimson Doctrine', '政府历史综述', '1931年9月18日事件、日本军事扩张与不承认政策。', 'https://history.state.gov/milestones/1921-1936/mukden-incident'),
  makeSource('S02', 'east-asia', 'U.S. Department of State', 'Foreign Relations of the United States, 1934: Control of Manchukuo', '同期外交文件', '“满洲国”行政与军事体系受到日本控制，以及法理与实际控制的区别。', 'https://history.state.gov/historicaldocuments/frus1934v03/d235'),
  makeSource('S03', 'east-asia', 'United States Holocaust Memorial Museum', 'World War II in the Pacific', '国家博物馆历史综述', '日本侵占满洲、建立受控制的傀儡政权及太平洋战争基本框架。', 'https://encyclopedia.ushmm.org/content/en/article/world-war-ii-in-the-pacific'),
  makeSource('S04', 'east-asia', 'Chang-Tai Hung / Modern Asian Studies', 'The Politics of Songs: Myths and Symbols in the Chinese Communist War Music, 1937–1949', '同行评审论文', '《义勇军进行曲》的电影来源、1937年后传播与政治使用。', 'https://www.cambridge.org/core/journals/modern-asian-studies/article/abs/politics-of-songs-myths-and-symbols-in-the-chinese-communist-war-music-19371949/91495DF3497BA33F551FC0234C599B69'),
  makeSource('S05', 'east-asia', 'Laura De Giorgi / Ca’ Foscari University of Venice', 'Communication Technology and Mass Propaganda in Republican China', '学术论文机构记录', '国民政府广播政策、城市覆盖限制与未能形成完全垄断。', 'https://iris.unive.it/handle/10278/43686'),
  makeSource('S06', 'east-asia', '中华人民共和国国防部资料页', '《游击队歌》相关史料', '官方史料整理', '贺绿汀1937年冬创作及1938年初演出时间线。', 'https://www.mod.gov.cn/gfbw/gfjy_index/js_214151/4876829.html'),
  makeSource('S07', 'east-asia', 'China Culture', 'Yellow River Cantata 80th Anniversary', '公共文化机构综述', '冼星海、光未然和1939年4月13日延安首演。', 'https://en.chinaculture.org/2019-04/11/content_1375523.htm'),
  makeSource('S08', 'east-asia', 'Japan Center for Asian Historical Records', 'Radio broadcasting and wartime mobilization', '国家档案机构专题', 'NHK组织、1937年后收听户增长及广播政策地位。', 'https://www.jacar.go.jp/exhibition/shuhou/topics/topics01_01.html'),
  makeSource('S09', 'east-asia', '日本国立国会图书馆', '内閣情報部選定：愛国行進曲', '国家图书馆唱片目录', '作品、作曲者、帝国海军军乐队、Polydor 2573及数字化信息。', 'https://ndlsearch.ndl.go.jp/books/R100000039-I8273150'),
  makeSource('S10', 'east-asia', '日本国立国会图书馆 Reference Collaborative Database', '《愛国行進曲》征集与报刊调查', '国家图书馆参考咨询', '1937年官方征集、公开演奏报道与1938年唱片发行。', 'https://crd.ndl.go.jp/reference/entry/index.php?id=1000237663&page=ref_view'),
  makeSource('S11', 'europe', 'Treccani', 'Fascismo', '权威百科与学术综述', '法西斯政权及1935—1936年埃塞俄比亚战争背景。', 'https://www.treccani.it/enciclopedia/fascismo_%28Enciclopedia-delle-scienze-sociali%29/'),
  makeSource('S12', 'europe', 'Canzone Italiana / ICBSA', 'Faccetta nera', '国家声音档案平台', '词曲作者、Carlo Buti、1935年唱片与殖民战争语境。', 'https://canzoneitaliana.it/en/canzone/faccetta-nera-testo-ufficiale-dello-spartito-en/'),
  makeSource('S13', 'europe', 'United States Holocaust Memorial Museum', 'Culture in the Third Reich: Overview', '国家博物馆历史综述', '帝国文化院体系及对犹太从业者的排斥。', 'https://encyclopedia.ushmm.org/content/en/article/culture-in-the-third-reich-overview'),
  makeSource('S14', 'europe', 'Deutsches Historisches Museum', 'Reichskulturkammer', '国家博物馆专题', '帝国文化院、帝国音乐院的组织与职业控制。', 'https://www.dhm.de/lemo/kapitel/ns-regime/kunst-und-kultur/reichskulturkammer'),
  makeSource('S15', 'europe', 'Imperial War Museums', 'The Song That Ruled the Airwaves During the Second World War', '国家战争博物馆综述', '《Lili Marleen》的诗、谱曲、1939年录音与1941年广播传播。', 'https://www.iwm.org.uk/history/the-song-that-ruled-the-airwaves-during-the-second-world-war'),
  makeSource('S16', 'europe', 'Musée de la Résistance en ligne', 'La mémoire immatérielle: Le Chant des partisans', '博物馆专题', 'BBC识别信号、1943年演唱与地下印刷传播。', 'https://museedelaresistanceenligne.org/media8685-La-mmoire-immatrielle-le-iChant-des-partisans-i'),
  makeSource('S17', 'europe', 'Institut national de l’audiovisuel', '85 ans de radio', '国家视听档案馆说明', 'Radio Paris、维希、BBC法语与自由法国广播并存。', 'https://www.ina.fr/institut-national-audiovisuel/collections-audiovisuelles/85-ans-de-radio'),
  makeSource('S18', 'europe', 'Imperial War Museums', 'Popular Pastimes and Entertainment in the Second World War', '国家战争博物馆综述', 'BBC、Forces Programme、Vera Lynn、ENSA与日常娱乐。', 'https://www.iwm.org.uk/history/popular-pastimes-and-entertainment-in-the-second-world-war'),
  makeSource('S19', 'europe', 'United States Holocaust Memorial Museum', 'World War II: Key Dates', '国家博物馆历史时间线', '欧洲战争、法国战败与德国进攻苏联的基本日期。', 'https://encyclopedia.ushmm.org/content/en/article/world-war-ii-key-dates'),
  makeSource('S20', 'europe', 'Imperial War Museums', 'What You Need To Know About VE Day', '国家战争博物馆综述', '1945年投降程序、BBC公告与街头庆祝。', 'https://www.iwm.org.uk/history/what-you-need-to-know-about-ve-day'),
  makeSource('S21', 'europe', 'BBC Programme Index', 'Forces Programme schedule, 27 September 1941', '广播节目表', '战时部队广播的栏目、播出日期与时间。', 'https://genome.ch.bbc.co.uk/schedules/service_forces_programme/1941-09-27'),
  makeSource('S22', 'europe', 'Clare Church / Women’s History Review', 'The cultural legacy of We’ll Meet Again', '同行评审论文与唱片引用', '1939年9月28日Vera Lynn录音、BBC传播与战后记忆。', 'https://www.tandfonline.com/doi/full/10.1080/09612025.2024.2415738'),
  makeSource('S23', 'europe', 'Bibliothèque nationale de France', 'J’attendrai / Rina Ketty catalogue record', '国家图书馆唱片目录', '作品、词曲、演唱者与1938原录音/1976再版区分。', 'https://catalogue.bnf.fr/ark%3A/12148/cb37869218r'),
  makeSource('S24', 'europe', 'Florence Dartois / INA', 'Playlist des succès de l’été 1944', '国家视听档案馆策展文章', '《Fleur de Paris》词曲、早期演唱与现存影像年代。', 'https://www.ina.fr/ina-eclaire-actu/chanson-liberation-1944-france-paris-resistance-bal-vin-guiguette-amour'),
  makeSource('S25', 'europe', 'Library of Congress', 'Internal Workings of the Soviet Union: Culture', '国家图书馆档案展', '苏联艺术组织、社会主义现实主义与战争文化政策。', 'https://www.loc.gov/exhibits/archives/intn.html'),
  makeSource('S26', 'europe', 'Dmitri Shostakovich Archive', 'Symphony No. 7', '作曲家专业档案', '1941年创作及1942年古比雪夫、列宁格勒和海外演出。', 'https://shostakovich.ru/152ru'),
  makeSource('S27', 'europe', 'Dmitri Shostakovich Archive', 'Life: 1941', '作曲家专业档案', '作曲家在列宁格勒、疏散与第七交响曲写作时间线。', 'https://www.shostakovich.ru/ru/life/1941/'),
  makeSource('S28', 'europe', 'Federal Archival Agency of Russia', 'Victory: 80 Years archival catalogue', '国家档案目录', '《神圣的战争》1941年6月26日演出及战时唱片材料。', 'https://archives.gov.ru/sites/default/files/2025_katalog-pobeda-80_en.pdf'),
  makeSource('S29', 'methods', 'U.S. National Archives', 'Day of Infamy Speech', '原始政府文件与档案说明', '珍珠港袭击与美国宣战时间线。', 'https://www.archives.gov/milestone-documents/day-of-infamy-speech'),
  makeSource('S30', 'methods', 'Discography of American Historical Recordings / UCSB', 'DLA 2326—Boogie Woogie Bugle Boy', '大学唱片目录', '1941年录制地点、表演者、唱片号与矩阵号。', 'https://adp.library.ucsb.edu/index.php/matrix/detail/2000268749/DLA_2326-Boogie_woogie_bugle_boy'),
  makeSource('S31', 'methods', 'Library of Congress', 'National Recording Registry essays: V-Disc materials', '国家图书馆录音保护资料', 'V-Disc军方用途与特殊录制安排。', 'https://www.loc.gov/programs/national-recording-preservation-board/recording-registry/descriptions-and-essays/'),
  makeSource('S32', 'europe', 'Associazione Nazionale Partigiani d’Italia', 'Intervista a due partigiani del comandante Felice Cascione', '抵抗组织档案与访谈', 'Cascione、1943年改写与《Fischia il vento》早期传播。', 'https://www.anpi.it/intervista-due-partigiani-del-comandante-felice-cascione-lautore-di-fischia-il-vento'),
  makeSource('S33', 'europe', 'Patria Indipendente / ANPI', 'Cantavano i partigiani', '机构历史综述', '意大利游击队歌曲的口传、地区差异与《Fischia il vento》。', 'https://www.patriaindipendente.it/terza-pagina/pentagramma/cantavano-i-partigiani/'),
  makeSource('S34', 'europe', 'Treccani', 'La vera storia di Bella ciao', '权威文化史文章', '《Bella ciao》的战后传播及不能倒写为普遍战时歌曲。', 'https://www.treccani.it/magazine/atlante/cultura/La_vera_storia_di_Bella_ciao.html'),
  makeSource('S35', 'east-asia', 'National Diet Library of Japan', 'Imperial Rescript of the Termination of the War', '国家图书馆原始档案说明', '1945年8月14日录音、8月15日广播与原盘数字化。', 'https://www.ndl.go.jp/constitution/e/shiryo/01/017shoshi.html'),
  makeSource('S36', 'methods', 'U.S. National Archives', 'Surrender of Japan', '原始政府文件', '1945年9月2日正式投降书签署与签署方。', 'https://www.archives.gov/milestone-documents/surrender-of-japan'),
  makeSource('S37', 'europe', 'Deutsches Historisches Museum', 'Volksempfänger', '国家博物馆专题', '德国家庭收音机覆盖、新闻与娱乐并存。', 'https://www.dhm.de/lemo/kapitel/ns-regime/alltagsleben/volksempfaenger'),
  makeSource('S38', 'europe', 'Deutsches Historisches Museum', 'Das Wunschkonzert', '国家博物馆节目史', '1939年点播音乐会、士兵家庭联系与全国广播。', 'https://www.dhm.de/zeughauskino/vorfuehrung/das-wunschkonzert-6461/'),
  makeSource('S39', 'europe', 'Treccani', 'Musica', '权威百科与学术综述', 'EIAR、法西斯时期广播、流行与地方音乐并存。', 'https://www.treccani.it/enciclopedia/musica_res-deb7d989-87ea-11dc-8e9d-0016357eee51_%28Enciclopedia-Italiana%29/'),
  makeSource('S40', 'methods', 'Library of Congress', 'Joint Army and Navy Committee on Welfare and Recreation, Sub-Committee on Music Papers', '国家图书馆档案检索工具', '军方乐谱、乐队、乐器、播放设备和版权工作。', 'https://findingaids.loc.gov/repositories/15/resources/1157'),
  makeSource('S41', 'east-asia', 'Szu-wei Chen / Popular Music', 'The rise and generic features of Shanghai popular songs', '同行评审论文', '1930—1940年代上海歌曲经唱片、广播和电影传播。', 'https://www.cambridge.org/core/journals/popular-music/article/abs/rise-and-generic-features-of-shanghai-popular-songs-in-the-1930s-and-1940s/6E76F45DF2535F1BA02680EB76A131DA'),
  makeSource('S42', 'east-asia', 'Suguru Umemura / Asian Studies', 'The CCP’s Radio Broadcasting during the Anti-Japanese War and the Civil War', '同行评审论文', '1940年中共广播开播、技术与受众限制及军事用途。', 'https://www.jstage.jst.go.jp/article/asianstudies/54/1/54_3/_article/-char/en'),
  makeSource('S43', 'east-asia', 'Japan Center for Asian Historical Records', 'Radio Calisthenics Under Colonial Rule', '国家档案机构专题', '日本本土、殖民地与占领区广播治理的区别。', 'https://www.jacar.go.jp/english/exhibition/glossary_en/tochikiko-henten/qa/qa08.html'),
  makeSource('S44', 'east-asia', 'Yasutaka Takeda / 日本音楽学会', '太平洋戦争期の音楽放送の変容と番組制作者', '同行评审论文与国家图书馆目录', '太平洋战争期NHK音乐节目的编排变化。', 'https://ndlsearch.ndl.go.jp/en/books/R100000136-I1390860764354784640'),
  makeSource('S45', 'europe', 'Deutsches Historisches Museum', 'Alltagsleben und Jugendopposition', '国家博物馆历史综述', '娱乐音乐、Swingjugend及对不合规范青年的镇压。', 'https://www.dhm.de/lemo/kapitel/ns-regime/alltagsleben'),
  makeSource('S46', 'europe', 'Marek Korczynski and Keith Jones / Popular Music', 'Instrumental music? The social origins of broadcast music in British factories', '同行评审论文', 'BBC Music While You Work、工厂广播和生产率目标。', 'https://www.cambridge.org/core/journals/popular-music/article/abs/instrumental-music-the-social-origins-of-broadcast-music-in-british-factories/51CBE60F0C5C29B7D08726EAA2CADF7A'),
  makeSource('S47', 'europe', 'Mémorial de la Shoah', 'La musique au pas. Être musicien sous l’Occupation', '纪念馆研究出版说明', '德占法国文化控制、反犹排斥与音乐家处境。', 'https://billetterie.memorialdelashoah.org/fr/products/la-musique-au-pas-etre-musicien-sous-l-occupation'),
  makeSource('S48', 'methods', 'U.S. National Archives', 'The Great Migration (1910–1970)', '国家档案馆研究指南', '战时工业迁移、种族歧视及美国地区差异。', 'https://www.archives.gov/research/african-americans/migrations/great-migration'),
  makeSource('S49', 'methods', 'U.S. National Archives', 'Records of the Office of War Information, RG 208', '国家档案馆检索工具', 'OWI于1942年建立及其国内外广播与信息项目。', 'https://www.archives.gov/research/guide-fed-records/groups/208.html'),
  makeSource('S50', 'methods', 'National Museum of the United States Air Force', 'Maj. Glenn Miller Army Air Force Band', '国家军事博物馆资料', 'Miller入伍、赴英、军队演出和广播。', 'https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/196150/AFmuseum/maj-glenn-miller-army-air-force-band/'),
]

export const methodSections: MethodSection[] = [
  {
    id: 'inventory', title: { zh: '当前材料状态', en: 'Current material status' },
    summary: { zh: '365段音频是实验库存，不是完成史料审核的训练集。', en: 'The 365 audio segments form an experimental inventory, not a fully verified historical dataset.' },
    points: [
      { zh: '库存含365段WAV及元数据，来自51个作品/录音名称和24个网络来源页面；切片数不等于歌曲或唱片数。', en: 'The inventory has 365 WAV segments from 51 named works and 24 source pages; segment count is not work count.' },
      { zh: '旧“国家”字段把录音地点、表演者身份、语言、控制权与现代分类混在一起，不能解释为历史代表性。', en: 'The old country field mixes location, identity, language, control and modern grouping.' },
      { zh: '第一轮审计发现战后作品、现代翻唱、播客误匹配及只有上传标题的文件，公开统计前必须逐曲审核。', en: 'Initial review found postwar works, modern covers, podcast mismatches and upload-only dating.' },
    ],
  },
  {
    id: 'selection', title: { zh: '时间与版本筛选', en: 'Date and version screening' },
    summary: { zh: '作品属于1931—1945并不自动意味着当前音频是战时原声。', en: 'A work from 1931–1945 does not make the current audio a wartime recording.' },
    points: [
      { zh: '作品须在1945年以前创作，或有明确证据证明在1931—1945年间被演出、广播、录制或使用。', en: 'A work must predate 1946 or have documented use during 1931–1945.' },
      { zh: '表演者、录制年份和载体须由馆藏、唱片目录、矩阵记录或同期节目单确认。', en: 'Performer, recording date and carrier require archive, discography, matrix or programme evidence.' },
      { zh: '战后重录标为postwar_rerecording；录音年份不明的材料进入待核验区。', en: 'Postwar remakes receive a separate label and undated audio remains pending.' },
    ],
  },
  {
    id: 'evidence', title: { zh: '来源优先级', en: 'Source hierarchy' },
    summary: { zh: '平台上传页只能提供线索，不能单独证明版本。', en: 'Platform uploads are leads, not sufficient version evidence.' },
    points: [
      { zh: '最高优先：国家档案馆、图书馆、广播档案、博物馆和大学唱片目录中的编号记录。', en: 'Highest priority: numbered records in archives, libraries, broadcast collections, museums and university discographies.' },
      { zh: '可用但需互证：学术数字馆藏、策展数据库、同期节目单与目录指向的再版。', en: 'Usable with corroboration: scholarly collections, curated databases, schedules and documented reissues.' },
      { zh: '不采用：只有文件名年份、无表演者、无录音日、内容与标题不符或现代循环音频。', en: 'Reject filename-only dates, missing performers, undated audio, mismatches and modern loops.' },
    ],
  },
  {
    id: 'processing', title: { zh: '清理与切分', en: 'Cleaning and segmentation' },
    summary: { zh: '处理过程应可复现，并保留母文件和录音级身份。', en: 'Processing must be reproducible and preserve masters and recording-level identity.' },
    points: [
      { zh: '保存原始文件、来源URL、下载日期和校验值，不覆盖母文件。', en: 'Preserve original files, URLs, download dates and checksums.' },
      { zh: '只做格式统一、声道转换、峰值保护和切分，不以不可逆处理制造“老唱片感”。', en: 'Use format normalisation and segmentation, not irreversible ageing effects.' },
      { zh: '训练、验证与测试按录音级划分，同一唱片切片不能跨集合。', en: 'Split at recording level so segments from one disc never leak across sets.' },
    ],
  },
  {
    id: 'metadata', title: { zh: '史实与研究判断', en: 'Facts and researcher judgements' },
    summary: { zh: '目录事实和听觉判断必须使用不同字段。', en: 'Catalogued facts and listening judgements require separate fields.' },
    points: [
      { zh: '史实字段包括标题、词曲作者、表演者、录音日期、唱片号、语言、使用记录和许可。', en: 'Fact fields include titles, creators, performers, dates, catalogue numbers, language, use and rights.' },
      { zh: '情绪、速度感、编制、音色、宣传强度和“代表性”属于研究者判断，需记录标注者、依据和置信度。', en: 'Mood, tempo, instrumentation, timbre, propaganda intensity and representativeness are judgements with provenance and confidence.' },
      { zh: '旧country字段应拆成作品来源、表演者所属、录音地、发行地、当年控制与研究分组。', en: 'The old country field should split origin, affiliation, recording, issue, historical control and research grouping.' },
    ],
  },
  {
    id: 'training', title: { zh: '训练记录的矛盾', en: 'Conflicting training records' },
    summary: { zh: '现存文件对实际样本数与训练参数不一致，模型不能被描述成已完成史料核验。', en: 'Existing records disagree on sample count and parameters, so the model is not a fully verified historical model.' },
    points: [
      { zh: '一份模型卡记录365个样本、100个epoch和9,200步；另一份摘要记录49个清理片段、200个epoch和5,000步。', en: 'One model card reports 365 samples, 100 epochs and 9,200 steps; another reports 49 clips, 200 epochs and 5,000 steps.' },
      { zh: '缺少正式评估、随机种子、优化器细节、硬件、逐轨来源台账和权利判断。', en: 'Formal evaluation, seed, optimiser details, hardware, track ledger and rights review are missing.' },
      { zh: '更准确的公开表述是：当前原型使用仍在版本和版权审核中的音乐片段微调。', en: 'Accurate public wording: the prototype uses music clips still under version and rights review.' },
    ],
  },
  {
    id: 'bias', title: { zh: '数据缺口与偏差', en: 'Gaps and bias' },
    summary: { zh: '存世和上线材料受到机构权力、战争损毁、语言、经费与版权共同影响。', en: 'Survival and digitisation reflect institutions, destruction, language, funding and rights.' },
    points: [
      { zh: '美国和日本切片较多不意味着其音乐更具历史代表性。', en: 'More U.S. and Japanese segments do not mean greater representativeness.' },
      { zh: '国家机构与商业唱片更易保存，乡村口传、少数群体、女性日常活动和被迫迁移者更少。', en: 'Institutional and commercial records survive more readily than rural, minority, women’s and displaced voices.' },
      { zh: '模型输出只反映所选样本及其偏差，不能代表某国或1931—1945全球音乐。', en: 'Model output reflects selected samples and cannot represent a country or global music.' },
    ],
  },
  {
    id: 'rights', title: { zh: '版权与可复现记录', en: 'Rights and reproducibility' },
    summary: { zh: '可以在线收听不等于可以下载、训练、重新发布或生成。', en: 'Online listening does not imply permission to download, train, republish or generate.' },
    points: [
      { zh: '逐份记录作品权、表演权、录音制品权、数字化条款、平台许可和法域。', en: 'Track composition, performance, recording, digitisation, platform and jurisdictional rights separately.' },
      { zh: '每次发布保存版本号、纳入/排除表、校验值、脚本、字段说明、数据划分、训练日志和评估。', en: 'Each release keeps version, inclusion list, hashes, scripts, schema, splits, logs and evaluation.' },
      { zh: '权利不明的文件只作研究线索，不公开播放，也不进入可发布训练集。', en: 'Unclear-rights files remain research leads and are neither streamed nor included in a releasable dataset.' },
    ],
  },
]

export function getSourceById(sourceId: string) {
  return researchSources.find((source) => source.id === sourceId) ?? null
}

export function getLocalized(value: LocalizedText, language: 'zh' | 'en') {
  return value[language]
}
