<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { navigateTo } from '@/router'
import { useAtlasState } from '@/composables/useAtlasState'
import { getArtistRole, getCountryName, getEventTitle, getFeaturedArtistsForContext } from '@/lib/atlas'
import { dispatchSourceAudioState } from '@/lib/audioBus'
import type { HistoricEvent, RelatedSong } from '@/data/ww2MusicAtlas'

const GlobeStage = defineAsyncComponent(() => import('@/components/GlobeStage.vue'))
const atlas = useAtlasState()
const audioFailures = ref<string[]>([])

function openCountryPage() {
  navigateTo({
    path: '/countries',
    query: {
      year: atlas.activeYear.value,
      event: atlas.selectedEventId.value,
      countries: atlas.selectedCountryIds.value.join(','),
      lang: atlas.language.value,
    },
  })
}

function getEventLongDescription(event: HistoricEvent) {
  return atlas.language.value === 'zh'
    ? event.longDescriptionZh ?? event.descriptionZh
    : event.longDescriptionEn ?? event.descriptionEn
}

function getEventMusicImpact(event: HistoricEvent) {
  return atlas.language.value === 'zh' ? event.musicImpactZh : event.musicImpactEn
}

function getEventImageAlt(event: HistoricEvent) {
  if (!event.image) {
    return ''
  }

  return atlas.language.value === 'zh' ? event.image.altZh : event.image.altEn
}

function getEventImageCaption(event: HistoricEvent) {
  if (!event.image) {
    return ''
  }

  return atlas.language.value === 'zh' ? event.image.captionZh : event.image.captionEn
}

function getSongNote(song: RelatedSong) {
  return atlas.language.value === 'zh' ? song.noteZh : song.noteEn
}

function getSongContext(song: RelatedSong) {
  return atlas.language.value === 'zh' ? song.contextZh : song.contextEn
}

function getSongEventRelation(song: RelatedSong) {
  return atlas.language.value === 'zh' ? song.eventRelationZh : song.eventRelationEn
}

function getSongListeningGuide(song: RelatedSong) {
  return atlas.language.value === 'zh' ? song.listeningGuideZh : song.listeningGuideEn
}

function getSongKey(song: RelatedSong) {
  return `${song.title}:${song.year}`
}

function getSongStatus(song: RelatedSong) {
  const songKey = getSongKey(song)

  if (audioFailures.value.includes(songKey)) {
    return atlas.language.value === 'zh' ? '播放失败，已切换到来源链接。' : 'Playback failed. Use the source link instead.'
  }

  return song.streamUrl
    ? atlas.language.value === 'zh'
      ? '本地播放'
      : 'Local playback'
    : atlas.language.value === 'zh'
      ? '档案外链'
      : 'Archive link'
}

function getSongSensitivityLabel(song: RelatedSong) {
  if (song.sensitivity === 'sensitive-context') {
    return atlas.language.value === 'zh' ? '敏感历史材料' : 'Sensitive historical material'
  }

  if (song.sensitivity === 'resistance') {
    return atlas.language.value === 'zh' ? '抵抗歌曲' : 'Resistance song'
  }

  if (song.sensitivity === 'patriotic') {
    return atlas.language.value === 'zh' ? '爱国/士气歌曲' : 'Patriotic / morale song'
  }

  return atlas.language.value === 'zh' ? '研究样本' : 'Research sample'
}

function canPlaySong(song: RelatedSong) {
  return Boolean(song.streamUrl) && !audioFailures.value.includes(getSongKey(song))
}

function handleSongPlay(song: RelatedSong) {
  dispatchSourceAudioState({ active: true, clipId: getSongKey(song) })
}

function handleSongStop(song: RelatedSong) {
  dispatchSourceAudioState({ active: false, clipId: getSongKey(song) })
}

function handleSongError(song: RelatedSong) {
  const songKey = getSongKey(song)

  if (!audioFailures.value.includes(songKey)) {
    audioFailures.value = [...audioFailures.value, songKey]
  }

  dispatchSourceAudioState({ active: false, clipId: songKey })
}

function getLinkedArtists() {
  return getFeaturedArtistsForContext({
    activeEvent: atlas.activeEvent.value,
    countryDetails: atlas.countryDetails.value,
    activeYear: atlas.activeYear.value,
    limit: 6,
  })
}
</script>

