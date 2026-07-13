import { publicAssetPath } from '@/lib/publicAssets'

export interface LocalizedText {
  zh: string
  en: string
}

interface TrainingMetric {
  id: string
  value: string
  label: LocalizedText
  detail: LocalizedText
}

interface TrainingWorkflowStat {
  label: LocalizedText
  value: string
}

interface TrainingWorkflowStep {
  id: string
  stepNumber: string
  title: LocalizedText
  summary: LocalizedText
  command: string
  inputs: string[]
  outputs: string[]
  stats: TrainingWorkflowStat[]
}

interface AceDatasetProfile {
  id: string
  sampleCount: string
  label: LocalizedText
  filters: LocalizedText
}

export interface TrainingSample {
  id: string
  songId: string
  title: LocalizedText
  country: LocalizedText
  category: string
  context: string
  durationSec: number
  qualityScore: number
  caption: LocalizedText
  audioSrc: string
  sourceUrl: string
  cleanedPath: string
  sensitive?: boolean
  sensitivityLabel?: LocalizedText
}

interface TrainingFigure {
  id: string
  src: string
  alt: LocalizedText
  title: LocalizedText
}

interface FineTuneModelHighlight {
  id: string
  value: string
  label: LocalizedText
  detail: LocalizedText
}

interface FineTuneSourceLink {
  id: string
  href: string
  label: LocalizedText
}

interface FineTuneWorkflowStep {
  id: string
  stepNumber: string
  src: string
  alt: LocalizedText
  title: LocalizedText
  summary: LocalizedText
  notes: LocalizedText[]
}

export const trainingMetrics: TrainingMetric[] = [
  {
    id: 'ace-samples',
    value: '365',
    label: { zh: 'ACE 样本', en: 'ACE samples' },
    detail: { zh: '清洗后放进练习数据集', en: 'Cleaned for the practice dataset' },
  },
  {
    id: 'countries',
    value: '14',
    label: { zh: '国家/地区', en: 'countries' },
    detail: { zh: '按国家和战时语境分组', en: 'Grouped by country and wartime context' },
  },
  {
    id: 'hours',
    value: '11.8h',
    label: { zh: '可用音频', en: 'usable audio' },
    detail: { zh: '去重、切片、统一音量后统计', en: 'After dedupe, slicing, and level checks' },
  },
  {
    id: 'labels',
    value: '7',
    label: { zh: '音乐类别', en: 'music labels' },
    detail: { zh: '包括宣传、抵抗、后方和流行歌', en: 'Includes propaganda, resistance, home front, and popular songs' },
  },
  {
    id: 'reviewed',
    value: '91%',
    label: { zh: '人工复核', en: 'human reviewed' },
    detail: { zh: '保留来源链接与敏感内容标记', en: 'Source links and sensitive flags retained' },
  },
]

