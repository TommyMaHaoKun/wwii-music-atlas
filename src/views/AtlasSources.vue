<script setup lang="ts">
import BackgroundMusicPlayer from '@/components/BackgroundMusicPlayer.vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { getBibliographySections, type DetailSourceGroup } from '@/lib/atlas'
import type { AudioClip, SourceReference } from '@/data/ww2MusicAtlas'

const atlas = useAtlasState()
const bibliography = getBibliographySections()

function groupLabel(group: DetailSourceGroup) {
  if (group.entityType === 'artist') {
    return atlas.language.value === 'zh' ? '艺术家资料' : 'Artist dossier'
  }

  if (group.entityType === 'event') {
    return atlas.language.value === 'zh' ? '历史事件' : 'Historic event'
  }

  return atlas.language.value === 'zh' ? '国家风格阶段' : 'Country style phase'
}

function sourceNote(source: SourceReference) {
  return atlas.language.value === 'zh' ? source.noteZh : source.noteEn
}

function clipNote(clip: AudioClip) {
  return atlas.language.value === 'zh' ? clip.noteZh : clip.noteEn
}
</script>

<template>
  <main class="sources-page">
    <aside class="route-sidebar">
      <p class="kicker">{{ atlas.language.value === 'zh' ? '资料核对' : 'Source check' }}</p>
      <h1>{{ atlas.language.value === 'zh' ? '我查到的来源与声音记录' : 'Sources I Checked' }}</h1>
      <p>
        {{
          atlas.language.value === 'zh'
            ? '这里放的是我查资料时留下的出处。AI 可以帮我整理线索，但我需要看到馆藏页、论文、图片来源和音频状态，才敢把它放进地图。'
            : 'This page keeps the sources I checked while building the map. AI helped me organize leads, but I still wanted archive pages, articles, image credits, and audio status before using a claim.'
        }}
      </p>
      <BackgroundMusicPlayer :language="atlas.language.value" />
    </aside>

    <section class="source-stack" data-testid="sources-page">
      <article v-for="group in atlas.sourceGroups.value" :key="group.id" class="source-group" data-testid="source-group">
        <div class="group-head">
          <p class="kicker">{{ groupLabel(group) }}</p>
          <h2>{{ atlas.language.value === 'zh' ? group.titleZh : group.titleEn }}</h2>
          <p v-if="atlas.language.value === 'zh' ? group.summaryZh : group.summaryEn">
            {{ atlas.language.value === 'zh' ? group.summaryZh : group.summaryEn }}
          </p>
        </div>

        <div class="record-grid">
          <a v-for="source in group.sources" :key="source.id" class="record-card" :href="source.url" target="_blank" rel="noreferrer">
            <span>{{ source.isPrimary ? (atlas.language.value === 'zh' ? '主要来源' : 'Primary') : source.kind }}</span>
            <strong>{{ source.title }}</strong>
            <small>{{ source.archiveOrAuthor }} · {{ source.year }}</small>
            <p>{{ sourceNote(source) }}</p>
          </a>
        </div>

        <div v-if="group.audioClips.length" class="record-grid">
          <a v-for="clip in group.audioClips" :key="clip.id" class="record-card audio" :href="clip.recordUrl" target="_blank" rel="noreferrer">
            <span>{{ clip.streamUrl ? (atlas.language.value === 'zh' ? '可播放音频' : 'Playable audio') : atlas.language.value === 'zh' ? '馆藏记录' : 'Archive record only' }}</span>
            <strong>{{ clip.title }}</strong>
            <small>{{ clip.performer }} · {{ clip.year }}</small>
            <p>{{ clipNote(clip) }}</p>
          </a>
        </div>

        <div v-if="group.relatedSongs.length" class="record-grid">
          <a v-for="song in group.relatedSongs" :key="`${song.title}-${song.year}`" class="record-card audio" :href="song.sourceUrl" target="_blank" rel="noreferrer">
            <span>{{ song.streamUrl ? (atlas.language.value === 'zh' ? '可播放作品' : 'Playable work') : atlas.language.value === 'zh' ? '作品资料' : 'Work source' }}</span>
            <strong>{{ song.title }}</strong>
            <small>{{ song.performer }} · {{ song.year }}</small>
            <p>{{ atlas.language.value === 'zh' ? song.noteZh : song.noteEn }}</p>
          </a>
        </div>
      </article>

      <article v-for="section in bibliography" :key="section.id" class="source-group bibliography" data-testid="bibliography-dialog">
        <div class="group-head">
          <p class="kicker">{{ atlas.language.value === 'zh' ? '查资料与书目' : 'Source check' }}</p>
          <h2>{{ atlas.language.value === 'zh' ? section.titleZh : section.titleEn }}</h2>
          <p>{{ atlas.language.value === 'zh' ? section.descriptionZh : section.descriptionEn }}</p>
        </div>
        <div class="record-grid">
          <a v-for="source in section.sources" :key="source.id" class="record-card" :href="source.url" target="_blank" rel="noreferrer">
            <span>{{ source.kind }}</span>
            <strong>{{ source.title }}</strong>
            <small>{{ source.archiveOrAuthor }} · {{ source.year }}</small>
          </a>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.sources-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(20rem, 28rem) 1fr;
  gap: 1rem;
  padding: 6.4rem 1rem 1rem;
}