<template>
  <main class="archive-page events-page">
    <aside class="route-sidebar">
      <p class="kicker">{{ atlas.language.value === 'zh' ? '时间线' : 'Timeline' }}</p>
      <h1>{{ atlas.language.value === 'zh' ? '重大事件' : 'Key Events' }}</h1>
      <div class="event-index">
        <button
          v-for="event in atlas.historicEvents"
          :key="event.id"
          type="button"
          :class="{ active: event.id === atlas.selectedEventId.value }"
          @click="atlas.selectEvent(event.id)"
        >
          <span>{{ event.year }}</span>
          <strong>{{ getEventTitle(event, atlas.language.value) }}</strong>
        </button>
      </div>
    </aside>

    <section class="route-main">
      <div class="map-slice">
        <Suspense>
          <GlobeStage
            :active-year="atlas.activeYear.value"
            :countries="atlas.countries"
            :enabled-layers="atlas.enabledLayers.value"
            :events="atlas.historicEvents"
            :focus-pose="atlas.focusPose.value"
            :language="atlas.language.value"
            :selected-artist-id="null"
            :selected-country-ids="atlas.selectedCountryIds.value"
            @select-artist="atlas.selectArtist"
            @select-country="atlas.toggleCountry"
            @select-event="atlas.selectEvent"
          />
        </Suspense>
      </div>

      <article v-if="atlas.activeEvent.value" class="detail-surface" data-testid="event-detail">
        <p class="kicker">{{ atlas.activeEvent.value.year }}</p>
        <h2>{{ getEventTitle(atlas.activeEvent.value, atlas.language.value) }}</h2>
        <figure v-if="atlas.activeEvent.value.image" class="event-figure">
          <img :src="atlas.activeEvent.value.image.src" :alt="getEventImageAlt(atlas.activeEvent.value)" loading="lazy">
          <figcaption>
            <span v-if="getEventImageCaption(atlas.activeEvent.value)" class="event-image-caption">{{ getEventImageCaption(atlas.activeEvent.value) }}</span>
            <span>{{ atlas.activeEvent.value.image.credit }}</span>
            <a :href="atlas.activeEvent.value.image.sourceUrl" target="_blank" rel="noreferrer">
              {{ atlas.language.value === 'zh' ? '图片来源' : 'Image source' }}
            </a>
          </figcaption>
        </figure>
        <p>{{ getEventLongDescription(atlas.activeEvent.value) }}</p>
        <section v-if="getEventMusicImpact(atlas.activeEvent.value)" class="detail-section" data-testid="event-music-impact">
          <p class="kicker">{{ atlas.language.value === 'zh' ? '音乐风格影响' : 'Musical Impact' }}</p>
          <p>{{ getEventMusicImpact(atlas.activeEvent.value) }}</p>
        </section>
        <section v-if="atlas.activeEvent.value.relatedSongs?.length" class="detail-section" data-testid="event-related-songs">
          <p class="kicker">{{ atlas.language.value === 'zh' ? '相关歌曲' : 'Related Songs' }}</p>
          <div class="song-grid">
            <article v-for="song in atlas.activeEvent.value.relatedSongs" :key="`${song.title}-${song.year}`" class="song-card">
              <div class="song-meta">
                <span>{{ song.year }}</span>
                <span>{{ getSongStatus(song) }}</span>
                <span>{{ getSongSensitivityLabel(song) }}</span>
              </div>
              <h3>{{ song.title }}</h3>
              <p class="song-performer">{{ song.performer }}</p>
              <p>{{ getSongNote(song) }}</p>
              <dl class="song-research">
                <div v-if="getSongContext(song)">
                  <dt>{{ atlas.language.value === 'zh' ? '背景' : 'Context' }}</dt>
                  <dd>{{ getSongContext(song) }}</dd>
                </div>
                <div v-if="getSongEventRelation(song)">
                  <dt>{{ atlas.language.value === 'zh' ? '事件关系' : 'Event relation' }}</dt>
                  <dd>{{ getSongEventRelation(song) }}</dd>
                </div>
                <div v-if="getSongListeningGuide(song)">
                  <dt>{{ atlas.language.value === 'zh' ? '听觉提示' : 'Listening guide' }}</dt>
                  <dd>{{ getSongListeningGuide(song) }}</dd>
                </div>
              </dl>
              <audio
                v-if="canPlaySong(song)"
                controls
                preload="none"
                :src="song.streamUrl"
                @play="handleSongPlay(song)"
                @pause="handleSongStop(song)"
                @ended="handleSongStop(song)"
                @error="handleSongError(song)"
              />
              <div class="audio-links">
                <a :href="song.sourceUrl" target="_blank" rel="noreferrer">
                  {{ atlas.language.value === 'zh' ? '打开歌曲来源' : 'Open song source' }}
                </a>
                <a v-if="song.rightsUrl" :href="song.rightsUrl" target="_blank" rel="noreferrer">
                  {{ atlas.language.value === 'zh' ? '权利说明' : 'Rights' }}
                </a>
              </div>
              <p class="rights-copy">{{ song.rightsLabel }}</p>
              <p v-if="song.audioCredit" class="rights-copy">{{ song.audioCredit }}</p>
            </article>
          </div>
        </section>
        <section v-if="getLinkedArtists().length" class="detail-section" data-testid="event-linked-artists">
          <p class="kicker">{{ atlas.language.value === 'zh' ? '相关音乐家' : 'Linked Artists' }}</p>
          <div class="linked-artist-grid">
            <article v-for="artist in getLinkedArtists()" :key="artist.id" class="linked-artist-card">
              <img :src="artist.portrait.src" :alt="atlas.language.value === 'zh' ? artist.portrait.altZh : artist.portrait.altEn">
              <div>
                <h3>{{ atlas.language.value === 'zh' ? artist.nameZh : artist.nameEn }}</h3>
                <p>{{ getArtistRole(artist, atlas.language.value) }}</p>
                <small>{{ artist.representativeWorks.slice(0, 2).map((work) => work.title).join(' / ') }}</small>
              </div>
            </article>
          </div>
        </section>
        <div class="affected-list">
          <button v-for="country in atlas.selectedCountries.value" :key="country.id" type="button" @click="openCountryPage">
            <span :style="{ '--swatch': country.color }" />
            {{ getCountryName(country, atlas.language.value) }}
          </button>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.archive-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(18rem, 24rem) 1fr;
  gap: 1rem;
  padding: 6.4rem 1rem 1rem;
}

