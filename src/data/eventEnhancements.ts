import type { EventImage, HistoricEvent, RelatedSong } from '@/data/ww2MusicAtlas'
import { publicAssetPath } from '@/lib/publicAssets'

type EventEnhancement = Pick<
  HistoricEvent,
  'longDescriptionZh' | 'longDescriptionEn' | 'musicImpactZh' | 'musicImpactEn' | 'relatedSongs' | 'image'
>

function image(input: Omit<EventImage, 'generated'>): EventImage {
  return {
    ...input,
    src: publicAssetPath(input.src),
    captionZh: input.captionZh ?? `${input.altZh}。我用这张图帮助定位事件发生的地点和媒介环境，出处与授权见来源链接。`,
    captionEn:
      input.captionEn ??
      `${input.altEn}. I use this image to place the event and its media setting; source and rights are linked below.`,
    generated: false,
  }
}

function song(input: RelatedSong): RelatedSong {
  const localAudio = eventAudioByTitle[input.title]
  const studyNote = songStudyNotes[input.title]
  const streamUrl = input.streamUrl ?? localAudio?.streamUrl

  return {
    ...input,
    sourceUrl: localAudio?.sourceUrl ?? input.sourceUrl,
    contextZh: input.contextZh ?? studyNote?.contextZh ?? input.noteZh,
    contextEn: input.contextEn ?? studyNote?.contextEn ?? input.noteEn,
    eventRelationZh: input.eventRelationZh ?? studyNote?.eventRelationZh ?? input.noteZh,
    eventRelationEn: input.eventRelationEn ?? studyNote?.eventRelationEn ?? input.noteEn,
    listeningGuideZh: input.listeningGuideZh ?? studyNote?.listeningGuideZh ?? '听辨旋律、节奏、编制和演唱方式如何把历史情绪组织成可传播的声音。',
    listeningGuideEn:
      input.listeningGuideEn ??
      studyNote?.listeningGuideEn ??
      'Listen for how melody, rhythm, ensemble, and vocal delivery organize historical emotion into a circulating sound.',
    streamUrl: streamUrl ? publicAssetPath(streamUrl) : undefined,
    rightsLabel: localAudio?.rightsLabel ?? input.rightsLabel ?? 'Research reference only',
    rightsUrl: input.rightsUrl ?? localAudio?.rightsUrl,
    sensitivity: input.sensitivity ?? localAudio?.sensitivity ?? studyNote?.sensitivity ?? 'neutral',
    audioCredit: input.audioCredit ?? localAudio?.audioCredit,
  }
}

const commonsLicense = 'https://commons.wikimedia.org/wiki/Commons:Licensing'
const archiveRights = 'https://help.archive.org/help/rights/'
const researchUseRightsLabel = 'Internet Archive local playback; research-use rights unverified'

const eventAudioByTitle: Record<
  string,
  Pick<RelatedSong, 'streamUrl' | 'rightsLabel' | 'rightsUrl' | 'sensitivity' | 'audioCredit'> & { sourceUrl?: string }
> = {
  'March of the Volunteers': {
    streamUrl: '/audio/events/march-of-the-volunteers.mp3',
    sourceUrl: 'https://archive.org/details/us-navy-band-national-anthems-public-domain',
    rightsLabel: 'U.S. Navy Band local playback; public-domain U.S. government recording',
    rightsUrl: 'https://www.navyband.navy.mil/national-anthems/',
    sensitivity: 'resistance',
    audioCredit: 'Internet Archive item us-navy-band-national-anthems-public-domain, Current/China.mp3; modern instrumental anthem recording, not a 1935 film-song recording',
  },
  'Song of the Great Wall': {
    streamUrl: '/audio/events/song-of-the-great-wall.mp3',
    sourceUrl: 'https://archive.org/details/lp_popular-chinese-classics-vol-2_hong-kong-philharmonic-orchestra-kennet',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'resistance',
    audioCredit: 'Internet Archive LP Popular Chinese Classics Vol. 2; orchestral concert version used as a historical-near educational recording',
  },
  'Aikoku Koshinkyoku': {
    streamUrl: '/audio/events/aikoku-koshinkyoku.mp3',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'sensitive-context',
    audioCredit: 'Internet Archive item TaiatariSeishin',
  },
  'Mack the Knife': {
    streamUrl: '/audio/events/mack-the-knife.mp3',
    sourceUrl: 'https://archive.org/details/kurt-weill-bertolt-brecht-the-original-threepenny-opera-die-dreigroschenoper-deu',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    audioCredit: 'Internet Archive item The Original Threepenny Opera, track Moritat von Mackie Messer',
  },
  'Lili Marleen': {
    streamUrl: '/audio/events/lili-marleen.mp3',
    sourceUrl: 'https://archive.org/details/78_unter-der-laterne-lili-marleen-lied-eines-jungen-wachtpostens_lale-andersen-han_gbia0125670a',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    audioCredit: 'Internet Archive 78 rpm transfer, Lale Andersen, Unter der Laterne / Lili Marleen',
  },
  'Faccetta Nera': {
    streamUrl: '/audio/events/faccetta-nera.mp3',
    sourceUrl: 'https://archive.org/details/banda-polydor-faccetta-nera-marcia-brunswick-6275-gr-58320',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'sensitive-context',
    audioCredit: 'Internet Archive 78 rpm transfer, Banda Polydor - Faccetta Nera (Marcia); sensitive colonial propaganda material',
  },
  'Bella Ciao': {
    streamUrl: '/audio/events/bella-ciao.mp3',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'resistance',
    audioCredit: 'Internet Archive item bella-ciao_202210',
  },
  'Horst-Wessel-Lied': {
    streamUrl: '/audio/events/horst-wessel-lied.mp3',
    sourceUrl: 'https://archive.org/details/lp_war-songs-of-the-third-reich-historical-ge_unknown-artist',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'sensitive-context',
    audioCredit: 'Internet Archive LP War Songs of the Third Reich, historical record; sensitive Nazi ceremonial material',
  },
  "We'll Meet Again": {
    streamUrl:
      "https://archive.org/download/78_well-meet-again_vera-lynn-members-of-her-majestys-armed-forces-parker-charles-rol_gbia0276753a/WE%27LL%20MEET%20AGAIN%20-%20VERA%20LYNN%20-%20Members%20of%20Her%20Majesty%27s%20Armed%20Forces.mp3",
    sourceUrl: 'https://archive.org/details/78_well-meet-again_vera-lynn-members-of-her-majestys-armed-forces-parker-charles-rol_gbia0276753a',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'patriotic',
    audioCredit: "Internet Archive 78 rpm transfer, Vera Lynn with Members of Her Majesty's Armed Forces; later same-song educational playback",
  },
  'Katyusha': {
    streamUrl: '/audio/events/katyusha.mp3',
    sourceUrl: 'https://archive.org/details/78_katiusha_v.-batischev-p.-mikhailov-v.-tiutiunik-state-jazz-orch.-u.-s.-s.-r.-m.-bla_gbia0007524a',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'patriotic',
    audioCredit: 'Internet Archive 78 rpm transfer, Katiusha, State Jazz Orchestra of the U.S.S.R., 1939',
  },
  'Boogie Woogie Bugle Boy': {
    streamUrl: '/audio/events/boogie-woogie-bugle-boy.mp3',
    sourceUrl: 'https://archive.org/details/78_boogie-woogie-bugle-boy-woody-herman-his-orchestra-vocal-chorus-by-woody',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'patriotic',
    audioCredit: 'Internet Archive 78 rpm transfer, Woody Herman & His Orchestra; same-song historical-near version rather than the Andrews Sisters recording',
  },
  'Coming in on a Wing and a Prayer': {
    streamUrl: '/audio/events/coming-in-on-a-wing-and-a-prayer.mp3',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'patriotic',
    audioCredit: 'Internet Archive V-Discs 1-99',
  },
  'The Blue Scarf': {
    streamUrl: '/audio/events/the-blue-scarf.mp3',
    sourceUrl: 'https://archive.org/details/klavdija-shuljzhenko-pesni-o-ljubi_202601',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'patriotic',
    audioCredit: 'Internet Archive item Klavdiya Shulzhenko - Pesni o lyubvi, track Siniy Platochek; later recording used for educational identification of the wartime song',
  },
  'Dark Night': {
    streamUrl: '/audio/events/dark-night.mp3',
    sourceUrl: 'https://archive.org/details/20210814_20210814_0956',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'patriotic',
    audioCredit: 'Internet Archive Mark Bernes collection, track Tyomnaya noch; archive item used as historical-near playback',
  },
  'Fischia il vento': {
    streamUrl: '/audio/events/fischia-il-vento.ogg',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'resistance',
    audioCredit: 'Internet Archive item ror-katyusha-fischiailvento-x4ab8sev',
  },
  'La Vie en rose': {
    streamUrl: '/audio/events/la-vie-en-rose.mp3',
    sourceUrl: 'https://archive.org/details/78_la-vie-en-rose_edith-piaf-louiguy-guy-luypaerts_gbia0100798a_item',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    audioCredit: 'Internet Archive 78 rpm transfer, Edith Piaf, La vie en rose',
  },
  'Fleur de Paris': {
    streamUrl: '/audio/events/fleur-de-paris.mp3',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    audioCredit: 'Internet Archive LP Favorite Music of France',
  },
  'God Bless America': {
    streamUrl: '/audio/events/god-bless-america.mp3',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'patriotic',
    audioCredit: 'Internet Archive LP World War II Songs in Hi-Fi',
  },
  'Ringo no Uta': {
    streamUrl: '/audio/events/ringo-no-uta.mp3',
    sourceUrl: 'https://archive.org/details/78_title-in-japanese_gbia0035328a',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    audioCredit: 'Internet Archive 78 rpm transfer, Ringo No Uta / The Song of the Apple',
  },
  'Tokyo Boogie-Woogie': {
    streamUrl: '/audio/events/tokyo-boogie-woogie.mp3',
    sourceUrl: 'https://archive.org/details/78_tokyo-boogie-woogie_gbia0543885b',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    audioCredit: 'Internet Archive 78 rpm transfer, Tokyo Boogie Woogie',
  },
  'Nature Boy': {
    streamUrl: '/audio/events/nature-boy.mp3',
    sourceUrl: 'https://archive.org/details/78_0262-Nature-boy',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    audioCredit: 'Internet Archive 78 rpm transfer, Raquel Rastenni / Kai Mortensen; same-song historical-near version rather than Nat King Cole recording',
  },
  'Ornithology': {
    streamUrl: '/audio/events/ornithology.mp3',
    sourceUrl: 'https://archive.org/details/78_orinthology_charlie-parker-septet-charlie-parker-lucky-thompson-miles-davis-dodo-ma_gbia0344030b',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    audioCredit: 'Internet Archive 78 rpm transfer, Charlie Parker Septet with Miles Davis, Ornithology; used as the bebop evidence item replacing Move because no stable downloadable Move source was found',
  },
  'J’attendrai': {
    streamUrl: '/audio/events/jattendrai.mp3',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    audioCredit: 'Internet Archive item ka-87-gisele-mackenzie-jattendrai',
  },
  'Praise the Lord and Pass the Ammunition': {
    streamUrl: '/audio/events/praise-the-lord-pass-the-ammunition.mp3',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'patriotic',
    audioCredit: 'Internet Archive LP World War II Songs in Hi-Fi',
  },
  'Sacred War': {
    streamUrl: '/audio/events/sacred-war.mp3',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'patriotic',
    audioCredit: 'Internet Archive LP Russian Songs',
  },
  'Song of the Guerrillas': {
    streamUrl: '/audio/events/song-of-guerrillas.mp3',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'resistance',
    audioCredit: 'Internet Archive item fry188_yahoo_201504',
  },
  'U-Boot-Lied': {
    streamUrl: '/audio/events/u-boot-lied.mp3',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'sensitive-context',
    audioCredit: 'Internet Archive LP War Songs of the Third Reich, historical record',
  },
  'When the Lights Go On Again': {
    streamUrl: '/audio/events/when-the-lights-go-on-again.mp3',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'patriotic',
    audioCredit: 'Internet Archive item Big Bands: World War II',
  },
  'Yellow River Cantata': {
    streamUrl: '/audio/events/yellow-river-defend.mp3',
    rightsLabel: researchUseRightsLabel,
    rightsUrl: archiveRights,
    sensitivity: 'resistance',
    audioCredit: 'Internet Archive LP Yellow River Cantata, Defend the Yellow River movement',
  },
}