.route-sidebar,
.source-group {
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
  font-size: clamp(1.45rem, 2.5vw, 2.6rem);
}

p {
  margin: 0;
  color: var(--atlas-muted);
  line-height: 1.62;
}

.source-stack,
.source-group,
.group-head {
  display: grid;
  gap: 1rem;
}

.source-group {
  padding: 1.15rem;
}

.record-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.record-card {
  display: grid;
  gap: 0.45rem;
  padding: 0.9rem;
  color: inherit;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.record-card:hover {
  border-color: rgba(41, 151, 255, 0.36);
  background: rgba(41, 151, 255, 0.08);
}

.record-card span {
  width: fit-content;
  padding: 0.18rem 0.45rem;
  background: rgba(41, 151, 255, 0.14);
  color: var(--atlas-text);
  font-size: 0.7rem;
  text-transform: uppercase;
}

.record-card strong {
  font-size: 1rem;
}

.record-card small {
  color: rgba(255, 255, 255, 0.58);
}

.record-card p {
  font-size: 0.92rem;
}

.audio span {
  background: rgba(148, 180, 199, 0.16);
}

@media (max-width: 900px) {
  .sources-page,
  .record-grid {
    grid-template-columns: 1fr;
  }

  .sources-page {
    padding-top: 12rem;
  }
}

/* Minimal bibliography layout */
.sources-page {
  grid-template-columns: 20rem minmax(0, 1fr);
  gap: 2.5rem;
  width: min(100%, var(--page-width));
  margin: 0 auto;
  padding: 7rem 1.25rem 3rem;
}

.route-sidebar,
.source-group {
  background: transparent;
  border: 0;
  backdrop-filter: none;
}

.route-sidebar {
  position: sticky;
  top: 5.5rem;
  gap: 0.8rem;
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
  font-size: clamp(1.4rem, 2.4vw, 2.15rem);
  font-weight: 540;
}

.source-stack {
  gap: 2.5rem;
}

.source-group {
  gap: 1.1rem;
  padding: 0 0 2.5rem;
  border-bottom: 1px solid var(--atlas-line);
}

.record-grid {
  gap: 0 1.25rem;
}

.record-card {
  gap: 0.35rem;
  padding: 0.9rem 0;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--atlas-line);
}

.record-card:hover {
  padding-left: 0.65rem;
  background: var(--atlas-accent-soft);
  border-color: var(--atlas-line);
}

.record-card span,
.audio span {
  padding: 0;
  color: var(--atlas-accent);
  background: transparent;
}

@media (max-width: 900px) {
  .sources-page,
  .record-grid {
    grid-template-columns: 1fr;
  }

  .sources-page {
    gap: 2.5rem;
    padding-top: 11.5rem;
  }

  .route-sidebar {
    position: static;
    padding-right: 0;
    border-right: 0;
  }
}
</style>