.route-sidebar,
.detail-surface {
  background: rgba(28, 28, 30, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
}

.route-sidebar {
  align-self: start;
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.kicker {
  margin: 0;
  color: var(--atlas-accent);
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  line-height: 1;
}

h1 {
  font-size: clamp(2.1rem, 4vw, 4rem);
}

h2 {
  font-size: clamp(1.8rem, 3vw, 3.4rem);
}

p {
  margin: 0;
  color: var(--atlas-muted);
  line-height: 1.62;
}

.event-figure {
  display: grid;
  gap: 0.45rem;
  margin: 0;
}

.event-figure img {
  width: 100%;
  max-height: 28rem;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.event-figure figcaption,
.song-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  color: rgba(255, 255, 255, 0.56);
  font-size: 0.76rem;
}

.event-image-caption {
  flex-basis: 100%;
  color: var(--atlas-muted);
  line-height: 1.5;
}

.event-figure a,
.song-card a {
  width: fit-content;
  color: var(--atlas-text);
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.24);
}

.detail-section {
  display: grid;
  gap: 0.7rem;
}

.song-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
}

.song-card {
  display: grid;
  gap: 0.48rem;
  padding: 0.85rem;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.linked-artist-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.linked-artist-card {
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr);
  gap: 0.7rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.linked-artist-card img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}

.linked-artist-card h3 {
  margin: 0;
  color: var(--atlas-text);
  font-size: 1rem;
}

.linked-artist-card small {
  color: #7cc0ff;
  overflow-wrap: anywhere;
}

.song-card h3 {
  margin: 0;
  color: var(--atlas-text);
  font-size: 1rem;
}

.song-performer {
  color: rgba(255, 255, 255, 0.82);
}

.song-card audio {
  width: 100%;
}