export const trainingWorkflowSteps: TrainingWorkflowStep[] = [
  {
    id: 'inventory',
    stepNumber: '01',
    title: { zh: '输入清点', en: 'Input inventory' },
    summary: {
      zh: '先把原始音乐包、来源表和人工备注扫一遍，给每首歌建立候选记录。',
      en: 'First scan the raw audio packages, source sheets, and my notes into candidate song records.',
    },
    command: 'python tools/inventory_audio.py raw_archive/ --emit data/raw_manifest.json',
    inputs: ['raw_archive/**/*.mp3', 'raw_archive/**/*.ogg', 'source_notes.csv'],
    outputs: ['data/raw_manifest.json', 'reports/missing_sources.csv'],
    stats: [
      { label: { zh: '候选曲目', en: 'Candidate songs' }, value: '428' },
      { label: { zh: '来源记录', en: 'Source records' }, value: '392' },
    ],
  },
  {
    id: 'rights-context',
    stepNumber: '02',
    title: { zh: '来源与语境复核', en: 'Source and context review' },
    summary: {
      zh: '保留 archive-record 链接、权利说明和敏感历史材料标签，避免样本脱离历史语境。',
      en: 'Keep archive-record links, rights notes, and sensitive-history labels so samples do not lose context.',
    },
    command: 'node scripts/validate-sources.mjs data/raw_manifest.json --strict',
    inputs: ['data/raw_manifest.json', 'public/audio/events/LICENSES.md'],
    outputs: ['data/source_review.json', 'reports/sensitive_context.md'],
    stats: [
      { label: { zh: '敏感样本', en: 'Sensitive samples' }, value: '18' },
      { label: { zh: '可追溯率', en: 'Traceable rate' }, value: '91%' },
    ],
  },
  {
    id: 'clean-audio',
    stepNumber: '03',
    title: { zh: '音频清洗', en: 'Audio cleaning' },
    summary: {
      zh: '统一采样率，裁掉明显空白段，再把音量拉到接近的范围，生成 cleaned_audio。',
      en: 'Set a common sample rate, trim obvious silence, and level volume into the cleaned_audio folder.',
    },
    command: 'python tools/clean_audio.py data/source_review.json --target-lufs -18',
    inputs: ['data/source_review.json', 'raw_archive/audio'],
    outputs: ['cleaned_audio/**/*.ogg', 'data/audio_quality.json'],
    stats: [
      { label: { zh: '中位时长', en: 'Median length' }, value: '1:42' },
      { label: { zh: '通过质量线', en: 'Passed quality bar' }, value: '365' },
    ],
  },
  {
    id: 'segment-label',
    stepNumber: '04',
    title: { zh: '切片与标签', en: 'Segment and label' },
    summary: {
      zh: '把歌曲切成可用片段，并把国家、类别、语境、年份和来源写进记录。',
      en: 'Cut songs into usable passages and attach country, category, context, year, and source details.',
    },
    command: 'python tools/build_ace_records.py cleaned_audio/ --schema ace-step-1.5',
    inputs: ['cleaned_audio/**/*.ogg', 'data/audio_quality.json'],
    outputs: ['data/ace_step_1_5.jsonl', 'data/ace_dataset_summary.json'],
    stats: [
      { label: { zh: 'JSONL 记录', en: 'JSONL records' }, value: '365' },
      { label: { zh: '平均质量分', en: 'Average quality' }, value: '0.84' },
    ],
  },
  {
    id: 'evaluation',
    stepNumber: '05',
    title: { zh: '抽样评估', en: 'Sample evaluation' },
    summary: {
      zh: '最后人工听一遍，再用图表看国家、类别和时长分布，挑出页面里的 8 个试听样本。',
      en: 'Finally, listen by hand and use charts to check country, category, and duration balance, then choose the 8 previews shown here.',
    },
    command: 'npm run build:pages && python tools/render_training_figures.py',
    inputs: ['data/ace_dataset_summary.json', 'data/ace_step_1_5.jsonl'],
    outputs: ['public/images/training-data/*.png', 'public/audio/training-samples/*.ogg'],
    stats: [
      { label: { zh: '检查图表', en: 'Check charts' }, value: '4' },
      { label: { zh: '试听样本', en: 'Preview clips' }, value: '8' },
    ],
  },
]

export const aceDatasetProfiles: AceDatasetProfile[] = [
  {
    id: 'resistance_context',
    sampleCount: '112',
    label: { zh: '抵抗与动员', en: 'Resistance and mobilization' },
    filters: {
      zh: '把抵抗歌曲、抗战歌曲和地下传播语境放在一起看。',
      en: 'Resistance songs, anti-invasion music, and underground circulation are checked together.',
    },
  },
  {
    id: 'home_front',
    sampleCount: '86',
    label: { zh: '后方情绪', en: 'Home front morale' },
    filters: {
      zh: '看广播、慰问演出和战时流行歌里比较日常的情绪。',
      en: 'Looks at everyday feeling in broadcasts, troop entertainment, and wartime popular songs.',
    },
  },
  {
    id: 'sensitive_history',
    sampleCount: '18',
    label: { zh: '敏感历史材料', en: 'Sensitive historical material' },
    filters: {
      zh: '只在研究语境保留，并必须带来源和警示标签。',
      en: 'Kept only in a research context, with source and warning labels required.',
    },
  },
  {
    id: 'cross_cultural',
    sampleCount: '149',
    label: { zh: '跨文化传播', en: 'Cross-cultural circulation' },
    filters: {
      zh: '看旋律、译配、翻唱和盟军广播之间怎样流动。',
      en: 'Checks how melodies, translations, covers, and Allied broadcasts moved.',
    },
  },
]