const songStudyNotes: Record<
  string,
  Partial<Pick<RelatedSong, 'contextZh' | 'contextEn' | 'eventRelationZh' | 'eventRelationEn' | 'listeningGuideZh' | 'listeningGuideEn' | 'sensitivity'>>
> = {
  'March of the Volunteers': {
    contextZh: '原为电影歌曲，后来在抗战动员、公共集会和国家象征之间不断转义。',
    contextEn: 'Originally a film song, it moved through wartime mobilization, public assembly, and later state symbolism.',
    eventRelationZh: '它把危机感压缩成短促、集体化的进行语汇，适合解释中国救亡音乐的制度化起点。',
    eventRelationEn: 'It compresses crisis into a concise collective march idiom, making it a useful entry point for Chinese salvation music.',
    listeningGuideZh: '注意开头的上行动机、齐唱式力量和近似口号的句法。',
    listeningGuideEn: 'Listen for the rising motive, mass-vocal force, and slogan-like phrasing.',
    sensitivity: 'resistance',
  },
  'Song of the Great Wall': {
    contextZh: '以长城为地理和民族边界意象，把救亡叙事变成可合唱、可巡演的歌曲文本。',
    contextEn: 'Uses the Great Wall as both geography and national boundary, turning salvation politics into choral repertoire.',
    eventRelationZh: '它说明九一八之后的音乐不只记录事件，也把地图、边疆和民族共同体重新编码。',
    eventRelationEn: 'It shows how post-Mukden music recoded maps, frontiers, and national community rather than only documenting events.',
    listeningGuideZh: '注意宽广旋律和合唱式语气如何放大“边界”意象。',
    listeningGuideEn: 'Listen for broad melodic contours and choral rhetoric that enlarge the border image.',
    sensitivity: 'resistance',
  },
  'Aikoku Koshinkyoku': {
    contextZh: '日本战时国策歌谣的代表之一，体现国家、广播和群众歌唱之间的组织关系。',
    contextEn: 'A representative Japanese wartime policy song, showing the organized relationship between state, radio, and mass singing.',
    eventRelationZh: '用于对照日本在亚洲战争扩展中如何把流行旋律纳入国家动员。',
    eventRelationEn: 'It helps show how Japan folded popular melody into state mobilization as war expanded in Asia.',
    listeningGuideZh: '注意整齐节拍、明亮旋律和集体推进感；页面仅作历史研究样本呈现。',
    listeningGuideEn: 'Listen for regular pulse, bright melody, and collective forward drive; presented here only as a historical study sample.',
    sensitivity: 'sensitive-context',
  },
  'Mack the Knife': {
    contextZh: '魏玛剧场歌曲代表，带有都市讽刺、爵士化节奏和反英雄叙事。',
    contextEn: 'A landmark Weimar theatre song with urban satire, jazz-inflected rhythm, and anti-heroic narration.',
    eventRelationZh: '它体现纳粹文化制度试图排除的现代主义、左翼剧场和都市娱乐传统。',
    eventRelationEn: 'It marks the modernist, left-theatre, and urban entertainment traditions targeted by Nazi cultural policy.',
    listeningGuideZh: '注意冷峻叙事语气和剧场化节奏如何区别于后来的仪式进行曲。',
    listeningGuideEn: 'Listen for detached narration and theatrical rhythm, sharply different from later ceremonial marches.',
  },
  'Lili Marleen': {
    contextZh: '一首士兵抒情歌，因广播传播而越过阵营边界，成为多国前线共同记忆。',
    contextEn: 'A soldier lyric that crossed enemy lines through broadcasting and became a shared frontline memory.',
    eventRelationZh: '它说明审查和宣传体系并不能完全控制歌曲在听众中的再解释。',
    eventRelationEn: 'It shows that censorship and propaganda systems could not fully control how listeners reinterpreted songs.',
    listeningGuideZh: '注意低速、重复和夜间意象如何形成私人化的前线情绪。',
    listeningGuideEn: 'Listen for slow tempo, repetition, and night imagery that create private frontline feeling.',
  },
  'U-Boot-Lied': {
    contextZh: '德国战时士兵歌曲样本，页面仅作为纳粹时期军事文化的历史材料处理。',
    contextEn: 'A German wartime soldier-song sample, handled here only as historical material from Nazi-era military culture.',
    eventRelationZh: '用于说明文化准入、广播和军队娱乐如何把音乐导向受控士气功能。',
    eventRelationEn: 'It illustrates how cultural gatekeeping, radio, and troop entertainment redirected music toward controlled morale work.',
    listeningGuideZh: '注意进行曲节拍和集体男声质感；不要把它理解为赞颂性播放。',
    listeningGuideEn: 'Listen for march pulse and male-ensemble texture; it is not presented as celebratory audio.',
    sensitivity: 'sensitive-context',
  },
  'Faccetta Nera': {
    contextZh: '意大利殖民战争语境中的流行宣传歌曲，带有明确的帝国主义和种族化叙事。',
    contextEn: 'An Italian colonial-war popular propaganda song with explicit imperial and racialized framing.',
    eventRelationZh: '它帮助说明轴心政治如何借助易记旋律把殖民暴力包装成大众娱乐。',
    eventRelationEn: 'It helps explain how Axis politics used memorable melody to package colonial violence as mass entertainment.',
    listeningGuideZh: '只从旋律传播和宣传方式角度分析，不采用其政治叙事。',
    listeningGuideEn: 'Analyze only its melodic circulation and propaganda mechanism, not its political claims.',
    sensitivity: 'sensitive-context',
  },
  'Fischia il vento': {
    contextZh: '意大利反法西斯游击队歌曲，借用《喀秋莎》旋律形成跨国抵抗声响。',
    contextEn: 'An Italian anti-fascist partisan song that adapts the melody of Katyusha into a transnational resistance sound.',
    eventRelationZh: '作为轴心仪式声的反面，它显示同一时代也存在地下、游击和反法西斯歌唱。',
    eventRelationEn: 'As a counterpoint to Axis ceremonial sound, it reveals underground, partisan, and anti-fascist singing in the same period.',
    listeningGuideZh: '注意熟悉旋律如何被重新填词，转向行军、地下组织和抵抗情绪。',
    listeningGuideEn: 'Listen for how a familiar melody is retexted toward marching, clandestine organization, and resistance.',
    sensitivity: 'resistance',
  },
  'Bella Ciao': {
    contextZh: '意大利反法西斯记忆中最具国际传播力的歌曲之一，战后不断被重新演唱和再语境化。',
    contextEn: 'One of the most internationally circulated songs of Italian anti-fascist memory, repeatedly re-sung and recontextualized after the war.',
    eventRelationZh: '它把欧洲战争结束后的政治清算和民间抵抗记忆联系起来。',
    eventRelationEn: 'It connects the end of the European war with civilian resistance memory and political reckoning.',
    listeningGuideZh: '注意简洁副歌和重复结构如何支持集体合唱。',
    listeningGuideEn: 'Listen for the concise refrain and repetition that support collective singing.',
    sensitivity: 'resistance',
  },
  'Horst-Wessel-Lied': {
    contextZh: '纳粹党仪式歌曲样本，只作为极权政治声音制度的历史材料处理。',
    contextEn: 'A Nazi Party ceremonial-song sample, handled only as historical evidence of authoritarian sound systems.',
    eventRelationZh: '它说明政党仪式如何将进行曲、忠诚表达和群众队列绑定。',
    eventRelationEn: 'It shows how party ceremony bound march rhythm, loyalty expression, and crowd formation together.',
    listeningGuideZh: '仅从仪式化、队列化和宣传方式角度分析，不作赞颂性呈现。',
    listeningGuideEn: 'Analyze only its ceremony, formation, and propaganda mechanics; it is not presented celebratorily.',
    sensitivity: 'sensitive-context',
  },
  'Yellow River Cantata': {
    contextZh: '冼星海和光未然把民族危机写成大型合唱结构，使歌曲兼具舞台、教育和动员功能。',
    contextEn: 'Xian Xinghai and Guang Weiran shaped national crisis into a large choral form with stage, education, and mobilization functions.',
    eventRelationZh: '本地音频使用《保卫黄河》段落，展示抗战合唱如何把地理想象转为集体行动。',
    eventRelationEn: 'The local audio uses the Defend the Yellow River movement to show how wartime chorus turned geography into collective action.',
    listeningGuideZh: '注意轮唱、强节拍和群众合唱如何制造推进感。',
    listeningGuideEn: 'Listen for canonic entries, strong pulse, and mass chorus creating forward momentum.',
    sensitivity: 'resistance',
  },
  'Song of the Guerrillas': {
    contextZh: '贺绿汀的抗战歌曲以轻快节奏写出游击行动的机动性和群众性。',
    contextEn: 'He Luting’s resistance song uses brisk rhythm to stage the mobility and mass character of guerrilla action.',
    eventRelationZh: '它把军事经验转译为可唱、可传播的短小歌曲，是抗战音乐教育中常用的样本。',
    eventRelationEn: 'It translates military experience into a compact singable form, a central sample for wartime music education.',
    listeningGuideZh: '注意短句、跳跃节奏和集体应答感。',
    listeningGuideEn: 'Listen for short phrases, springing rhythm, and a sense of collective response.',
    sensitivity: 'resistance',
  },
  "We'll Meet Again": {
    contextZh: '维拉·琳的战时广播代表曲，把离别、等待和重逢写成英国后方很熟悉的情绪。',
    contextEn: 'Vera Lynn’s wartime broadcasting signature shaped separation, waiting, and reunion into a British home-front emotional formula.',
    eventRelationZh: '它把战争的不确定性转化为可反复播放的安慰性承诺。',
    eventRelationEn: 'It turns wartime uncertainty into a repeatable promise of comfort.',
    listeningGuideZh: '注意温和声线和重复副歌如何降低恐惧感。',
    listeningGuideEn: 'Listen for gentle vocal delivery and repeated refrain as techniques of reassurance.',
    sensitivity: 'patriotic',
  },
  'J’attendrai': {
    contextZh: '法语流行歌中的“等待”主题在战争初期被重新听见，成为占领和分离经验的情绪容器。',
    contextEn: 'The French-language theme of waiting was re-heard in wartime as an emotional container for occupation and separation.',
    eventRelationZh: '它连接欧洲战争、巴黎占领和解放后的香颂记忆。',
    eventRelationEn: 'It links the outbreak of European war, occupied Paris, and post-liberation chanson memory.',
    listeningGuideZh: '注意圆舞式流动和延宕感如何制造“等待”的时间经验。',
    listeningGuideEn: 'Listen for waltz-like flow and suspension that produce the feeling of waiting.',
  },
  'Sacred War': {
    contextZh: '苏联卫国战争歌曲代表，以庄严合唱和低沉推进建立集体防御叙事。',
    contextEn: 'A representative Soviet Great Patriotic War song using solemn chorus and dark forward motion to build collective defense.',
    eventRelationZh: '它把巴巴罗萨之后的战争震荡转换成可广播、可合唱的公共声音。',
    eventRelationEn: 'It converts the shock after Barbarossa into a broadcastable, singable public sound.',
    listeningGuideZh: '注意慢速、低音区和齐唱怎样带出庄严与紧迫。',
    listeningGuideEn: 'Listen for slow tempo, low register, and unison force shaping gravity and urgency.',
    sensitivity: 'patriotic',
  },
  'Coming in on a Wing and a Prayer': {
    contextZh: '美国航空战争和后方娱乐结合的歌曲，把危险任务写成可传唱的士气叙事。',
    contextEn: 'A U.S. aviation-war morale song that turns a dangerous mission into singable home-front narrative.',
    eventRelationZh: '它说明珍珠港后美国流行工业如何快速吸收军种、基地和空战主题。',
    eventRelationEn: 'It shows how U.S. popular music absorbed service branches, bases, and air-war themes after Pearl Harbor.',
    listeningGuideZh: '注意叙事歌词、轻快伴奏和“祈祷”意象如何平衡危险与希望。',
    listeningGuideEn: 'Listen for narrative lyric, light accompaniment, and prayer imagery balancing danger and hope.',
    sensitivity: 'patriotic',
  },
  'Praise the Lord and Pass the Ammunition': {
    contextZh: '美国战时口号型流行歌，把宗教语汇、幽默和战斗动员合并。',
    contextEn: 'A U.S. wartime slogan song combining religious idiom, humor, and combat mobilization.',
    eventRelationZh: '它体现珍珠港后歌曲工业把新闻事件、军中故事和大众传播快速合成为流行文本。',
    eventRelationEn: 'It shows how post-Pearl Harbor song production fused news, service anecdotes, and mass circulation into pop text.',
    listeningGuideZh: '注意强拍、副歌口号和轻喜剧语气。',
    listeningGuideEn: 'Listen for emphatic beat, slogan refrain, and comic brightness.',
    sensitivity: 'patriotic',
  },
  'Fleur de Paris': {
    contextZh: '法国解放语境中的香颂样本，把城市、花朵和共和国回归连在一起。',
    contextEn: 'A French liberation-era chanson sample linking city, flower imagery, and republican return.',
    eventRelationZh: '它适合展示巴黎解放后公共庆祝与咖啡馆音乐空间的恢复。',
    eventRelationEn: 'It helps show how public celebration and café-music spaces returned after the Liberation of Paris.',
    listeningGuideZh: '注意轻快节拍和城市意象如何区别于占领时期的压抑声场。',
    listeningGuideEn: 'Listen for light pulse and city imagery, distinct from the compressed soundscape of occupation.',
  },
  'La Marseillaise': {
    contextZh: '法国共和传统中的公共歌曲，在解放场景里常作为街头庆祝和政治合法性的声音标记。',
    contextEn: 'A French republican public song that marks street celebration and political legitimacy in liberation scenes.',
    eventRelationZh: '它把抵抗、解放和共和国仪式压缩成一个高度可识别的声响符号。',
    eventRelationEn: 'It compresses resistance, liberation, and republican ceremony into a highly recognizable sound sign.',
    listeningGuideZh: '注意号召性旋律和集体演唱感。',
    listeningGuideEn: 'Listen for call-like melody and collective singing energy.',
    sensitivity: 'patriotic',
  },
  'When the Lights Go On Again': {
    contextZh: '美国和盟军战后想象中的“灯光重启”歌曲，把胜利、归家和城市恢复联系起来。',
    contextEn: 'An Allied postwar-imagination song linking victory, return, and the re-lighting of cities.',
    eventRelationZh: '在德国投降语境中，它提供从战时停电、防空到重建生活的听觉转折。',
    eventRelationEn: 'In the surrender context, it marks the shift from blackout and air-raid life toward reconstruction.',
    listeningGuideZh: '注意抒情线条和乐观副歌如何把结束战争想象为日常生活恢复。',
    listeningGuideEn: 'Listen for lyrical line and optimistic refrain framing war’s end as the return of daily life.',
    sensitivity: 'patriotic',
  },
  'Ringo no Uta': {
    contextZh: '战后日本流行歌重启的象征之一，以轻快旋律替代战时纪律化声响。',
    contextEn: 'A symbol of postwar Japanese popular-song restart, using brightness to displace wartime disciplined sound.',
    eventRelationZh: '它帮助说明投降后日本音乐如何从国策歌谣转向城市娱乐和电影歌曲。',
    eventRelationEn: 'It helps explain the post-surrender shift from policy song toward urban entertainment and film song.',
    listeningGuideZh: '注意轻快旋律和日常物象如何制造战后重新开始的感觉。',
    listeningGuideEn: 'Listen for bright melody and everyday imagery producing a sense of restart.',
  },
  'Tokyo Boogie-Woogie': {
    contextZh: '占领期日本舞台和唱片工业的代表曲，把布吉节奏与都市复兴结合。',
    contextEn: 'A representative occupation-era Japanese stage and record hit joining boogie rhythm to urban recovery.',
    eventRelationZh: '它显示美国音乐语汇如何进入战后日本流行工业。',
    eventRelationEn: 'It shows how American musical vocabulary entered postwar Japanese popular industry.',
    listeningGuideZh: '注意布吉节奏、舞台能量和战后都市感。',
    listeningGuideEn: 'Listen for boogie rhythm, stage energy, and postwar urban brightness.',
  },
  'Nature Boy': {
    contextZh: '战后美国唱片工业中更柔和、亲密、国际化的流行声线。',
    contextEn: 'A softer, intimate, and internationalized postwar U.S. popular-record sound.',
    eventRelationZh: '它代表马歇尔援助时代美国娱乐工业对欧洲广播和唱片市场的吸引力。',
    eventRelationEn: 'It represents the pull of U.S. entertainment industry on European broadcasting and record markets during the Marshall era.',
    listeningGuideZh: '注意低声线、弦乐色彩和个人化叙事。',
    listeningGuideEn: 'Listen for low vocal color, strings, and intimate narration.',
  },
  'Ornithology': {
    contextZh: '比波普代表曲目之一，以查理·帕克体系中的快速和声转换和即兴语汇展示战后美国爵士的新现代性。',
    contextEn: 'A representative bebop line from the Charlie Parker circle, showing postwar U.S. jazz modernity through fast harmonic motion and improvisational vocabulary.',
    eventRelationZh: '它替代未能稳定取得音频的《Move》，用于说明马歇尔时代美国爵士如何通过唱片、俱乐部和驻军文化进入欧洲听觉想象。',
    eventRelationEn: 'It replaces Move, for which no stable downloadable source was found, and shows how American jazz entered European listening through records, clubs, and troop culture.',
    listeningGuideZh: '注意急速主题、切分重音和铜管/萨克斯即兴线条如何区别于战时大乐队娱乐。',
    listeningGuideEn: 'Listen for the rapid head, syncopated accents, and brass/saxophone lines that distinguish bebop from wartime big-band entertainment.',
  },
  'God Bless America': {
    contextZh: '美国公共音乐中的爱国曲目，在战时和战后广播中都具有强烈识别度。',
    contextEn: 'A highly recognizable U.S. patriotic public song across wartime and postwar broadcasting.',
    eventRelationZh: '放在马歇尔计划语境中，可展示美国公共声音如何伴随经济和文化影响进入欧洲视野。',
    eventRelationEn: 'In the Marshall Plan context, it shows how U.S. public sound accompanied economic and cultural influence.',
    listeningGuideZh: '注意宽广旋律和仪式化演唱如何构成国家形象。',
    listeningGuideEn: 'Listen for broad melody and ceremonial delivery shaping national image.',
    sensitivity: 'patriotic',
  },
}

