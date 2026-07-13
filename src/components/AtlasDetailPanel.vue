<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ArtistMarker } from '@/data/atlasMarkers'
import type { AudioClip, ChapterScene, HistoricEvent, Language, RelatedSong, SourceReference, StylePhase } from '@/data/ww2MusicAtlas'
import {
  getBibliographySections,
  getArtistRole,
  getArtistWorkNote,
  getFeaturedArtistsForContext,
  getChapterSummary,
  getChapterTitle,
  getCountryName,
  getEventTitle,
  getStyleName,
  getStyleSummary,
  type CountryDetail,
  type DetailSourceGroup,
} from '@/lib/atlas'
import { dispatchSourceAudioState } from '@/lib/audioBus'
import { getStylePaletteLabel, resolveStylePalette, STYLE_PALETTES, type StylePaletteKey } from '@/lib/stylePalette'

const props = defineProps<{
  activeArtist: ArtistMarker | null
  activeYear: number
  activeChapter: ChapterScene
  activeEvent: HistoricEvent | null
  language: Language
  countryDetails: CountryDetail[]
  sourceGroups: DetailSourceGroup[]
}>()

const activeTab = ref<'overview' | 'sources'>('overview')
const showBibliography = ref(false)
const audioFailures = ref<string[]>([])

const bibliography = computed(() => getBibliographySections())
const hasSources = computed(() => props.sourceGroups.length > 0)
const linkedArtists = computed(() =>
  getFeaturedArtistsForContext({
    activeEvent: props.activeEvent,
    countryDetails: props.countryDetails,
    activeYear: props.activeYear,
    limit: 6,
  }),
)

const activePaletteKeys = computed(() => {
  return new Set(
    props.countryDetails
      .map((item) => item.phase)
      .filter((phase): phase is StylePhase => Boolean(phase))
      .map((phase) => resolveStylePalette(phase).key),
  )
})

watch(hasSources, (value) => {
  if (!value && activeTab.value === 'sources') {
    activeTab.value = 'overview'
  }
})

watch(
  () => props.sourceGroups.map((group) => group.id).join('|'),
  () => {
    audioFailures.value = []
  },
)

function getPhasePalette(phase: StylePhase | null) {
  return resolveStylePalette(phase)
}

function isPaletteActive(key: StylePaletteKey) {
  return activePaletteKeys.value.has(key)
}

function getEntityLabel(group: DetailSourceGroup) {
  if (group.entityType === 'artist') {
    return props.language === 'zh' ? '艺术家资料' : 'Artist dossier'
  }

  if (group.entityType === 'event') {
    return props.language === 'zh' ? '历史事件' : 'Historic event'
  }

  return props.language === 'zh' ? '国家风格阶段' : 'Country style phase'
}

function getEntityTone(group: DetailSourceGroup) {
  if (group.entityType === 'artist') {
    return 'artist'
  }

  if (group.entityType === 'event') {
    return 'event'
  }

  return 'phase'
}

function getGroupSummary(group: DetailSourceGroup) {
  return props.language === 'zh' ? group.summaryZh : group.summaryEn
}

function getSourceNote(source: SourceReference) {
  return props.language === 'zh' ? source.noteZh : source.noteEn
}

function getClipNote(clip: AudioClip) {
  return props.language === 'zh' ? clip.noteZh : clip.noteEn
}

function getEventLongDescription(event: HistoricEvent) {
  return props.language === 'zh'
    ? event.longDescriptionZh ?? event.descriptionZh
    : event.longDescriptionEn ?? event.descriptionEn
}

function getEventMusicImpact(event: HistoricEvent) {
  return props.language === 'zh' ? event.musicImpactZh : event.musicImpactEn
}

function getEventImageAlt(event: HistoricEvent) {
  if (!event.image) {
    return ''
  }

  return props.language === 'zh' ? event.image.altZh : event.image.altEn
}

function getEventImageCaption(event: HistoricEvent) {
  if (!event.image) {
    return ''
  }

  return props.language === 'zh' ? event.image.captionZh : event.image.captionEn
}

function getSongNote(song: RelatedSong) {
  return props.language === 'zh' ? song.noteZh : song.noteEn
}

function getSongContext(song: RelatedSong) {
  return props.language === 'zh' ? song.contextZh : song.contextEn
}

function getSongEventRelation(song: RelatedSong) {
  return props.language === 'zh' ? song.eventRelationZh : song.eventRelationEn
}

function getSongListeningGuide(song: RelatedSong) {
  return props.language === 'zh' ? song.listeningGuideZh : song.listeningGuideEn
}

function getSongKey(song: RelatedSong) {
  return `${song.title}:${song.year}`
}