const rawTrainingSamples: TrainingSample[] = [
  {
    id: 'CN_0002_clip001',
    songId: 'song-of-the-guerrillas',
    title: { zh: '游击队歌', en: 'Song of the Guerrillas' },
    country: { zh: '中国', en: 'China' },
    category: 'resistance_song',
    context: 'Allied',
    durationSec: 64,
    qualityScore: 0.91,
    caption: {
      zh: '短促节奏和群体合唱很清楚，适合作为中文抗战歌曲样本。',
      en: 'The brisk rhythm and collective chorus are clear, making this a useful Chinese resistance-song sample.',
    },
    audioSrc: '/audio/training-samples/song-of-the-guerrillas.ogg',
    sourceUrl: 'https://archive.org/details/fry188_yahoo_201504',
    cleanedPath: 'cleaned_audio/CN/song-of-the-guerrillas_clip001.ogg',
  },
  {
    id: 'SU_0004_clip001',
    songId: 'the-sacred-war',
    title: { zh: '神圣的战争', en: 'The Sacred War' },
    country: { zh: '苏联', en: 'Soviet Union' },
    category: 'march',
    context: 'Allied',
    durationSec: 72,
    qualityScore: 0.87,
    caption: {
      zh: '低声部合唱和进行曲脉冲明显，适合检查模型能不能分辨东线动员歌曲。',
      en: 'The low chorus and march pulse are clear, so I use it to check whether the model can recognize Eastern Front mobilization songs.',
    },
    audioSrc: '/audio/training-samples/the-sacred-war.ogg',
    sourceUrl: 'https://archive.org/details/lp_russian-songs_sostri-fodorowi',
    cleanedPath: 'cleaned_audio/SU/the-sacred-war_clip001.ogg',
  },
  {
    id: 'JP_0007_clip001',
    songId: 'aikoku-koshinkyoku',
    title: { zh: '爱国进行曲', en: 'Aikoku Koshinkyoku' },
    country: { zh: '日本', en: 'Japan' },
    category: 'propaganda_song',
    context: 'Axis',
    durationSec: 66,
    qualityScore: 0.78,
    caption: {
      zh: '作为敏感历史材料保留，只用来检查军国主义宣传音乐有没有被明确标注。',
      en: 'Kept as sensitive historical material only to check whether militarist propaganda music is clearly labeled.',
    },
    audioSrc: '/audio/training-samples/aikoku-koshinkyoku.ogg',
    sourceUrl: 'https://archive.org/details/TaiatariSeishin',
    cleanedPath: 'cleaned_audio/JP/aikoku-koshinkyoku_clip001.ogg',
    sensitive: true,
    sensitivityLabel: {
      zh: '敏感历史材料：日本军国主义',
      en: 'Sensitive historical material: Japanese militarism',
    },
  },
  {
    id: 'UK_0003_clip001',
    songId: 'yours',
    title: { zh: 'Yours', en: 'Yours' },
    country: { zh: '英国', en: 'United Kingdom' },
    category: 'wartime_popular_song',
    context: 'Home Front',
    durationSec: 58,
    qualityScore: 0.83,
    caption: {
      zh: '这类亲密的流行演唱能和大型合唱、进行曲形成对照，帮我看后方情绪。',
      en: 'This intimate popular vocal contrasts with big choruses and marches, helping me check home-front feeling.',
    },
    audioSrc: '/audio/training-samples/yours.ogg',
    sourceUrl: 'https://archive.org/search?query=title%3A%28Yours%29%20Vera%20Lynn',
    cleanedPath: 'cleaned_audio/UK/yours_clip001.ogg',
  },
  {
    id: 'DE_0005_clip001',
    songId: 'bombs-on-england',
    title: { zh: 'Bomben auf Engeland', en: 'Bombs on England' },
    country: { zh: '德国', en: 'Germany' },
    category: 'propaganda_song',
    context: 'Axis',
    durationSec: 62,
    qualityScore: 0.74,
    caption: {
      zh: '作为纳粹宣传语境样本保留，页面必须显示敏感材料说明。',
      en: 'Kept as a Nazi-propaganda context sample, with sensitive-material labeling required on the page.',
    },
    audioSrc: '/audio/training-samples/bombs-on-england.ogg',
    sourceUrl: 'https://archive.org/search?query=%22Bomben%20auf%20Engeland%22',
    cleanedPath: 'cleaned_audio/DE/bombs-on-england_clip001.ogg',
    sensitive: true,
    sensitivityLabel: {
      zh: '敏感历史材料：纳粹材料',
      en: 'Sensitive historical material: Nazi material',
    },
  },
  {
    id: 'FR_0006_clip001',
    songId: 'jattendrai',
    title: { zh: "J'attendrai", en: "J'attendrai" },
    country: { zh: '法国', en: 'France' },
    category: 'wartime_popular_song',
    context: 'Home Front',
    durationSec: 70,
    qualityScore: 0.86,
    caption: {
      zh: '等待主题很明显，适合检查不同语言里的战时离别情绪。',
      en: 'The waiting theme is obvious, so it helps check wartime separation across languages.',
    },
    audioSrc: '/audio/training-samples/jattendrai.ogg',
    sourceUrl: 'https://archive.org/details/ka-87-gisele-mackenzie-jattendrai',
    cleanedPath: 'cleaned_audio/FR/jattendrai_clip001.ogg',
  },
  {
    id: 'IT_0008_clip001',
    songId: 'bella-ciao',
    title: { zh: 'Bella Ciao', en: 'Bella Ciao' },
    country: { zh: '意大利', en: 'Italy' },
    category: 'resistance_song',
    context: 'Resistance',
    durationSec: 56,
    qualityScore: 0.88,
    caption: {
      zh: '这个抵抗歌曲样本能看到民间旋律、政治语境和后期传播连在一起。',
      en: 'This resistance-song sample shows folk melody, political context, and later circulation in one place.',
    },
    audioSrc: '/audio/training-samples/bella-ciao.ogg',
    sourceUrl: 'https://archive.org/details/bella-ciao_202210',
    cleanedPath: 'cleaned_audio/IT/bella-ciao_clip001.ogg',
  },
  {
    id: 'US_0009_clip001',
    songId: 'when-the-lights-go-on-again',
    title: { zh: 'When the Lights Go On Again', en: 'When the Lights Go On Again' },
    country: { zh: '美国', en: 'United States' },
    category: 'home_front_song',
    context: 'Home Front',
    durationSec: 61,
    qualityScore: 0.85,
    caption: {
      zh: '“灯光重新亮起”的意象很直接，适合检查后方对战争结束的想象。',
      en: 'The image of lights returning is direct, making it useful for checking home-front hopes about the war ending.',
    },
    audioSrc: '/audio/training-samples/when-the-lights-go-on-again.ogg',
    sourceUrl: 'https://archive.org/details/big-bands-world-war-ii',
    cleanedPath: 'cleaned_audio/US/when-the-lights-go-on-again_clip001.ogg',
  },
]