const baseEventEnhancementsById: Record<string, EventEnhancement> = {
  'mukden-incident': {
    longDescriptionZh:
      '九一八事变让我看到，战争在东亚并不是 1937 年才突然影响音乐。日本占领东北后，城市娱乐、电影歌曲和唱片网络受到殖民行政、新闻审查和军事宣传挤压；中国音乐人也开始把“流亡”“救亡”和民族共同体写进歌曲。',
    longDescriptionEn:
      'The Mukden Incident shows me that war was already changing music in East Asia before 1937. Japanese occupation pressed urban entertainment, film song, and record networks into colonial administration and military messaging, while Chinese musicians began writing displacement, national survival, and collective identity into songs.',
    musicImpactZh:
      '东亚流行音乐不再只是都市消费。上海时代曲还在发展，但抗战合唱、救亡歌曲和日本国策歌谣开始占据更大的位置。',
    musicImpactEn:
      'East Asian popular music was no longer only urban consumption. Shanghai shidaiqu continued, but Chinese resistance chorus and Japanese policy songs took up more space.',
    relatedSongs: [
      song({
        title: 'March of the Volunteers',
        performer: 'Nie Er / Tian Han',
        year: '1935',
        noteZh: '从电影歌曲进入民族动员语境，后来成为中国战时公共声音里最容易辨认的符号之一。',
        noteEn: 'A film song that entered national mobilization and became a defining sound of wartime China.',
        sourceUrl: 'https://link.springer.com/article/10.1186/s41257-026-00150-4',
        rightsLabel: 'Archive and scholarship reference only',
      }),
      song({
        title: 'Song of the Great Wall',
        performer: 'Liu Xue’an / Pan Zi-nong',
        year: '1937',
        noteZh: '以长城意象组织救亡情绪，显示抗战歌曲如何把地理符号转化为合唱动员。',
        noteEn: 'Uses the Great Wall as a mobilizing image, showing how resistance song turned geography into choral solidarity.',
        sourceUrl: 'https://link.springer.com/article/10.1186/s41257-026-00150-4',
        rightsLabel: 'Scholarship reference only',
      }),
      song({
        title: 'Aikoku Koshinkyoku',
        performer: 'Japanese wartime policy-song repertoire',
        year: '1937',
        noteZh: '作为国策歌谣样本，帮助对照九一八之后日本大众歌曲如何逐步被国家动员吸收。',
        noteEn: 'As a policy-song sample, it helps compare how Japanese popular song was gradually absorbed into state mobilization after Mukden.',
        sourceUrl: 'https://archive.org/details/TaiatariSeishin',
        rightsLabel: researchUseRightsLabel,
        rightsUrl: archiveRights,
      }),
    ],
    image: image({
      src: '/images/events/mukden-incident.webp',
      altZh: '九一八事变后沈阳街头的历史照片',
      altEn: 'Historical photograph from Shenyang after the Mukden Incident',
      credit: 'Unknown author via Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mukden_1931_japan_shenyang.jpg',
      licenseLabel: 'Public domain on Wikimedia Commons',
      licenseUrl: commonsLicense,
    }),
  },
  'reich-chamber': {
    longDescriptionZh:
      '帝国文化院把作曲、演出、出版、广播和音乐教育都放进职业准入制度。音乐不只是审美问题，也变成身份筛选。犹太音乐家、左翼剧场、爵士和魏玛实验传统被排斥，留下来的娱乐音乐也必须服从审查。',
    longDescriptionEn:
      'The Reich Chamber of Culture put composition, performance, publishing, broadcasting, and music education inside a system of professional admission. Music became a form of identity screening: Jewish musicians, left theatre, jazz, and Weimar experiment were excluded, while approved entertainment stayed inside censorship.',
    musicImpactZh:
      '这套制度切断了很多魏玛时期的音乐路线。德国音乐从卡巴莱、爵士和政治剧场，转向受控轻音乐、进行曲和官方广播。',
    musicImpactEn:
      'The system cut off many Weimar musical paths. German sound moved away from cabaret, jazz, and political theatre toward controlled light music, marches, and state-approved broadcasting.',
    relatedSongs: [
      song({
        title: 'Mack the Knife',
        performer: 'Kurt Weill / Bertolt Brecht',
        year: '1928',
        noteZh: '魏玛剧场歌曲的代表，正是纳粹文化清洗要排除的都市讽刺与现代主义声音。',
        noteEn: 'A landmark of Weimar theatre song and the kind of urban satire and modernism targeted by Nazi cultural purges.',
        sourceUrl: 'https://www.kwf.org/about/',
        rightsLabel: 'Foundation reference only',
      }),
      song({
        title: 'U-Boot-Lied',
        performer: 'Historical German military-song recording',
        year: 'wartime circulation',
        noteZh: '作为敏感历史样本，显示文化管制后军事歌曲和士兵娱乐如何被组织为士气工具。',
        noteEn: 'As a sensitive historical sample, it shows how military song and soldier entertainment were organized as morale tools after cultural control tightened.',
        sourceUrl: 'https://archive.org/details/lp_war-songs-of-the-third-reich-historical-ge_unknown-artist',
        rightsLabel: researchUseRightsLabel,
        rightsUrl: archiveRights,
      }),
      song({
        title: 'Lili Marleen',
        performer: 'Lale Andersen',
        year: '1939 / wartime circulation',
        noteZh: '说明审查体制下仍可能出现跨战线传播的抒情歌曲。',
        noteEn: 'Shows how a lyrical song could still circulate across enemy lines inside a censored system.',
        sourceUrl: 'http://www.iwm.org.uk/collections/item/object/205124602',
        rightsLabel: 'Archive record only',
        rightsUrl: 'https://www.iwm.org.uk/terms-and-conditions',
      }),
    ],
    image: image({
      src: '/images/events/reich-chamber.webp',
      altZh: '1937 年《帝国文化院手册》中的机构页面',
      altEn: 'A 1937 Reich Chamber of Culture handbook page',
      credit: 'Handbuch der Reichskulturkammer via Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Reichskulturkammer_1937.jpg',
      licenseLabel: 'CC0 on Wikimedia Commons',
      licenseUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en',
    }),
  },
  'rome-berlin-axis': {
    longDescriptionZh:
      '罗马-柏林轴心不只是外交事件。我把它放进地图，是因为德意两国的广播、仪式、新闻影像和群众集会开始使用相近的声音套路。',
    longDescriptionEn:
      'The Rome-Berlin Axis was more than diplomacy. I include it because German and Italian radio, ceremony, newsreel, and mass rallies began using similar sound routines.',
    musicImpactZh:
      '轴心合作让进行曲、合唱口号和仪式音乐更常见，也压缩了爵士、歌舞厅和地方娱乐的空间。',
    musicImpactEn:
      'Axis cooperation made marches, choral slogans, and ceremonial music more common while narrowing room for jazz, cabaret, and local entertainment.',
    relatedSongs: [
      song({
        title: 'Faccetta Nera',
        performer: 'Carlo Buti',
        year: '1935',
        noteZh: '殖民宣传与大众旋律结合的例子，体现意大利官方仪式声与流行传播的交叠。',
        noteEn: 'An example of colonial propaganda fused with popular melody, showing how ceremony and mass song overlapped in Italy.',
        sourceUrl: 'https://canzoneitaliana.it/en/canzone/faccetta-nera-testo-ufficiale-dello-spartito-en/',
        rightsLabel: 'Archive record only',
      }),
      song({
        title: 'Fischia il vento',
        performer: 'Italian partisan repertoire',
        year: '1943 / resistance circulation',
        noteZh: '借用《喀秋莎》旋律的反法西斯游击队歌曲，为轴心仪式声提供抵抗侧的对照。',
        noteEn: 'An anti-fascist partisan song adapted from Katyusha, offering a resistance-side counterpoint to Axis ceremonial sound.',
        sourceUrl: 'https://archive.org/details/ror-katyusha-fischiailvento-x4ab8sev',
        rightsLabel: researchUseRightsLabel,
        rightsUrl: archiveRights,
      }),
      song({
        title: 'Horst-Wessel-Lied',
        performer: 'Nazi Party song',
        year: '1929',
        noteZh: '纳粹仪式音乐的典型例子，显示轴心文化中进行曲节奏和政治忠诚的结合。',
        noteEn: 'A central Nazi ceremonial song, illustrating the fusion of march rhythm and political loyalty in Axis culture.',
        sourceUrl: 'https://encyclopedia.ushmm.org/content/en/article/degenerate-art-1',
        rightsLabel: 'Historical reference only',
      }),
    ],
    image: image({
      src: '/images/events/rome-berlin-axis.webp',
      altZh: '1938 年报刊中关于罗马-柏林轴心的版面',
      altEn: 'A 1938 press page referring to the Rome-Berlin Axis',
      credit: 'Digital Tessmann / Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:DOL_1938_03_16_1_Achse_Rom_Berlin.png',
      licenseLabel: 'CC BY-SA 4.0 on Wikimedia Commons',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    }),
  },
  'second-sino-japanese-war': {
    longDescriptionZh:
      '全面侵华战争打断了上海、南京等城市的文化工业。唱片公司、电影公司、音乐家和学生团体往内地转移，歌曲被用于募捐、宣传、巡演和集体教育；日本方面也更常用广播和国策歌曲组织战时情绪。',
    longDescriptionEn:
      'The full-scale Sino-Japanese War disrupted cultural work in Shanghai, Nanjing, and other cities. Record companies, film studios, musicians, and student groups moved inland; songs were used for fundraising, touring, propaganda, and group education, while Japan intensified radio and policy songs.',
    musicImpactZh:
      '中国音乐明显转向群众合唱和抗战歌曲。日本流行歌则更多使用军国主义、乡愁和家庭叙事来管理情绪。',
    musicImpactEn:
      'Chinese music clearly moved toward mass chorus and resistance song. Japanese popular song leaned more on militarism, nostalgia, and family feeling to manage emotion.',
    relatedSongs: [
      song({
        title: 'March of the Volunteers',
        performer: 'Nie Er / Tian Han',
        year: '1935',
        noteZh: '在战争语境中成为抗战动员的代表歌曲。',
        noteEn: 'Became one of the representative songs of Chinese wartime mobilization.',
        sourceUrl: 'https://link.springer.com/article/10.1186/s41257-026-00150-4',
        rightsLabel: 'Scholarship reference only',
      }),
      song({
        title: 'Yellow River Cantata',
        performer: 'Xian Xinghai / Guang Weiran',
        year: '1939',
        noteZh: '大型合唱把民族危机转化为可巡演、可组织、可共同演唱的公共音乐。',
        noteEn: 'A large cantata that turned national crisis into public music that could tour, organize, and be sung collectively.',
        sourceUrl: 'https://www.icm.gov.mo/ef/news/detail/18214',
        rightsLabel: 'Museum reference only',
      }),
      song({
        title: 'Aikoku Koshinkyoku',
        performer: 'Japanese wartime policy-song repertoire',
        year: '1937',
        noteZh: '与中国抗战合唱形成对照，显示日本国策歌谣如何把明亮进行曲语汇纳入战争动员。',
        noteEn: 'Contrasted with Chinese resistance chorus, it shows how Japanese policy song folded bright march idioms into war mobilization.',
        sourceUrl: 'https://archive.org/details/TaiatariSeishin',
        rightsLabel: researchUseRightsLabel,
        rightsUrl: archiveRights,
      }),
    ],
    image: image({
      src: '/images/events/second-sino-japanese-war.webp',
      altZh: '1937 年上海战事中的中国战俘照片',
      altEn: 'Chinese prisoners of war in Shanghai, August 1937',
      credit: 'Japanese reporter via Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chinese_prisoners_of_war_at_Shanghai,_August_1937.jpg',
      licenseLabel: 'Public domain on Wikimedia Commons',
      licenseUrl: commonsLicense,
    }),
  },
  'europe-war': {
    longDescriptionZh:
      '1939 年欧洲战争爆发后，广播、新闻电影和唱片不再只是娱乐渠道。各国政府用它们组织信息、恐惧、希望和纪律，音乐节目也被放进防空、征兵、工厂劳动和前线慰问的需要里。',
    longDescriptionEn:
      'After war broke out in Europe in 1939, radio, newsreels, and records were no longer just entertainment channels. Governments used them to organize information, fear, hope, and discipline, while music served air-raid life, recruitment, factory work, and morale.',
    musicImpactZh:
      '轻音乐、香颂、舞曲和进行曲被放进战时功能里：有的安慰听众，有的像暗号，有的服务动员，有的只是审查后还能播放的消遣。',
    musicImpactEn:
      'Light music, chanson, dance tunes, and marches were pushed into wartime jobs: some comforted listeners, some worked like coded speech, some served mobilization, and some were simply what could still pass censorship.',
    relatedSongs: [
      song({
        title: "We'll Meet Again",
        performer: 'Vera Lynn',
        year: '1939',
        noteZh: '把离别与重逢写成战时英国广播中最具识别度的情感公式。',
        noteEn: 'Turned separation and reunion into one of the most recognizable emotional formulas of British wartime broadcasting.',
        sourceUrl: 'https://www.iwm.org.uk/collections/sound',
        rightsLabel: 'Archive record only',
        rightsUrl: 'https://www.iwm.org.uk/terms-and-conditions',
      }),
      song({
        title: 'J’attendrai',
        performer: 'Rina Ketty',
        year: '1938 / wartime circulation',
        noteZh: '等待主题在战争初期被重新听见，成为法语流行歌中的悬置情绪。',
        noteEn: 'Its theme of waiting was re-heard in wartime, becoming a suspended emotional register in French popular song.',
        sourceUrl: 'https://gallica.bnf.fr/accueil/fr/html/damia-la-tragedienne-de-la-chanson',
        rightsLabel: 'Archive essay reference only',
      }),
      song({
        title: 'Lili Marleen',
        performer: 'Lale Andersen',
        year: '1939 / wartime circulation',
        noteZh: '从德国广播扩散到多国前线，是欧洲战时歌曲跨界传播的典型例子。',
        noteEn: 'Spread from German broadcasting to multiple fronts, making it a key example of wartime cross-border song circulation.',
        sourceUrl: 'http://www.iwm.org.uk/collections/item/object/205124602',
        rightsLabel: 'Archive record only',
        rightsUrl: 'https://www.iwm.org.uk/terms-and-conditions',
      }),
    ],
    image: image({
      src: '/images/events/europe-war.webp',
      altZh: '1939 年波兰战役示意图',
      altEn: 'Map of the September 1939 campaign in Poland',
      credit: 'Poeticbent / Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wrzesien2.jpg',
      licenseLabel: 'Public domain on Wikimedia Commons',
      licenseUrl: commonsLicense,
    }),
  },
  barbarossa: {
    longDescriptionZh:
      '巴巴罗萨行动把欧洲战争扩大为东线总体战。城市围困、村庄破坏、军队推进和大规模伤亡，让歌曲里“牺牲”“家园”“敌我”的词变得更重。',
    longDescriptionEn:
      'Operation Barbarossa turned the European war into total war on the Eastern Front. Siege, village destruction, military advance, and mass death made sacrifice, homeland, and enemy lines heavier inside songs.',
    musicImpactZh:
      '苏联歌曲更常用大合唱、前线抒情和爱国史诗。德国方面继续用轻音乐和士兵广播维持秩序，但东线压力让这些声音越来越沉。',
    musicImpactEn:
      'Soviet song leaned into mass chorus, frontline lyricism, and patriotic epic. Germany kept light music and soldier broadcasting as tools of order, but the Eastern Front darkened their mood.',
    relatedSongs: [
      song({
        title: 'Sacred War',
        performer: 'Alexandrov Ensemble tradition',
        year: '1941',
        noteZh: '以庄严合唱定义“卫国战争”的公共语气。',
        noteEn: 'Defined the public tone of the Great Patriotic War through solemn massed chorus.',
        sourceUrl: 'https://www.britannica.com/place/Russia/Music',
        rightsLabel: 'Historical reference only',
      }),
      song({
        title: 'Katyusha',
        performer: 'Matvey Blanter / Mikhail Isakovsky',
        year: '1938 / wartime circulation',
        noteZh: '把民歌式旋律、爱情等待和前线想象结合，成为苏联战时传播最广的歌曲之一。',
        noteEn: 'Joined folk-like melody, romantic waiting, and frontline imagination, becoming one of the most widely circulated Soviet wartime songs.',
        sourceUrl: 'https://www.britannica.com/place/Russia/Music',
        rightsLabel: 'Historical reference only',
      }),
      song({
        title: 'Lili Marleen',
        performer: 'Lale Andersen',
        year: '1941-1942 frontline circulation',
        noteZh: '在东线和北非等战场被双方士兵收听，说明战时抒情歌可越过宣传边界。',
        noteEn: 'Heard by soldiers across fronts, showing how wartime lyric song could cross propaganda boundaries.',
        sourceUrl: 'http://www.iwm.org.uk/collections/item/object/205124602',
        rightsLabel: 'Archive record only',
        rightsUrl: 'https://www.iwm.org.uk/terms-and-conditions',
      }),
    ],
    image: image({
      src: '/images/events/barbarossa.webp',
      altZh: '巴巴罗萨行动相关历史照片拼贴',
      altEn: 'Historical collage associated with Operation Barbarossa',
      credit: 'Bundesarchiv and RIA Novosti files via Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Operation_Barbarossa_collage.jpg',
      licenseLabel: 'CC0 on Wikimedia Commons',
      licenseUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en',
    }),
  },
  'pearl-harbor': {
    longDescriptionZh:
      '珍珠港事件使美国从观察者变成参战者。军中慰问演出、V-Disc 唱片、短波广播和好莱坞歌曲工业很快进入全球战争网络，美国流行乐也和盟军士气、基地文化、跨太平洋传播连在一起。',
    longDescriptionEn:
      'Pearl Harbor moved the United States from observer to combatant. Troop shows, V-Discs, shortwave radio, and Hollywood song production quickly entered a global war network, tying American popular music to Allied morale, base culture, and trans-Pacific circulation.',
    musicImpactZh:
      '摇摆乐、和声女声组合、军中布吉和爱国流行歌获得新渠道。美国声音从国内舞厅走向海外基地和盟军广播。',
    musicImpactEn:
      'Swing, close-harmony vocal groups, military boogie, and patriotic pop gained new channels. The American sound moved from domestic dance halls to overseas bases and Allied radio.',
    relatedSongs: [
      song({
        title: 'Boogie Woogie Bugle Boy',
        performer: 'The Andrews Sisters',
        year: '1941',
        noteZh: '把摇摆节奏和军中角色结合，是美国战时娱乐网络里很容易辨认的声音。',
        noteEn: 'Fused swing rhythm with military character and became a signature sound of U.S. wartime entertainment.',
        sourceUrl: 'https://blogs.loc.gov/loc/2020/10/a-soundtrack-of-world-war-ii/',
        rightsLabel: 'Archive essay reference only',
      }),
      song({
        title: 'Coming in on a Wing and a Prayer',
        performer: 'Bea Wain with orchestra / V-Disc circulation',
        year: '1943',
        noteZh: '航空战争主题进入军中唱片和后方娱乐，表现珍珠港后美国流行工业对军种叙事的吸收。',
        noteEn: 'Air-war themes entered troop records and home-front entertainment, showing how U.S. pop absorbed service narratives after Pearl Harbor.',
        sourceUrl: 'https://archive.org/details/V-discs1-991943-1944',
        rightsLabel: researchUseRightsLabel,
        rightsUrl: archiveRights,
      }),
      song({
        title: 'Praise the Lord and Pass the Ammunition',
        performer: 'Frank Loesser',
        year: '1942',
        noteZh: '把口号、幽默和战斗动员结合，代表美国战时流行歌的宣传化转向。',
        noteEn: 'Combined slogan, humor, and mobilization, representing the propagandistic turn of U.S. wartime pop.',
        sourceUrl: 'https://blogs.loc.gov/loc/2020/10/a-soundtrack-of-world-war-ii/',
        rightsLabel: 'Archive essay reference only',
      }),
    ],
    image: image({
      src: '/images/events/pearl-harbor.webp',
      altZh: '珍珠港袭击中 USS Shaw 爆炸的照片',
      altEn: 'USS Shaw exploding during the attack on Pearl Harbor',
      credit: 'Unknown U.S. Navy photographer / U.S. National Archives via Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:USS_SHAW_exploding_Pearl_Harbor_Nara_80-G-16871_2.jpg',
      licenseLabel: 'Public domain on Wikimedia Commons',
      licenseUrl: commonsLicense,
    }),
  },
  stalingrad: {
    longDescriptionZh:
      '斯大林格勒战役让东线的牺牲感到达高点。城市废墟和战局反转使苏联音乐里出现更强的胜利预感，也让德国受控娱乐里的轻松、舞曲和慰问功能越来越难维持。',
    longDescriptionEn:
      'Stalingrad brought the Eastern Front’s sense of sacrifice to a high point. Urban ruins and military reversal gave Soviet music a stronger sense of coming victory, while Germany’s controlled entertainment found it harder to preserve lightness and morale.',
    musicImpactZh:
      '苏联前线歌曲更强调坚守、哀悼和英雄化。德国广播则从自信动员转向维持士气，娱乐音乐被战局一点点压低。',
    musicImpactEn:
      'Soviet frontline song emphasized endurance, mourning, and heroism. German broadcasting shifted from confident mobilization toward morale maintenance as the battlefield pressed down on entertainment.',
    relatedSongs: [
      song({
        title: 'The Blue Scarf',
        performer: 'Klavdiya Shulzhenko',
        year: '1942 / WWII circulation',
        noteZh: '以抒情前线歌曲表达离别与坚守，代表苏联战时情感动员的柔性一面。',
        noteEn: 'A lyrical frontline song of separation and endurance, representing the softer side of Soviet emotional mobilization.',
        sourceUrl: 'https://www.iwm.org.uk/collections/item/object/80030723',
        rightsLabel: 'Archive record only',
        rightsUrl: 'https://www.iwm.org.uk/terms-and-conditions',
      }),
      song({
        title: 'Dark Night',
        performer: 'Mark Bernes',
        year: '1943',
        noteZh: '通过私人化抒情表达战时家庭和前线之间的情感纽带。',
        noteEn: 'Uses private lyricism to express the emotional bond between home and front.',
        sourceUrl: 'https://www.britannica.com/place/Russia/Music',
        rightsLabel: 'Historical reference only',
      }),
      song({
        title: 'Sacred War',
        performer: 'Alexandrov Ensemble tradition',
        year: '1941',
        noteZh: '在转折点之后继续提供庄严、集体化的胜利叙事框架。',
        noteEn: 'Continued to provide a solemn collective frame for victory narratives after the turning point.',
        sourceUrl: 'https://www.britannica.com/place/Russia/Music',
        rightsLabel: 'Historical reference only',
      }),
    ],
    image: image({
      src: '/images/events/stalingrad.webp',
      altZh: '斯大林格勒废墟中的“儿童圆舞”喷泉照片',
      altEn: 'The Children’s Khorovod fountain amid the ruins of Stalingrad',
      credit: 'Sergey Strunnikov via Wikimedia Commons',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:%D0%A4%D0%BE%D0%BD%D1%82%D0%B0%D0%BD_%C2%AB%D0%94%D0%B5%D1%82%D1%81%D0%BA%D0%B8%D0%B9_%D1%85%D0%BE%D1%80%D0%BE%D0%B2%D0%BE%D0%B4%C2%BB.jpg',
      licenseLabel: 'Public domain on Wikimedia Commons',
      licenseUrl: commonsLicense,
    }),
  },
  'liberation-paris': {
    longDescriptionZh:
      '巴黎解放重新打开了占领时期被压缩的夜生活、俱乐部和香颂空间。盟军进入城市后，美国爵士、法国香颂、咖啡馆文化和抵抗记忆很快碰在一起。',
    longDescriptionEn:
      'The Liberation of Paris reopened nightlife, clubs, and chanson spaces compressed under occupation. Allied arrival brought American jazz, French chanson, café culture, and resistance memory into contact.',
    musicImpactZh:
      '香颂从占领时期的隐喻和小心生存，转向解放后的公共庆祝；爵士俱乐部复兴也让巴黎夜生活更国际化。',
    musicImpactEn:
      'Chanson moved from coded survival under occupation to public celebration, while jazz-club revival made Paris nightlife more international.',
    relatedSongs: [
      song({
        title: 'La Marseillaise',
        performer: 'Public ceremonial repertoire',
        year: '1792 / liberation circulation',
        noteZh: '作为解放场景中最强烈的公共声响，连接抵抗、共和国和街头庆祝。',
        noteEn: 'The most powerful public sound of liberation scenes, linking resistance, republic, and street celebration.',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:La_Marseillaise.ogg',
        streamUrl: '/audio/background/la-marseillaise.ogg',
        rightsLabel: 'Public domain local playback',
        rightsUrl: commonsLicense,
      }),
      song({
        title: 'Fleur de Paris',
        performer: 'French popular repertoire',
        year: '1944 / liberation circulation',
        noteZh: '把巴黎、花朵和共和国回归联系起来，适合展示解放后城市公共庆祝的香颂声场。',
        noteEn: 'Links Paris, flower imagery, and republican return, making it useful for the chanson soundscape of liberation celebration.',
        sourceUrl: 'https://archive.org/details/lp_favorite-music-of-france_cecile-chauveau',
        rightsLabel: researchUseRightsLabel,
        rightsUrl: archiveRights,
      }),
      song({
        title: 'La Vie en rose',
        performer: 'Edith Piaf',
        year: '1946',
        noteZh: '把战后巴黎的亲密香颂变成国际化标识。',
        noteEn: 'Turned postwar Parisian intimate chanson into an international signature.',
        sourceUrl: 'https://www.ina.fr/ina-eclaire-actu/video/i00013654/edith-piaf-la-vie-en-rose',
        rightsLabel: 'External archive playback',
        rightsUrl: 'https://www.ina.fr/rights',
      }),
    ],
    image: image({
      src: '/images/events/liberation-paris.webp',
      altZh: '巴黎解放时香榭丽舍大街上的人群',
      altEn: 'Crowds on the Champs Elysees during the Liberation of Paris',
      credit: 'Jack Downey, U.S. Office of War Information / Library of Congress via Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Crowds_of_French_patriots_line_the_Champs_Elysees-edit2.jpg',
      licenseLabel: 'Public domain on Wikimedia Commons',
      licenseUrl: commonsLicense,
    }),
  },
  'germany-surrender': {
    longDescriptionZh:
      '德国投降结束了欧洲战事，也开启了占领区广播、去纳粹化教育和文化重建。音乐机构必须重新说明自己和纳粹时期的关系，流亡音乐、爵士、室内乐和公共广播因此重新出现。',
    longDescriptionEn:
      'Germany’s surrender ended the war in Europe and opened occupation broadcasting, denazification education, and cultural reconstruction. Musical institutions had to explain their relationship to the Nazi years, while exile music, jazz, chamber music, and public broadcasting returned.',
    musicImpactZh:
      '受控娱乐和宣传音乐失去制度中心。盟军广播、爵士回归和古典音乐重建一起改变了战后欧洲的音乐环境。',
    musicImpactEn:
      'Controlled entertainment and propaganda music lost their institutional center. Allied broadcasting, the return of jazz, and classical rebuilding changed the postwar European music setting.',
    relatedSongs: [
      song({
        title: "We'll Meet Again",
        performer: 'Vera Lynn',
        year: '1939 / VE Day resonance',
        noteZh: '在胜利日语境中重新指向归来、团聚和战后生活。',
        noteEn: 'On VE Day it pointed anew toward return, reunion, and postwar life.',
        sourceUrl: 'https://www.iwm.org.uk/collections/sound',
        rightsLabel: 'Archive record only',
        rightsUrl: 'https://www.iwm.org.uk/terms-and-conditions',
      }),
      song({
        title: 'Bella Ciao',
        performer: 'Italian resistance repertoire',
        year: 'wartime / postwar memory',
        noteZh: '反法西斯抵抗歌曲在欧洲战后记忆中持续传播，提供与投降、去纳粹化和文化重建相关的民间声音。',
        noteEn: 'An anti-fascist resistance song that persisted in postwar European memory, offering a civilian sound tied to surrender, denazification, and reconstruction.',
        sourceUrl: 'https://archive.org/details/bella-ciao_202210',
        rightsLabel: researchUseRightsLabel,
        rightsUrl: archiveRights,
      }),
      song({
        title: 'When the Lights Go On Again',
        performer: 'Shep Fields / Ralph Young',
        year: '1942 / VE Day resonance',
        noteZh: '把停电、防空和归家愿望转化为战后生活恢复的想象。',
        noteEn: 'Turns blackout, air-raid life, and the wish to return home into an image of restored postwar life.',
        sourceUrl: 'https://archive.org/details/big-bands-world-war-ii',
        rightsLabel: researchUseRightsLabel,
        rightsUrl: archiveRights,
      }),
    ],
    image: image({
      src: '/images/events/germany-surrender.webp',
      altZh: '德国无条件投降文件照片',
      altEn: 'Photograph of the German instrument of surrender',
      credit: 'Office of War Information via Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:German_instrument_of_surrender2.jpg',
      licenseLabel: 'Public domain on Wikimedia Commons',
      licenseUrl: commonsLicense,
    }),
  },
  'japan-surrender': {
    longDescriptionZh:
      '日本投降结束了亚太战争，也让占领军广播、俱乐部和审查制度进入日本音乐生活。战时国策歌谣很快失去主导地位，爵士、布吉和电影歌曲重新组织了战后流行听觉。',
    longDescriptionEn:
      'Japan’s surrender ended the Asia-Pacific War and brought occupation broadcasting, clubs, and censorship into Japanese musical life. Wartime policy songs quickly lost dominance as jazz, boogie, and film songs reorganized postwar listening.',
    musicImpactZh:
      '音乐从军歌和国策抒情转向占领期爵士、布吉和战后电影歌曲。城市舞台重新热闹起来。',
    musicImpactEn:
      'Music shifted from military and policy songs toward occupation-era jazz, boogie, and postwar film song. The urban stage became lively again.',
    relatedSongs: [
      song({
        title: 'Ringo no Uta',
        performer: 'Namiki Michiko',
        year: '1945',
        noteZh: '常被视为战后日本流行歌重启的象征，以轻快旋律替代战时纪律化声音。',
        noteEn: 'Often treated as a symbol of Japanese popular song’s restart, replacing wartime discipline with a lighter tone.',
        sourceUrl: 'https://www.nippon.com/en/japan-topics/g02332/',
        rightsLabel: 'Historical essay reference only',
      }),
      song({
        title: 'Tokyo Boogie-Woogie',
        performer: 'Shizuko Kasagi',
        year: '1947',
        noteZh: '把布吉节奏、舞台能量和战后都市复兴结合，是占领期重新流行起来的重要歌曲。',
        noteEn: 'Joined boogie rhythm, stage energy, and postwar urban revival, making it a key song of occupation-era repopularization.',
        sourceUrl: 'https://www.nippon.com/en/japan-topics/g02332/',
        rightsLabel: 'Archive record only',
      }),
      song({
        title: 'Aikoku Koshinkyoku',
        performer: 'Japanese wartime policy-song repertoire',
        year: '1937 / wartime circulation',
        noteZh: '作为战时国策歌曲的残影，帮助对比投降后日本声音从军国动员到都市流行的急速转向。',
        noteEn: 'As a residue of wartime policy song, it helps contrast the rapid post-surrender shift from militarized mobilization to urban pop.',
        sourceUrl: 'https://archive.org/details/TaiatariSeishin',
        rightsLabel: researchUseRightsLabel,
        rightsUrl: archiveRights,
      }),
    ],
    image: image({
      src: '/images/events/japan-surrender.webp',
      altZh: '重光葵在密苏里号上签署日本投降书',
      altEn: 'Mamoru Shigemitsu signing the Japanese Instrument of Surrender',
      credit: 'Army Signal Corps photographer LT. Stephen E. Korpanty / Wikimedia Commons',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Mamoru_Shigemitsu_signs_the_Instrument_of_Surrender,_officially_ending_the_Second_World_War.jpg',
      licenseLabel: 'Public domain on Wikimedia Commons',
      licenseUrl: commonsLicense,
    }),
  },
  'marshall-broadcast': {
    longDescriptionZh:
      '马歇尔援助不只是经济重建。我把它放在音乐地图里，是因为美国资金、节目格式、唱片市场和驻军文化一起改变了英国、法国、意大利等地的战后流行音乐。',
    longDescriptionEn:
      'Marshall Aid was more than economic reconstruction. I include it in the music map because U.S. funding, program formats, record markets, and troop culture changed postwar popular music in Britain, France, Italy, and beyond.',
    musicImpactZh:
      '西欧音乐市场更容易接触美国流行工业。crooner、bebop、电影歌曲和广播节目模式都进入战后消费文化。',
    musicImpactEn:
      'Western European music markets came into closer contact with the U.S. popular industry. Crooners, bebop, film song, and broadcast formats entered postwar consumer culture.',
    relatedSongs: [
      song({
        title: 'Nature Boy',
        performer: 'Nat King Cole',
        year: '1948',
        noteZh: '代表战后美国流行唱片工业的柔和、国际化声线。',
        noteEn: 'Represents the softer, internationalized voice of the postwar U.S. record industry.',
        sourceUrl: 'https://www.loc.gov/research-centers/recorded-sound/collections/',
        rightsLabel: 'Archive gateway reference only',
      }),
      song({
        title: 'God Bless America',
        performer: 'U.S. patriotic popular repertoire',
        year: 'wartime / postwar broadcasting',
        noteZh: '作为美国公共音乐中的高识别度曲目，可提示马歇尔时代美国文化形象如何伴随广播和唱片传播。',
        noteEn: 'As a highly recognizable U.S. public song, it marks how American cultural image circulated through radio and records in the Marshall era.',
        sourceUrl: 'https://archive.org/details/lp_world-war-ii-songs-in-hi-fi_the-four-sergeants-rose-marie-jun',
        rightsLabel: researchUseRightsLabel,
        rightsUrl: archiveRights,
      }),
      song({
        title: 'Ornithology',
        performer: 'Charlie Parker Septet with Miles Davis',
        year: '1946 / bebop circulation',
        noteZh: '以可播放的比波普 78 转录音替代缺少稳定下载源的《Move》，继续呈现战后美国爵士在欧洲俱乐部和唱片圈的新影响。',
        noteEn: 'Uses a playable bebop 78 transfer in place of Move, whose stable download source could not be confirmed, while preserving the point about postwar U.S. jazz influence.',
        sourceUrl: 'https://archive.org/details/78_orinthology_charlie-parker-septet-charlie-parker-lucky-thompson-miles-davis-dodo-ma_gbia0344030b',
        rightsLabel: researchUseRightsLabel,
        rightsUrl: archiveRights,
      }),
    ],
    image: image({
      src: '/images/events/marshall-broadcast.webp',
      altZh: '1947 年马歇尔计划海报',
      altEn: 'A 1947 Marshall Plan poster',
      credit: 'Reyn Dirksen / George C. Marshall Foundation via Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Europe_Plan_Marshall._Poster_1947.JPG',
      licenseLabel: 'Public domain on Wikimedia Commons',
      licenseUrl: commonsLicense,
    }),
  },
  'prc-founding': {
    longDescriptionZh:
      '中华人民共和国成立后，中国音乐进入新的国家制度。抗战时期形成的群众歌曲、合唱组织、电影歌曲经验和宣传队网络，被重新放进建国后的公共音乐里。',
    longDescriptionEn:
      'The founding of the People’s Republic of China placed Chinese music inside a new state system. Wartime mass songs, choral organization, film-song experience, and propaganda troupe networks were reorganized inside post-1949 public music.',
    musicImpactZh:
      '音乐从战时救亡转向建国叙事。群众合唱、进行曲、民族化旋律和广播传播成为新公共音乐的常见做法。',
    musicImpactEn:
      'Music shifted from wartime survival to state-building narrative. Mass chorus, march idioms, nationalized melody, and broadcasting became common tools of new public music.',
    relatedSongs: [
      song({
        title: 'March of the Volunteers',
        performer: 'Nie Er / Tian Han',
        year: '1935 / adopted as anthem in 1949',
        noteZh: '从抗战电影歌曲转化为新国家公共声音，最直接体现战时传统的制度化。',
        noteEn: 'Moved from wartime film song into state public sound, directly showing the institutionalization of wartime tradition.',
        sourceUrl: 'https://link.springer.com/article/10.1186/s41257-026-00150-4',
        rightsLabel: 'Scholarship reference only',
      }),
      song({
        title: 'Yellow River Cantata',
        performer: 'Xian Xinghai / Guang Weiran',
        year: '1939',
        noteZh: '大型合唱传统为建国后公共音乐提供了组织形式和英雄化语言。',
        noteEn: 'Its large choral tradition supplied organizational form and heroic language for post-1949 public music.',
        sourceUrl: 'https://www.icm.gov.mo/ef/news/detail/18214',
        rightsLabel: 'Museum reference only',
      }),
      song({
        title: 'Song of the Guerrillas',
        performer: 'He Luting',
        year: '1937 / postwar memory',
        noteZh: '抗战群众歌曲在建国后继续作为公共音乐教育资源，连接战时动员与新国家叙事。',
        noteEn: 'A wartime mass song that continued as public music education after 1949, linking resistance mobilization with new state narrative.',
        sourceUrl: 'https://archive.org/details/fry188_yahoo_201504',
        rightsLabel: researchUseRightsLabel,
        rightsUrl: archiveRights,
      }),
    ],
    image: image({
      src: '/images/events/prc-founding.webp',
      altZh: '毛泽东在开国大典上宣布中华人民共和国成立',
      altEn: 'Mao Zedong proclaiming the establishment of the People’s Republic of China',
      credit: 'Unknown author / Lehtikuva via Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mao_proclaiming_establishment_of_PRC.jpg',
      licenseLabel: 'Public domain on Wikimedia Commons',
      licenseUrl: commonsLicense,
    }),
  },
}