.song-research {
  display: grid;
  gap: 0.5rem;
  margin: 0;
}

.song-research div {
  display: grid;
  gap: 0.2rem;
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

.audio-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.rights-copy {
  color: rgba(255, 255, 255, 0.54);
  font-size: 0.75rem;
  line-height: 1.45;
}

.event-index {
  display: grid;
  gap: 0.45rem;
}

.event-index button,
.affected-list button {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.035);
  color: var(--atlas-text);
  cursor: pointer;
}

.event-index button {
  display: grid;
  grid-template-columns: 3.4rem 1fr;
  gap: 0.7rem;
  align-items: center;
  padding: 0.7rem;
  text-align: left;
}

.event-index button.active {
  background: rgba(41, 151, 255, 0.14);
  border-color: rgba(41, 151, 255, 0.38);
}

.event-index span {
  color: var(--atlas-accent);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 1.2rem;
}

.route-main {
  display: grid;
  grid-template-rows: minmax(25rem, 48vh) auto;
  gap: 1rem;
}

.map-slice {
  position: relative;
  min-height: 25rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.4);
}

.detail-surface {
  display: grid;
  gap: 0.85rem;
  padding: 1.25rem;
}

.affected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.affected-list button {
  display: inline-flex;
  gap: 0.48rem;
  align-items: center;
  padding: 0.55rem 0.8rem;
}

.affected-list span {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 999px;
  background: var(--swatch);
}

@media (max-width: 900px) {
  .archive-page {
    grid-template-columns: 1fr;
    padding-top: 12rem;
  }

  .song-grid {
    grid-template-columns: 1fr;
  }

  .linked-artist-grid {
    grid-template-columns: 1fr;
  }
}

/* Minimal archive layout */
.archive-page {
  grid-template-columns: 18rem minmax(0, 1fr);
  gap: 2rem;
  width: min(100%, var(--page-width));
  margin: 0 auto;
  padding: 7rem 1.25rem 3rem;
}

.route-sidebar,
.detail-surface {
  background: transparent;
  border: 0;
  backdrop-filter: none;
}

.route-sidebar {
  position: sticky;
  top: 5.5rem;
  gap: 0.8rem;
  max-height: calc(100svh - 7rem);
  overflow: auto;
  padding: 0 1.5rem 0 0;
  border-right: 1px solid var(--atlas-line);
}

.kicker {
  letter-spacing: 0.12em;
}

h1 {
  font-size: clamp(2rem, 3.6vw, 3.25rem);
  font-weight: 540;
}

h2 {
  font-size: clamp(1.65rem, 2.8vw, 2.6rem);
  font-weight: 540;
}

.event-index {
  gap: 0;
  margin-top: 0.4rem;
}

.event-index button,
.affected-list button {
  border: 0;
  border-bottom: 1px solid var(--atlas-line);
  background: transparent;
}

.event-index button {
  grid-template-columns: 3rem 1fr;
  padding: 0.62rem 0;
}

.event-index button.active {
  padding-left: 0.55rem;
  background: var(--atlas-accent-soft);
  border-color: var(--atlas-line);
}

.event-index span {
  color: var(--atlas-accent);
  font-size: 0.95rem;
}

.route-main {
  gap: 1.5rem;
}

.map-slice {
  border-color: var(--atlas-line);
  border-radius: var(--atlas-radius);
}

.detail-surface {
  gap: 1rem;
  padding: 0;
}

.event-figure img {
  border: 0;
  border-radius: 6px;
}

.detail-section {
  gap: 0.8rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--atlas-line);
}

.song-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 1.25rem;
}

.song-card {
  padding: 1rem 0;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--atlas-line);
}

.linked-artist-grid {
  gap: 0 1.25rem;
}

.linked-artist-card {
  padding: 0.8rem 0;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--atlas-line);
}

.linked-artist-card img {
  border-radius: 4px;
}

.affected-list button {
  padding: 0.5rem 0.2rem;
}

@media (max-width: 900px) {
  .archive-page {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    padding-top: 11.5rem;
  }

  .route-sidebar {
    position: static;
    max-height: none;
    padding-right: 0;
    border-right: 0;
  }

  .song-grid {
    grid-template-columns: 1fr;
  }
}
</style>