export const trainingSamples: TrainingSample[] = rawTrainingSamples.map((sample) => ({
  ...sample,
  audioSrc: publicAssetPath(sample.audioSrc),
}))

const rawTrainingFigures: TrainingFigure[] = [
  {
    id: 'duration',
    src: '/images/training-data/audio_duration_distribution.png',
    alt: {
      zh: '训练音频时长分布图',
      en: 'Distribution chart of training audio durations',
    },
    title: { zh: '音频时长分布', en: 'Audio duration distribution' },
  },
  {
    id: 'countries',
    src: '/images/training-data/songs_by_country.png',
    alt: {
      zh: '按国家统计的歌曲数量柱状图',
      en: 'Bar chart of songs by country',
    },
    title: { zh: '国家覆盖', en: 'Country coverage' },
  },
  {
    id: 'categories',
    src: '/images/training-data/songs_by_category.png',
    alt: {
      zh: '按音乐类别统计的歌曲数量图',
      en: 'Chart of songs by music category',
    },
    title: { zh: '类别分布', en: 'Category spread' },
  },
  {
    id: 'profile-counts',
    src: '/images/training-data/ace_dataset_sample_counts.png',
    alt: {
      zh: 'ACE 数据集样本数量统计图',
      en: 'ACE dataset sample count chart',
    },
    title: { zh: 'ACE 样本数量', en: 'ACE sample counts' },
  },
]

export const trainingFigures: TrainingFigure[] = rawTrainingFigures.map((figure) => ({
  ...figure,
  src: publicAssetPath(figure.src),
}))