function getWorkStatus(work: { streamUrl?: string }) {
  return work.streamUrl
    ? props.language === 'zh'
      ? '可播放'
      : 'Playable'
    : props.language === 'zh'
      ? '资料链接'
      : 'Source link'
}

function getSongStatus(song: RelatedSong) {
  const songKey = getSongKey(song)

  if (audioFailures.value.includes(songKey)) {
    return props.language === 'zh' ? '播放失败，已切换到来源链接。' : 'Playback failed. Use the source link instead.'
  }

  return song.streamUrl
    ? props.language === 'zh'
      ? '本地播放'
      : 'Local playback'
    : props.language === 'zh'
      ? '档案外链'
      : 'Archive link'
}

function getSongSensitivityLabel(song: RelatedSong) {
  if (song.sensitivity === 'sensitive-context') {
    return props.language === 'zh' ? '敏感历史材料' : 'Sensitive historical material'
  }

  if (song.sensitivity === 'resistance') {
    return props.language === 'zh' ? '抵抗歌曲' : 'Resistance song'
  }

  if (song.sensitivity === 'patriotic') {
    return props.language === 'zh' ? '爱国/士气歌曲' : 'Patriotic / morale song'
  }

  return props.language === 'zh' ? '研究样本' : 'Research sample'
}

function getAudioStatusLabel(group: DetailSourceGroup) {
  if (group.audioClips.length === 0 && group.relatedSongs.length === 0) {
    return props.language === 'zh' ? '暂无音频' : 'No audio'
  }

  return group.hasPlayableAudio
    ? props.language === 'zh'
      ? '可播放音频'
      : 'Playable audio'
    : props.language === 'zh'
      ? '仅原始记录'
      : 'Archive record only'
}

function getAudioCardStatus(clip: AudioClip) {
  if (audioFailures.value.includes(clip.id)) {
    return props.language === 'zh' ? '播放失败，已切换到原始记录。' : 'Playback failed. Open the original record instead.'
  }

  if (clip.streamUrl) {
    return props.language === 'zh' ? '可直接播放' : 'Playable in panel'
  }

  return props.language === 'zh' ? '当前仅提供馆藏记录' : 'Archive record only'
}

function handleAudioError(clipId: string) {
  if (!audioFailures.value.includes(clipId)) {
    audioFailures.value = [...audioFailures.value, clipId]
  }

  dispatchSourceAudioState({ active: false, clipId })
}

function handleRelatedSongError(song: RelatedSong) {
  handleAudioError(getSongKey(song))
}

function canPlayClip(clip: AudioClip) {
  return Boolean(clip.streamUrl) && !audioFailures.value.includes(clip.id)
}

function canPlaySong(song: RelatedSong) {
  return Boolean(song.streamUrl) && !audioFailures.value.includes(getSongKey(song))
}

function handleSourceAudioPlay(clipId: string) {
  dispatchSourceAudioState({ active: true, clipId })
}

function handleSourceAudioStop(clipId: string) {
  dispatchSourceAudioState({ active: false, clipId })
}
</script>

