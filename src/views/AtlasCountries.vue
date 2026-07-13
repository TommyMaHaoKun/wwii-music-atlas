<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '@/router'
import { useAtlasState } from '@/composables/useAtlasState'
import type { RelatedSong, StylePhase } from '@/data/ww2MusicAtlas'
import { dispatchSourceAudioState } from '@/lib/audioBus'
import { getArtistRole, getArtistsForPhase, getCountryName, getStyleName, getStyleSummary } from '@/lib/atlas'

const atlas = useAtlasState()
const audioFailures = ref<string[]>([])

function openSources() {
  navigateTo({
    path: '/sources',
    query: {
      year: atlas.activeYear.value,
      event: atlas.selectedEventId.value,
      countries: atlas.selectedCountryIds.value.join(','),
      lang: atlas.language.value,
    },
  })
}

function getPhaseArtists(countryId: string, startYear: number) {
  return getArtistsForPhase(countryId, startYear)
}

function getPhaseHistoricalContext(phase: StylePhase) {
  return atlas.language.value === 'zh' ? phase.historicalContextZh : phase.historicalContextEn
}

function getSongNote(song: RelatedSong) {
  return atlas.language.value === 'zh' ? song.noteZh : song.noteEn
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

function canPlaySong(song: RelatedSong) {
  return Boolean(song.streamUrl) && !audioFailures.value.includes(getSongKey(song))
}

function getSongStatus(song: RelatedSong) {
  if (audioFailures.value.includes(getSongKey(song))) {
    return atlas.language.value === 'zh' ? '试听失败' : 'Playback failed'
  }

  return song.streamUrl
    ? atlas.language.value === 'zh'
      ? '本地试听'
      : 'Local playback'
    : atlas.language.value === 'zh'
      ? '来源记录'
      : 'Source record'
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

  return atlas.language.value === 'zh' ? '历史录音' : 'Historical recording'
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
</script>

<template>
  <main class="archive-page countries-page">
    <aside class="route-sidebar">
      <p class="kicker">{{ atlas.language.value === 'zh' ? '我怎么比较' : 'How I compare' }}</p>
      <h1>{{ atlas.language.value === 'zh' ? '国家风格' : 'Country Styles' }}</h1>
      <p>
        {{
          atlas.language.value === 'zh'
            ? '我把一到两个国家放在同一年份里看，比较它们当时常见的风格、关键词、音乐家和作品。这样比单独背时间线更容易看出差别。'
            : 'I compare one or two countries in the same year, looking at style, keywords, artists, and works. It makes the differences easier to see than a plain timeline.'
        }}
      </p>
      <div class="country-picker">
        <button
          v-for="country in atlas.countries"
          :key="country.id"
          type="button"
          :class="{ active: atlas.selectedCountryIds.value.includes(country.id) }"
          @click="atlas.setMode('explore'); atlas.toggleCountry(country.id)"
        >
          <span :style="{ '--swatch': country.color }" />
          {{ getCountryName(country, atlas.language.value) }}
        </button>
      </div>
      <label class="year-control">
        <span>{{ atlas.activeYear.value }}</span>
        <input
          type="range"
          min="1931"
          max="1949"
          :value="atlas.activeYear.value"
          @input="atlas.setYear(Number(($event.target as HTMLInputElement).value))"
        >
      </label>
    </aside>

    <section class="country-grid" data-testid="compare-panel">
      <article v-for="item in atlas.countryDetails.value" :key="item.country.id" class="country-surface">
        <p class="kicker">{{ getCountryName(item.country, atlas.language.value) }}</p>
        <template v-if="item.phase">
          <h2>{{ getStyleName(item.phase, atlas.language.value) }}</h2>
          <p>{{ getStyleSummary(item.phase, atlas.language.value) }}</p>
          <section v-if="getPhaseHistoricalContext(item.phase)" class="phase-history" data-testid="country-phase-history">
            <h3>{{ atlas.language.value === 'zh' ? '历史线索' : 'Historical Thread' }}</h3>
            <p>{{ getPhaseHistoricalContext(item.phase) }}</p>
          </section>
          <section v-if="item.phase.representativeSongs?.length" class="phase-listening" data-testid="country-representative-songs">
            <div class="section-heading">
              <h3>{{ atlas.language.value === 'zh' ? '代表试听' : 'Listening Evidence' }}</h3>
              <span>{{ item.phase.startYear }}-{{ item.phase.endYear }}</span>
            </div>
            <div class="phase-song-list">
              <article v-for="song in item.phase.representativeSongs" :key="`${item.country.id}-${item.phase.startYear}-${song.title}`" class="phase-song">
                <div class="song-heading">
                  <span class="song-year">{{ song.year }}</span>
                  <span>{{ getSongStatus(song) }}</span>
                  <span>{{ getSongSensitivityLabel(song) }}</span>
                </div>
                <h4>{{ song.title }}</h4>
                <p class="song-performer">{{ song.performer }}</p>
                <p>{{ getSongNote(song) }}</p>
                <dl class="song-research">
                  <div v-if="getSongEventRelation(song)">
                    <dt>{{ atlas.language.value === 'zh' ? '历史关联' : 'Event link' }}</dt>
                    <dd>{{ getSongEventRelation(song) }}</dd>
                  </div>
                  <div v-if="getSongListeningGuide(song)">
                    <dt>{{ atlas.language.value === 'zh' ? '听辨重点' : 'Listening cue' }}</dt>
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
                <p v-else-if="song.streamUrl" class="player-error">
                  {{ atlas.language.value === 'zh' ? '试听失败，请打开来源链接。' : 'Playback failed. Use the source link instead.' }}
                </p>
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
          <div class="metadata-grid">
            <section>
              <h3>{{ atlas.language.value === 'zh' ? '关键词' : 'Keywords' }}</h3>
              <p>{{ item.phase.keywords.join(' / ') }}</p>
            </section>
            <section>
              <h3>{{ atlas.language.value === 'zh' ? '代表人物' : 'Representative Artists' }}</h3>
              <p>{{ item.phase.representativeArtists.join(' / ') }}</p>
            </section>
            <section>
              <h3>{{ atlas.language.value === 'zh' ? '代表作品' : 'Representative Works' }}</h3>
              <p>{{ item.phase.representativeWorks.join(' / ') }}</p>
            </section>
            <section v-if="getPhaseArtists(item.country.id, item.phase.startYear).length">
              <h3>{{ atlas.language.value === 'zh' ? '关联音乐家' : 'Linked Artists' }}</h3>
              <div class="country-artist-list">
                <article v-for="artist in getPhaseArtists(item.country.id, item.phase.startYear)" :key="artist.id">
                  <img :src="artist.portrait.src" :alt="atlas.language.value === 'zh' ? artist.portrait.altZh : artist.portrait.altEn">
                  <span>
                    <strong>{{ atlas.language.value === 'zh' ? artist.nameZh : artist.nameEn }}</strong>
                    <small>{{ getArtistRole(artist, atlas.language.value) }}</small>
                  </span>
                </article>
              </div>
            </section>
          </div>
        </template>
      </article>

      <div class="sources-cta">
        <p>{{ atlas.language.value === 'zh' ? '需要查看出处和音频记录？' : 'Need the archive trail and audio records?' }}</p>
        <button type="button" @click="openSources">
          {{ atlas.language.value === 'zh' ? '打开档案资料' : 'Open Sources' }}
        </button>
      </div>
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
.country-surface,
.sources-cta {
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
  font-size: clamp(1.6rem, 3vw, 3rem);
}

h3 {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h4 {
  margin: 0;
  color: var(--atlas-text);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 1.25rem;
  line-height: 1.1;
}

p {
  margin: 0;
  color: var(--atlas-muted);
  line-height: 1.62;
}

.country-picker {
  display: grid;
  gap: 0.45rem;
}

.country-picker button,
.sources-cta button {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.035);
  color: var(--atlas-text);
  cursor: pointer;
}

.country-picker button {
  display: inline-flex;
  gap: 0.55rem;
  align-items: center;
  padding: 0.65rem 0.75rem;
  text-align: left;
}

.country-picker button.active {
  background: rgba(41, 151, 255, 0.14);
  border-color: rgba(41, 151, 255, 0.38);
}

.country-picker span {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 999px;
  background: var(--swatch);
}

.year-control {
  display: grid;
  gap: 0.35rem;
}

.year-control span {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 2rem;
}

.country-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  align-content: start;
}

.country-surface {
  display: grid;
  gap: 1rem;
  min-height: 28rem;
  padding: 1.25rem;
}

.phase-history,
.phase-listening {
  display: grid;
  gap: 0.65rem;
  padding-top: 0.95rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.section-heading,
.song-heading,
.audio-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
}

.section-heading {
  justify-content: space-between;
}

.section-heading span,
.song-heading span {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.song-heading {
  gap: 0.5rem;
}

.song-heading span {
  padding-right: 0.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
}

.song-heading span:last-child {
  border-right: 0;
}

.song-year {
  color: var(--atlas-accent) !important;
}

.phase-song-list {
  display: grid;
  gap: 0.95rem;
}

.phase-song {
  display: grid;
  gap: 0.55rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.phase-song:first-child {
  padding-top: 0;
  border-top: 0;
}

.song-performer,
.rights-copy,
.player-error {
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.82rem;
}

.song-research {
  display: grid;
  gap: 0.45rem;
  margin: 0;
}

.song-research div {
  display: grid;
  gap: 0.12rem;
}

.song-research dt {
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.song-research dd {
  margin: 0;
  color: var(--atlas-muted);
  font-size: 0.9rem;
  line-height: 1.55;
}

.phase-song audio {
  width: 100%;
  min-height: 2.5rem;
  filter: sepia(0.18) saturate(0.82);
}

.audio-links a {
  color: var(--atlas-accent);
  font-size: 0.84rem;
  text-decoration: none;
}

.audio-links a:hover {
  text-decoration: underline;
}

.metadata-grid {
  display: grid;
  gap: 0.9rem;
  margin-top: 0.4rem;
}

.metadata-grid section {
  display: grid;
  gap: 0.35rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.country-artist-list {
  display: grid;
  gap: 0.55rem;
}

.country-artist-list article {
  display: grid;
  grid-template-columns: 3.4rem minmax(0, 1fr);
  gap: 0.65rem;
  align-items: start;
  padding: 0.6rem;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.country-artist-list img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}

.country-artist-list span {
  display: grid;
  gap: 0.22rem;
  min-width: 0;
}

.country-artist-list strong {
  color: var(--atlas-text);
  overflow-wrap: anywhere;
}

.country-artist-list small {
  color: var(--atlas-muted);
  line-height: 1.4;
}

.sources-cta {
  grid-column: 1 / -1;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.sources-cta button {
  padding: 0.68rem 0.9rem;
}

@media (max-width: 900px) {
  .archive-page,
  .country-grid {
    grid-template-columns: 1fr;
  }

  .archive-page {
    padding-top: 12rem;
  }

  .country-surface {
    min-height: auto;
  }
}
</style>