export const fineTuneModelHighlights: FineTuneModelHighlight[] = [
  {
    id: 'model',
    value: 'ACE-Step 1.5',
    label: { zh: '开源音乐基础模型', en: 'Open music foundation model' },
    detail: {
      zh: '官方模型卡把它定位为面向音乐生成的 text-to-audio/text2music 模型。',
      en: 'The official model card frames it as a text-to-audio/text2music model for music generation.',
    },
  },
  {
    id: 'license',
    value: 'MIT',
    label: { zh: '商用友好许可', en: 'Commercial-friendly license' },
    detail: {
      zh: '模型卡强调合规训练数据，并标注 MIT 许可。',
      en: 'The model card emphasizes legally compliant training data and lists an MIT license.',
    },
  },
  {
    id: 'architecture',
    value: 'LM + DiT',
    label: { zh: '规划器与扩散生成', en: 'Planner plus diffusion' },
    detail: {
      zh: 'LM 先把提示扩展成歌曲蓝图，再由 Diffusion Transformer 生成音乐。',
      en: 'An LM expands prompts into song blueprints before a Diffusion Transformer generates music.',
    },
  },
  {
    id: 'local',
    value: '<4GB',
    label: { zh: '本地低显存运行', en: 'Low-VRAM local use' },
    detail: {
      zh: '官方说明强调消费级硬件可运行，适合做小规模适配器实验。',
      en: 'The official notes highlight consumer-hardware use, which fits small adapter experiments.',
    },
  },
]

export const fineTuneSourceLinks: FineTuneSourceLink[] = [
  {
    id: 'model-card',
    href: 'https://huggingface.co/ACE-Step/Ace-Step1.5',
    label: { zh: 'Hugging Face 模型卡', en: 'Hugging Face model card' },
  },
  {
    id: 'project',
    href: 'https://ace-step.github.io/ace-step-v1.5.github.io/',
    label: { zh: 'ACE-Step 1.5 官网', en: 'ACE-Step 1.5 project site' },
  },
]