<template>
  <aside class="detail-panel" data-testid="detail-panel">
    <div class="panel-topbar">
      <div class="panel-tabs" role="tablist" :aria-label="language === 'zh' ? '详情标签' : 'Detail tabs'">
        <button
          id="tab-overview"
          class="panel-tab"
          :class="{ active: activeTab === 'overview' }"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'overview'"
          aria-controls="panel-overview"
          data-testid="tab-overview"
          @click="activeTab = 'overview'"
        >
          {{ language === 'zh' ? '概览' : 'Overview' }}
        </button>
        <button
          id="tab-sources"
          class="panel-tab"
          :class="{ active: activeTab === 'sources' }"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'sources'"
          aria-controls="panel-sources"
          data-testid="tab-sources"
          :disabled="!hasSources"
          @click="activeTab = 'sources'"
        >
          {{ language === 'zh' ? '来源' : 'Sources' }}
        </button>
      </div>

      <button
        class="bibliography-trigger"
        type="button"
        data-testid="bibliography-open"
        @click="showBibliography = true"
      >
        {{ language === 'zh' ? '查资料与书目' : 'Source check' }}
      </button>
    </div>

    <section
      v-if="activeTab === 'overview'"
      id="panel-overview"
      role="tabpanel"
      aria-labelledby="tab-overview"
      class="panel-stack"
    >
      <div v-if="activeArtist" class="panel-block artist-block" data-testid="artist-panel">
        <div class="section-chip section-chip--artist">
          {{ language === 'zh' ? '音乐家资料卡' : 'Artist dossier' }}
        </div>
        <div class="artist-profile-head">
          <img :src="activeArtist.portrait.src" :alt="language === 'zh' ? activeArtist.portrait.altZh : activeArtist.portrait.altEn">
          <div>
            <h2 class="chapter-title">{{ language === 'zh' ? activeArtist.nameZh : activeArtist.nameEn }}</h2>
            <p class="chapter-summary">
              {{
                language === 'zh'
                  ? activeArtist.summaryZh ?? activeArtist.noteZh
                  : activeArtist.summaryEn ?? activeArtist.noteEn
              }}
            </p>
          </div>
        </div>
        <p class="artist-role">{{ getArtistRole(activeArtist, language) }}</p>
        <p class="artist-meta">
          <span>{{ activeYear }}</span>
          <span>{{ activeArtist.startYear }}-{{ activeArtist.endYear }}</span>
          <span>{{ activeArtist.portrait.generated ? (language === 'zh' ? '生成式资料图' : 'Generated image') : activeArtist.portrait.licenseLabel }}</span>
        </p>
        <div class="work-list" data-testid="artist-representative-works">
          <p class="list-title">{{ language === 'zh' ? '代表作' : 'Representative works' }}</p>
          <article v-for="work in activeArtist.representativeWorks" :key="`${work.title}-${work.year}`" class="work-card">
            <div class="card-meta">
              <span class="meta-pill primary">{{ getWorkStatus(work) }}</span>
              <span>{{ work.year }}</span>
            </div>
            <h4>{{ work.title }}</h4>
            <p>{{ getArtistWorkNote(work, language) }}</p>
            <audio v-if="work.streamUrl" class="audio-player" controls preload="none" :src="work.streamUrl" />
            <a class="card-link" :href="work.sourceUrl" target="_blank" rel="noreferrer">
              {{ language === 'zh' ? '打开作品来源' : 'Open work source' }}
            </a>
          </article>
        </div>
      </div>

      <div class="panel-block">
        <p class="eyebrow">{{ activeYear }}</p>
        <h2 class="chapter-title">{{ getChapterTitle(activeChapter, language) }}</h2>
        <p class="chapter-summary">{{ getChapterSummary(activeChapter, language) }}</p>
      </div>

      <div v-if="activeEvent" class="panel-block">
        <p class="eyebrow">{{ language === 'zh' ? '重大事件' : 'Key Event' }}</p>
        <h3 class="event-title">{{ getEventTitle(activeEvent, language) }}</h3>
        <figure v-if="activeEvent.image" class="event-figure">
          <img :src="activeEvent.image.src" :alt="getEventImageAlt(activeEvent)" loading="lazy">
          <figcaption>
            <span v-if="getEventImageCaption(activeEvent)" class="event-image-caption">{{ getEventImageCaption(activeEvent) }}</span>
            <span>{{ activeEvent.image.credit }}</span>
            <a :href="activeEvent.image.sourceUrl" target="_blank" rel="noreferrer">
              {{ language === 'zh' ? '图片来源' : 'Image source' }}
            </a>
          </figcaption>
        </figure>
        <p class="event-copy">{{ getEventLongDescription(activeEvent) }}</p>
        <div v-if="getEventMusicImpact(activeEvent)" class="impact-note" data-testid="event-music-impact">
          <p class="list-title">{{ language === 'zh' ? '音乐风格影响' : 'Musical impact' }}</p>
          <p>{{ getEventMusicImpact(activeEvent) }}</p>
        </div>
        <div v-if="activeEvent.relatedSongs?.length" class="song-list" data-testid="event-related-songs">
          <p class="list-title">{{ language === 'zh' ? '相关歌曲' : 'Related songs' }}</p>
          <article v-for="song in activeEvent.relatedSongs" :key="getSongKey(song)" class="song-card">
            <div class="card-meta">
              <span class="meta-pill primary">{{ getSongStatus(song) }}</span>
              <span class="meta-pill meta-pill--soft">{{ getSongSensitivityLabel(song) }}</span>
              <span>{{ song.year }}</span>
            </div>
            <h4>{{ song.title }}</h4>
            <p class="card-subtitle">{{ song.performer }}</p>
            <p class="card-copy">{{ getSongNote(song) }}</p>
            <dl class="song-research">
              <div v-if="getSongContext(song)">
                <dt>{{ language === 'zh' ? '背景' : 'Context' }}</dt>
                <dd>{{ getSongContext(song) }}</dd>
              </div>
              <div v-if="getSongEventRelation(song)">
                <dt>{{ language === 'zh' ? '事件关系' : 'Event relation' }}</dt>
                <dd>{{ getSongEventRelation(song) }}</dd>
              </div>
              <div v-if="getSongListeningGuide(song)">
                <dt>{{ language === 'zh' ? '听觉提示' : 'Listening guide' }}</dt>
                <dd>{{ getSongListeningGuide(song) }}</dd>
              </div>
            </dl>
            <audio
              v-if="canPlaySong(song)"
              class="audio-player"
              controls
              preload="none"
              :src="song.streamUrl"
              @play="handleSourceAudioPlay(getSongKey(song))"
              @pause="handleSourceAudioStop(getSongKey(song))"
              @ended="handleSourceAudioStop(getSongKey(song))"
              @error="handleRelatedSongError(song)"
            />
            <div class="audio-links">
              <a class="card-link" :href="song.sourceUrl" target="_blank" rel="noreferrer">
                {{ language === 'zh' ? '打开歌曲来源' : 'Open song source' }}
              </a>
              <a v-if="song.rightsUrl" class="card-link ghost" :href="song.rightsUrl" target="_blank" rel="noreferrer">
                {{ language === 'zh' ? '权利说明' : 'Rights' }}
              </a>
            </div>
            <p class="rights-copy">{{ song.rightsLabel }}</p>
            <p v-if="song.audioCredit" class="rights-copy">{{ song.audioCredit }}</p>
          </article>
        </div>
        <div v-if="linkedArtists.length" class="linked-artist-list" data-testid="linked-artist-cards">
          <p class="list-title">{{ language === 'zh' ? '相关音乐家' : 'Linked artists' }}</p>
          <article v-for="artist in linkedArtists" :key="artist.id" class="mini-artist-card">
            <img :src="artist.portrait.src" :alt="language === 'zh' ? artist.portrait.altZh : artist.portrait.altEn">
            <div>
              <h4>{{ language === 'zh' ? artist.nameZh : artist.nameEn }}</h4>
              <p>{{ getArtistRole(artist, language) }}</p>
              <small>{{ artist.representativeWorks.slice(0, 2).map((work) => work.title).join(' / ') }}</small>
            </div>
          </article>
        </div>
      </div>

      <div v-if="countryDetails.length === 2" class="compare-grid" data-testid="compare-panel">
        <article v-for="item in countryDetails" :key="item.country.id" class="country-block">
          <p class="eyebrow">{{ getCountryName(item.country, language) }}</p>
          <template v-if="item.phase">
            <h3>{{ getStyleName(item.phase, language) }}</h3>
            <div class="palette-pill">
              <span class="palette-swatch" :style="{ '--swatch': getPhasePalette(item.phase).color, '--glow': getPhasePalette(item.phase).glow }" />
              <span>{{ getStylePaletteLabel(getPhasePalette(item.phase), language) }}</span>
            </div>
            <p>{{ getStyleSummary(item.phase, language) }}</p>
            <p class="list-title">{{ language === 'zh' ? '关键词' : 'Keywords' }}</p>
            <p class="inline-list">{{ item.phase.keywords.join(' / ') }}</p>
          </template>
        </article>
      </div>

      <article v-else-if="countryDetails[0]" class="panel-block country-block">
        <p class="eyebrow">{{ getCountryName(countryDetails[0].country, language) }}</p>
        <template v-if="countryDetails[0].phase">
          <h3>{{ getStyleName(countryDetails[0].phase, language) }}</h3>
          <div class="palette-pill">
            <span class="palette-swatch" :style="{ '--swatch': getPhasePalette(countryDetails[0].phase).color, '--glow': getPhasePalette(countryDetails[0].phase).glow }" />
            <span>{{ getStylePaletteLabel(getPhasePalette(countryDetails[0].phase), language) }}</span>
          </div>
          <p>{{ getStyleSummary(countryDetails[0].phase, language) }}</p>
          <p class="list-title">{{ language === 'zh' ? '代表人物' : 'Representative artists' }}</p>
          <p class="inline-list">{{ countryDetails[0].phase.representativeArtists.join(' / ') }}</p>
          <p class="list-title">{{ language === 'zh' ? '代表作品' : 'Representative works' }}</p>
          <p class="inline-list">{{ countryDetails[0].phase.representativeWorks.join(' / ') }}</p>
          <div class="linked-artist-list compact" data-testid="phase-linked-artists">
            <p class="list-title">{{ language === 'zh' ? '关联音乐家' : 'Linked artists' }}</p>
            <article v-for="artist in linkedArtists.filter((item) => item.countryId === countryDetails[0].country.id)" :key="artist.id" class="mini-artist-card">
              <img :src="artist.portrait.src" :alt="language === 'zh' ? artist.portrait.altZh : artist.portrait.altEn">
              <div>
                <h4>{{ language === 'zh' ? artist.nameZh : artist.nameEn }}</h4>
                <small>{{ artist.representativeWorks.slice(0, 2).map((work) => work.title).join(' / ') }}</small>
              </div>
            </article>
          </div>
        </template>
      </article>

      <div class="panel-block">
        <p class="eyebrow">{{ language === 'zh' ? '风格图例' : 'Style legend' }}</p>
        <div class="style-legend" data-testid="style-legend">
          <div
            v-for="palette in STYLE_PALETTES"
            :key="palette.key"
            class="style-legend__item"
            :class="{ active: isPaletteActive(palette.key) }"
          >
            <span class="palette-swatch" :style="{ '--swatch': palette.color, '--glow': palette.glow }" />
            <span>{{ getStylePaletteLabel(palette, language) }}</span>
          </div>
        </div>
      </div>

      <div class="panel-block">
        <p class="eyebrow">{{ language === 'zh' ? '阅读方式' : 'Reading mode' }}</p>
        <p class="legend-copy">
          {{
            language === 'zh'
              ? '点击艺术家地图钉可进入人物详情；切到 Sources 标签后，会按艺术家、事件和国家风格阶段的顺序展示档案出处与音频状态。'
              : 'Click an artist pin to focus a profile; the Sources tab then presents archival evidence and audio state in artist, event, and country-phase order.'
          }}
        </p>
      </div>
    </section>

    <section
      v-else
      id="panel-sources"
      role="tabpanel"
      aria-labelledby="tab-sources"
      class="panel-stack"
    >
      <div v-if="!hasSources" class="panel-block empty-state">
        <p class="eyebrow">{{ language === 'zh' ? '资料暂缺' : 'No materials yet' }}</p>
        <p class="legend-copy">
          {{
            language === 'zh'
              ? '当前视图还没有可展示的馆藏出处或音频片段。'
              : 'The current view does not expose archival references or audio clips yet.'
          }}
        </p>
      </div>

      <template v-else>
        <section
          v-for="group in sourceGroups"
          :key="group.id"
          class="panel-block source-group"
          :class="`source-group--${getEntityTone(group)}`"
          data-testid="source-group"
        >
          <div class="group-header">
            <div class="group-header__copy">
              <div class="section-chip" :class="`section-chip--${getEntityTone(group)}`">
                {{ getEntityLabel(group) }}
              </div>
              <h3>{{ language === 'zh' ? group.titleZh : group.titleEn }}</h3>
              <p v-if="getGroupSummary(group)" class="group-summary">{{ getGroupSummary(group) }}</p>
            </div>
            <div class="group-status">
              <span class="meta-pill primary">
                {{ group.sources.length }} {{ language === 'zh' ? '条来源' : 'sources' }}
              </span>
              <span class="meta-pill">
                {{ getAudioStatusLabel(group) }}
              </span>
            </div>
          </div>

          <div v-if="group.sources.length" class="card-stack">
            <article v-for="source in group.sources" :key="source.id" class="source-card">
              <div class="card-meta">
                <span class="meta-pill" :class="{ primary: source.isPrimary }">
                  {{ source.isPrimary ? (language === 'zh' ? '主来源' : 'Primary') : language === 'zh' ? '辅助来源' : 'Secondary' }}
                </span>
                <span class="meta-pill meta-pill--soft">{{ source.kind }}</span>
                <span>{{ source.year }}</span>
              </div>
              <h4>{{ source.title }}</h4>
              <p class="card-subtitle">{{ source.archiveOrAuthor }}</p>
              <p class="card-copy">{{ getSourceNote(source) }}</p>
              <a class="card-link" :href="source.url" target="_blank" rel="noreferrer">
                {{ language === 'zh' ? '打开原始来源' : 'Open archive record' }}
              </a>
            </article>
          </div>

          <div v-if="group.audioClips.length" class="card-stack">
            <article v-for="clip in group.audioClips" :key="clip.id" class="audio-card">
              <div class="card-meta">
                <span class="meta-pill primary">{{ language === 'zh' ? '音频片段' : 'Audio clip' }}</span>
                <span class="meta-pill meta-pill--soft">{{ getAudioCardStatus(clip) }}</span>
                <span>{{ clip.year }}</span>
              </div>
              <h4>{{ clip.title }}</h4>
              <p class="card-subtitle">{{ clip.performer }}</p>
              <p class="card-copy">{{ getClipNote(clip) }}</p>
              <audio
                v-if="canPlayClip(clip)"
                class="audio-player"
                controls
                preload="none"
                :src="clip.streamUrl"
                @play="handleSourceAudioPlay(clip.id)"
                @pause="handleSourceAudioStop(clip.id)"
                @ended="handleSourceAudioStop(clip.id)"
                @error="handleAudioError(clip.id)"
              />
              <p v-else class="archive-note">
                {{
                  clip.streamUrl
                    ? language === 'zh'
                      ? '播放器暂时不可用，请改用下方原始记录。'
                      : 'The in-panel player is unavailable. Use the archive record below.'
                    : language === 'zh'
                      ? '当前没有可直接播放的音频，但保留了原始馆藏记录。这是馆藏未开放可嵌入播放时的正常降级。'
                      : 'No direct playback is available here, but the original archive record is preserved below. This is an intentional fallback when the archive does not expose an embeddable stream.'
                }}
              </p>
              <div class="audio-links">
                <a class="card-link" :href="clip.recordUrl" target="_blank" rel="noreferrer">
                  {{ canPlayClip(clip) ? (language === 'zh' ? '查看原始记录' : 'View source record') : language === 'zh' ? '打开馆藏记录' : 'Open archive record' }}
                </a>
                <a v-if="clip.rightsUrl" class="card-link ghost" :href="clip.rightsUrl" target="_blank" rel="noreferrer">
                  {{ language === 'zh' ? '权利说明' : 'Rights' }}
                </a>
              </div>
              <p class="rights-copy">{{ clip.rightsLabel }}</p>
            </article>
          </div>

          <div v-if="group.relatedSongs.length" class="card-stack">
            <article v-for="song in group.relatedSongs" :key="getSongKey(song)" class="audio-card song-card">
              <div class="card-meta">
                <span class="meta-pill primary">{{ language === 'zh' ? '相关歌曲' : 'Related song' }}</span>
                <span class="meta-pill meta-pill--soft">{{ getSongStatus(song) }}</span>
                <span class="meta-pill meta-pill--soft">{{ getSongSensitivityLabel(song) }}</span>
                <span>{{ song.year }}</span>
              </div>
              <h4>{{ song.title }}</h4>
              <p class="card-subtitle">{{ song.performer }}</p>
              <p class="card-copy">{{ getSongNote(song) }}</p>
              <dl class="song-research">
                <div v-if="getSongContext(song)">
                  <dt>{{ language === 'zh' ? '背景' : 'Context' }}</dt>
                  <dd>{{ getSongContext(song) }}</dd>
                </div>
                <div v-if="getSongEventRelation(song)">
                  <dt>{{ language === 'zh' ? '事件关系' : 'Event relation' }}</dt>
                  <dd>{{ getSongEventRelation(song) }}</dd>
                </div>
                <div v-if="getSongListeningGuide(song)">
                  <dt>{{ language === 'zh' ? '听觉提示' : 'Listening guide' }}</dt>
                  <dd>{{ getSongListeningGuide(song) }}</dd>
                </div>
              </dl>
              <audio
                v-if="canPlaySong(song)"
                class="audio-player"
                controls
                preload="none"
                :src="song.streamUrl"
                @play="handleSourceAudioPlay(getSongKey(song))"
                @pause="handleSourceAudioStop(getSongKey(song))"
                @ended="handleSourceAudioStop(getSongKey(song))"
                @error="handleRelatedSongError(song)"
              />
              <div class="audio-links">
                <a class="card-link" :href="song.sourceUrl" target="_blank" rel="noreferrer">
                  {{ language === 'zh' ? '打开歌曲来源' : 'Open song source' }}
                </a>
                <a v-if="song.rightsUrl" class="card-link ghost" :href="song.rightsUrl" target="_blank" rel="noreferrer">
                  {{ language === 'zh' ? '权利说明' : 'Rights' }}
                </a>
              </div>
              <p class="rights-copy">{{ song.rightsLabel }}</p>
              <p v-if="song.audioCredit" class="rights-copy">{{ song.audioCredit }}</p>
            </article>
          </div>
        </section>
      </template>
    </section>

    <div
      v-if="showBibliography"
      class="bibliography-shell"
      role="dialog"
      aria-modal="true"
      :aria-label="language === 'zh' ? '查资料方法与书目' : 'Source check and bibliography'"
      data-testid="bibliography-dialog"
    >
      <div class="bibliography-backdrop" @click="showBibliography = false" />
      <section class="bibliography-card">
        <div class="bibliography-head">
          <div>
            <p class="eyebrow">{{ language === 'zh' ? '总附录' : 'Appendix' }}</p>
            <h3>{{ language === 'zh' ? '查资料方法与参考书目' : 'Source Check and Bibliography' }}</h3>
          </div>
          <button class="bibliography-close" type="button" @click="showBibliography = false">
            {{ language === 'zh' ? '关闭' : 'Close' }}
          </button>
        </div>

        <div class="bibliography-sections">
          <article v-for="section in bibliography" :key="section.id" class="bibliography-section">
            <div class="section-chip section-chip--appendix">
              {{ language === 'zh' ? section.titleZh : section.titleEn }}
            </div>
            <p class="group-summary">{{ language === 'zh' ? section.descriptionZh : section.descriptionEn }}</p>
            <div class="card-stack">
              <article v-for="source in section.sources" :key="source.id" class="source-card">
                <div class="card-meta">
                  <span class="meta-pill" :class="{ primary: source.isPrimary }">
                    {{ source.isPrimary ? (language === 'zh' ? '主来源' : 'Primary') : language === 'zh' ? '辅助来源' : 'Secondary' }}
                  </span>
                  <span class="meta-pill meta-pill--soft">{{ source.kind }}</span>
                </div>
                <h4>{{ source.title }}</h4>
                <p class="card-subtitle">{{ source.archiveOrAuthor }}</p>
                <p class="card-copy">{{ getSourceNote(source) }}</p>
                <a class="card-link" :href="source.url" target="_blank" rel="noreferrer">
                  {{ language === 'zh' ? '打开原始来源' : 'Open archive record' }}
                </a>
              </article>
            </div>
          </article>
        </div>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.detail-panel {
  display: grid;
  gap: 1rem;
  align-content: start;
  height: 100%;
  padding: 1.1rem 1.15rem 1.35rem;
  background: linear-gradient(180deg, rgba(28, 28, 30, 0.88), rgba(28, 28, 30, 0.62));
  border-left: 1px solid var(--atlas-line);
  backdrop-filter: blur(20px);
  overflow: auto;
}