const musicDevelopmentFrames: Record<string, { zh: string; en: string }> = {
  'mukden-incident': {
    zh: '这些歌曲能看出东亚音乐风潮正在转向：城市电影歌和唱片工业还在延续，但救亡合唱、民族动员和日本国策歌谣已经开始挤进流行音乐的中心。历史事件改变的不是一两首歌，而是音乐被谁使用、为什么被传播。',
    en: 'These songs show a shift in East Asian music: urban film song and the record business continued, but resistance chorus, national mobilization, and Japanese policy songs were moving closer to the center of popular music. The event changed more than individual songs; it changed who used music and why it circulated.',
  },
  'reich-chamber': {
    zh: '放在音乐发展里看，帝国文化院让魏玛时期开放、混杂的都市声音被迫断流。卡巴莱、爵士和政治剧场退场后，德国音乐越来越被审批、广播和仪式需求牵着走。',
    en: 'In musical-development terms, the Reich Chamber cut into the open, mixed urban sound of Weimar culture. As cabaret, jazz, and political theatre were pushed out, German music increasingly followed approval systems, broadcasting rules, and ceremonial needs.',
  },
  'rome-berlin-axis': {
    zh: '轴心形成后，进行曲、群众合唱和仪式音乐更像一种共同语言；同时，反法西斯歌曲也在地下和游击队中发展。一个事件把两种相反的音乐风潮都推清楚了：官方声音更整齐，抵抗声音也更尖锐。',
    en: 'After the Axis formed, marches, mass singing, and ceremony music began to feel like a shared language; at the same time, anti-fascist songs developed underground and among partisans. One event clarifies two opposing musical trends: official sound became more uniform, and resistance sound became sharper.',
  },
  'second-sino-japanese-war': {
    zh: '全面战争让东亚音乐从都市消费快速转向动员和教育。抗战歌曲、大合唱和日本国策歌谣虽然立场相反，但都说明歌曲正在从娱乐工业进入更直接的政治和社会生活。',
    en: 'Full-scale war pushed East Asian music quickly from urban consumption toward mobilization and education. Chinese resistance songs, large choruses, and Japanese policy songs were politically opposed, but all show songs moving from entertainment industry into more direct political and social life.',
  },
  'europe-war': {
    zh: '欧洲战争爆发后，广播让音乐发展进入新的阶段。轻音乐、香颂、舞曲和进行曲不再只按风格区分，它们还按战时功能被重新使用：安慰、等待、暗示、动员或审查后的消遣。',
    en: 'After war broke out in Europe, radio pushed music into a new stage. Light music, chanson, dance tunes, and marches were no longer divided only by style; wartime use also reclassified them as comfort, waiting, coded speech, mobilization, or censored diversion.',
  },
  barbarossa: {
    zh: '东线战争让音乐的情绪重心变重。苏联歌曲向大合唱、前线抒情和爱国史诗靠近，德国士兵歌和广播娱乐也被战局压出更暗的底色。音乐发展在这里跟战争强度几乎同步变化。',
    en: 'The Eastern Front made the emotional center of music heavier. Soviet song moved toward mass chorus, frontline lyricism, and patriotic epic, while German soldier songs and radio entertainment took on a darker tone under battlefield pressure. Musical development here changes almost in step with the intensity of war.',
  },
  'pearl-harbor': {
    zh: '珍珠港之后，美国流行音乐的传播范围突然扩大。摇摆乐、布吉、和声女声组合和爱国流行歌跟着军队、V-Disc 和广播走向海外，音乐发展从国内舞厅文化转向跨战区的盟军声音。',
    en: 'After Pearl Harbor, the reach of American popular music widened suddenly. Swing, boogie, close-harmony groups, and patriotic pop traveled overseas through troops, V-Discs, and radio, moving musical development from domestic dance-hall culture toward a cross-theater Allied sound.',
  },
  stalingrad: {
    zh: '斯大林格勒之后，歌曲里的“胜利”“牺牲”和“家园”变得更强烈。苏联前线歌曲更庄严，也保留私人离别的抒情；德国娱乐广播则越来越像是在勉强维持士气。战局转折直接改变了音乐的情绪方向。',
    en: 'After Stalingrad, victory, sacrifice, and homeland became stronger inside songs. Soviet frontline music grew more solemn while keeping private lyric feeling; German entertainment radio increasingly sounded like an effort to hold morale together. The military turning point changed the emotional direction of music.',
  },
  'liberation-paris': {
    zh: '巴黎解放让音乐从占领时期的压抑重新流向街头、俱乐部和舞台。香颂、爵士和共和国歌曲一起出现，说明战后音乐风潮不是简单复原，而是在解放、记忆和盟军接触中重新组合。',
    en: 'The Liberation of Paris moved music out of the compressed occupation years and back into streets, clubs, and stages. Chanson, jazz, and republican song appeared together, showing that postwar music did not simply return to normal; it recombined through liberation, memory, and Allied contact.',
  },
  'germany-surrender': {
    zh: '德国投降后，音乐发展的方向被重新打开。去纳粹化广播、爵士回归、流亡音乐和古典重建同时出现，说明战后欧洲音乐不只是庆祝胜利，也在重新决定哪些声音可以进入公共生活。',
    en: 'After Germany surrendered, musical development reopened in several directions. Denazified broadcasting, jazz’s return, exile music, and classical rebuilding appeared together, showing that postwar European music was not only celebrating victory but deciding which sounds could reenter public life.',
  },
  'japan-surrender': {
    zh: '日本投降后，战时国策歌谣很快退后，爵士、布吉和电影歌曲进入城市舞台。音乐风潮的变化很明显：从纪律化、动员性的声音，转向占领期都市娱乐和战后重新开始的流行感。',
    en: 'After Japan surrendered, wartime policy songs quickly receded while jazz, boogie, and film songs entered the urban stage. The musical trend is clear: disciplined mobilization sound gave way to occupation-era entertainment and a postwar sense of restart.',
  },
  'marshall-broadcast': {
    zh: '马歇尔援助把经济重建和音乐流通连在一起。唱片、广播格式、美国爵士和流行歌进入西欧市场，说明战后音乐发展越来越受跨大西洋产业、消费文化和技术更新影响。',
    en: 'Marshall Aid links economic rebuilding with musical circulation. Records, broadcast formats, American jazz, and popular song entered Western European markets, showing how postwar musical development was increasingly shaped by transatlantic industry, consumer culture, and technical renewal.',
  },
  'prc-founding': {
    zh: '中华人民共和国成立后，抗战时期的群众歌曲、合唱和电影歌曲经验被放进新的国家声音里。音乐风潮从救亡动员转向建国叙事，但很多旋律、合唱方式和广播传播习惯都延续了下来。',
    en: 'After the founding of the PRC, wartime mass songs, chorus, and film-song experience were placed inside a new state sound. The musical trend moved from resistance mobilization toward state-building narrative, but many melodies, choral habits, and broadcasting practices continued.',
  },
}

function withResearchFrame(eventId: string, event: EventEnhancement): EventEnhancement {
  const developmentFrame = musicDevelopmentFrames[eventId]

  return {
    ...event,
    longDescriptionZh: `${event.longDescriptionZh ?? ''} 我在这个事件页主要问三个问题：谁在安排这些音乐，它通过广播、唱片、电影、集会或军队怎么传开，听众当时可能把它听成动员、安慰、抵抗还是重建。`,
    longDescriptionEn: `${event.longDescriptionEn ?? ''} On this event page I mainly ask three questions: who arranged the music, how it spread through radio, records, film, rallies, or troops, and whether listeners might have heard it as mobilization, comfort, resistance, or rebuilding.`,
    musicImpactZh: `${event.musicImpactZh ?? ''} ${developmentFrame?.zh ?? ''}`.trim(),
    musicImpactEn: `${event.musicImpactEn ?? ''} ${developmentFrame?.en ?? ''}`.trim(),
  }
}

export const eventEnhancementsById: Record<string, EventEnhancement> = Object.fromEntries(
  Object.entries(baseEventEnhancementsById).map(([eventId, event]) => [eventId, withResearchFrame(eventId, event)]),
) as Record<string, EventEnhancement>