export const fineTuneWorkflowSteps: FineTuneWorkflowStep[] = [
  {
    id: 'scan-dataset',
    stepNumber: '01',
    src: publicAssetPath('/images/fine_tune_image/step1.png'),
    alt: {
      zh: 'ACE-Step LoRA 数据集构建器扫描音频目录并列出 49 个音频文件',
      en: 'ACE-Step LoRA dataset builder scanning an audio directory and listing 49 audio files',
    },
    title: { zh: '扫描二战音乐切片', en: 'Scan the WWII music clips' },
    summary: {
      zh: '先把清洗后的 ww2_military_march 目录交给数据集构建器，让工具读取音频、时长、caption 和标签状态。',
      en: 'I first point the dataset builder at the cleaned ww2_military_march folder so it can read audio, duration, captions, and label status.',
    },
    notes: [
      { zh: '识别出 49 个音频文件，作为这次小样本适配器训练的输入。', en: '49 audio files were detected as the input set for this small adapter run.' },
      { zh: '保留 “All Instrumental” 设置，让模型学习时代音色和编配，而不是歌词。', en: 'The run keeps the instrumental setting so the adapter learns period tone and arrangement rather than lyrics.' },
    ],
  },
  {
    id: 'preview-edit',
    stepNumber: '02',
    src: publicAssetPath('/images/fine_tune_image/2.png'),
    alt: {
      zh: '预览和编辑单个训练样本的波形、caption、genre、BPM、key 和 duration',
      en: 'Previewing and editing a training sample waveform, caption, genre, BPM, key, and duration',
    },
    title: { zh: '逐条试听并改标签', en: 'Preview and edit each record' },
    summary: {
      zh: '用波形和播放控件抽查样本，再把 caption、Genre、BPM、Key、拍号和时长补齐。',
      en: 'The waveform/player is used for spot checks, then caption, genre, BPM, key, time signature, and duration are completed.',
    },
    notes: [
      { zh: 'caption 用英文描述“1940s China / Germany soldier song”等时代风格线索。', en: 'Captions capture period-style clues such as 1940s China or Germany soldier-song context.' },
      { zh: '敏感历史素材只作为研究数据进入流程，页面仍保留语境说明。', en: 'Sensitive historical material stays framed as research data, with context kept on the page.' },
    ],
  },
  {
    id: 'save-dataset',
    stepNumber: '03',
    src: publicAssetPath('/images/fine_tune_image/3.png'),
    alt: {
      zh: '保存 ACE-Step LoRA 数据集 JSON 文件，状态显示 49 samples',
      en: 'Saving the ACE-Step LoRA dataset JSON file with a 49-sample status',
    },
    title: { zh: '保存 LoRA 数据集 JSON', en: 'Save the LoRA dataset JSON' },
    summary: {
      zh: '确认 49 条样本后保存为 my_lora_dataset.json，给后面的预处理和训练复用。',
      en: 'After confirming the 49 records, the dataset is saved as my_lora_dataset.json for preprocessing and training.',
    },
    notes: [
      { zh: 'JSON 记录把文件路径、caption、音乐属性和训练开关固定下来。', en: 'The JSON keeps file paths, captions, music attributes, and training switches together.' },
      { zh: '这一步相当于把人工复核结果封存成可复现的数据清单。', en: 'This step freezes the human-reviewed set into a reproducible manifest.' },
    ],
  },
  {
    id: 'preprocess-tensors',
    stepNumber: '04',
    src: publicAssetPath('/images/fine_tune_image/4.png'),
    alt: {
      zh: 'ACE-Step 预处理页面将数据集转换成预计算 tensor',
      en: 'ACE-Step preprocessing page converting the dataset into precomputed tensors',
    },
    title: { zh: '预处理为训练 tensor', en: 'Preprocess into training tensors' },
    summary: {
      zh: 'ACE-Step 训练前先把音频编码成 VAE latents，把 caption 和歌词编码成文本 embedding，并保存为 .pt tensor。',
      en: 'Before training, ACE-Step encodes audio into VAE latents, captions/lyrics into text embeddings, and saves them as .pt tensors.',
    },
    notes: [
      { zh: '预处理能减少训练时重复编码，适合小显存环境。', en: 'Preprocessing avoids repeated encoding during training and helps on smaller VRAM setups.' },
      { zh: '这里选择 LoKr 方向，输出到 preprocessed_tensors 目录。', en: 'This run targets LoKr and writes the prepared files into preprocessed_tensors.' },
    ],
  },
  {
    id: 'train-lokr',
    stepNumber: '05',
    src: publicAssetPath('/images/fine_tune_image/5.png'),
    alt: {
      zh: 'ACE-Step LoKr 训练参数页面显示 49 个预处理 tensor 和 dim alpha 参数',
      en: 'ACE-Step LoKr training settings showing 49 preprocessed tensors plus dim and alpha controls',
    },
    title: { zh: '设置 LoKr 适配器训练', en: 'Configure LoKr adapter training' },
    summary: {
      zh: '载入 49 个预处理 tensor 后，设置 LoKr dim、alpha、学习率、epoch、batch size 和梯度累积。',
      en: 'After loading the 49 preprocessed tensors, LoKr dim, alpha, learning rate, epochs, batch size, and gradient accumulation are configured.',
    },
    notes: [
      { zh: '截图中使用 dim 64、alpha 128、学习率 0.001、batch size 1。', en: 'The screenshot shows dim 64, alpha 128, learning rate 0.001, and batch size 1.' },
      { zh: 'LoKr/LoRA 思路是训练轻量适配器，不直接重训整个 ACE-Step 模型。', en: 'LoKr/LoRA trains a lightweight adapter instead of retraining the full ACE-Step model.' },
    ],
  },
  {
    id: 'training-result',
    stepNumber: '06',
    src: publicAssetPath('/images/fine_tune_image/6.png'),
    alt: {
      zh: '训练日志显示 200 个 epoch 完成，loss 曲线收敛并保存 final LoRA',
      en: 'Training log showing 200 epochs complete, a converged loss curve, and final LoRA saved',
    },
    title: { zh: '完成训练并检查 loss', en: 'Finish training and inspect loss' },
    summary: {
      zh: '训练跑到 200 epoch / 5000 step 后保存 final 适配器，总耗时 47 分 29 秒，loss 曲线快速下降后趋稳。',
      en: 'Training reaches 200 epochs / 5000 steps, saves the final adapter, and finishes in 47m 29s with the loss curve dropping then flattening.',
    },
    notes: [
      { zh: '这说明流程已经从数据集构建、预处理走到可加载的适配器产物。', en: 'That confirms the run moved from dataset building and preprocessing into a loadable adapter artifact.' },
      { zh: '下一步可以用相同 prompt 对比原模型与适配器输出的年代感。', en: 'The next check is comparing base-model and adapter outputs with the same prompts for period character.' },
    ],
  },
]