.panel-topbar {
  position: sticky;
  top: 0;
  z-index: 2;
  display: grid;
  gap: 0.6rem;
  padding-bottom: 0.2rem;
  background: linear-gradient(180deg, rgba(28, 28, 30, 0.96), rgba(28, 28, 30, 0.88));
}

.panel-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
  padding: 0.2rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-tab,
.bibliography-trigger,
.bibliography-close {
  padding: 0.72rem 0.85rem;
  border: 0;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.74);
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease, border-color 180ms ease;
}

.panel-tab.active,
.bibliography-trigger:hover,
.bibliography-close:hover {
  background: rgba(41, 151, 255, 0.16);
  color: var(--atlas-text);
}

.panel-tab:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.bibliography-trigger {
  justify-self: start;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-stack {
  display: grid;
  gap: 1rem;
}

.panel-block,
.country-block,
.source-group {
  display: grid;
  gap: 0.6rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.artist-block {
  background: linear-gradient(180deg, rgba(41, 151, 255, 0.08), rgba(41, 151, 255, 0.02));
  padding: 0.95rem;
  border: 1px solid rgba(41, 151, 255, 0.18);
}

.artist-profile-head {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr);
  gap: 0.85rem;
  align-items: start;
}

.artist-profile-head img,
.mini-artist-card img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.artist-role {
  margin: 0;
  color: #f1d2a5;
  line-height: 1.5;
}

.eyebrow {
  margin: 0;
  color: var(--atlas-accent);
  font-size: 0.72rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.section-chip {
  width: fit-content;
  padding: 0.24rem 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-chip--artist {
  background: rgba(41, 151, 255, 0.14);
}

.section-chip--event {
  background: rgba(214, 107, 81, 0.14);
}

.section-chip--phase {
  background: rgba(148, 180, 199, 0.14);
}

.section-chip--appendix {
  background: rgba(138, 165, 141, 0.14);
}

.chapter-title,
.event-title,
.country-block h3,
.source-group h3,
.bibliography-card h3 {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: clamp(1.2rem, 1.8vw, 1.95rem);
  line-height: 1.08;
}

.chapter-summary,
.event-copy,
.country-block p,
.legend-copy,
.group-summary,
.card-copy,
.card-subtitle,
.rights-copy,
.archive-note {
  margin: 0;
  color: var(--atlas-muted);
  line-height: 1.58;
}

.event-figure {
  display: grid;
  gap: 0.45rem;
  margin: 0;
}

.event-figure img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.event-figure figcaption {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  color: rgba(255, 255, 255, 0.54);
  font-size: 0.72rem;
}

.event-image-caption {
  flex-basis: 100%;
  color: var(--atlas-muted);
  line-height: 1.5;
}

.event-figure a {
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.impact-note,
.song-list,
.work-list,
.linked-artist-list {
  display: grid;
  gap: 0.55rem;
}

.artist-meta,
.card-meta,
.audio-links,
.group-status {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
}

.artist-meta {
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.78rem;
}

.compare-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.list-title {
  color: rgba(255, 255, 255, 0.54);
  font-size: 0.74rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.palette-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  width: fit-content;
  color: var(--atlas-text);
}

.palette-swatch {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 999px;
  background: var(--swatch);
  box-shadow: 0 0 0 0.35rem var(--glow);
}

.inline-list {
  color: var(--atlas-text);
}

.style-legend,
.card-stack,
.bibliography-sections {
  display: grid;
  gap: 0.7rem;
}

.style-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: rgba(255, 255, 255, 0.58);
  transition: color 180ms ease, transform 180ms ease;
}

.style-legend__item.active {
  color: var(--atlas-text);
  transform: translateX(2px);
}

.group-header {
  display: grid;
  gap: 0.8rem;
}

.group-header__copy {
  display: grid;
  gap: 0.45rem;
}

.group-status {
  justify-content: flex-start;
}

.source-group--artist {
  border-left: 2px solid rgba(41, 151, 255, 0.5);
  padding-left: 0.7rem;
}

.source-group--event {
  border-left: 2px solid rgba(214, 107, 81, 0.5);
  padding-left: 0.7rem;
}

.source-group--phase {
  border-left: 2px solid rgba(148, 180, 199, 0.5);
  padding-left: 0.7rem;
}

.source-card,
.audio-card,
.song-card,
.work-card,
.mini-artist-card,
.bibliography-section {
  display: grid;
  gap: 0.5rem;
  padding: 0.85rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.source-card h4,
.audio-card h4,
.song-card h4,
.work-card h4,
.mini-artist-card h4 {
  margin: 0;
  color: var(--atlas-text);
  font-size: 1rem;
}

.work-card p,
.mini-artist-card p {
  margin: 0;
  color: var(--atlas-muted);
  line-height: 1.5;
}

.mini-artist-card {
  grid-template-columns: 3.8rem minmax(0, 1fr);
  align-items: start;
}

.mini-artist-card small {
  display: block;
  margin-top: 0.25rem;
  color: #7cc0ff;
  overflow-wrap: anywhere;
}

.meta-pill {
  padding: 0.18rem 0.45rem;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.72rem;
  text-transform: uppercase;
}

.meta-pill.primary {
  background: rgba(41, 151, 255, 0.18);
  color: var(--atlas-text);
}

.meta-pill--soft {
  background: rgba(255, 255, 255, 0.04);
}

.card-meta {
  color: rgba(255, 255, 255, 0.56);
  font-size: 0.76rem;
}

.card-link {
  width: fit-content;
  color: var(--atlas-text);
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.22);
}

.card-link.ghost {
  color: rgba(255, 255, 255, 0.66);
}

.audio-player {
  width: 100%;
  min-width: 0;
}

.song-research {
  display: grid;
  gap: 0.5rem;
  margin: 0;
}

.song-research div {
  display: grid;
  gap: 0.18rem;
  padding-top: 0.45rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.song-research dt {
  color: var(--atlas-accent);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.song-research dd {
  margin: 0;
  color: var(--atlas-muted);
  line-height: 1.5;
}

.archive-note {
  padding: 0.65rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.12);
}

.empty-state {
  min-height: 8rem;
}

.bibliography-shell {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
}

.bibliography-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
}

.bibliography-card {
  position: relative;
  z-index: 1;
  width: min(44rem, calc(100vw - 2rem));
  max-height: min(80vh, 56rem);
  display: grid;
  gap: 1rem;
  padding: 1rem;
  overflow: auto;
  background: rgba(11, 16, 23, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
}

.bibliography-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.bibliography-close {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 980px) {
  .detail-panel {
    border-left: 0;
    border-top: 1px solid var(--atlas-line);
    max-height: 42vh;
  }

  .group-header {
    gap: 0.6rem;
  }
}

@media (max-width: 760px) {
  .detail-panel {
    padding: 0.95rem 0.95rem 1.2rem;
    max-height: 42vh;
  }

  .panel-topbar {
    gap: 0.5rem;
  }

  .compare-grid {
    grid-template-columns: 1fr;
  }

  .panel-tabs {
    grid-template-columns: 1fr 1fr;
  }

  .bibliography-trigger {
    width: 100%;
    justify-self: stretch;
  }

  .source-group--artist,
  .source-group--event,
  .source-group--phase {
    padding-left: 0.55rem;
  }

  .bibliography-card {
    width: calc(100vw - 1rem);
    max-height: 88vh;
    padding: 0.9rem;
  }
}
</style>
