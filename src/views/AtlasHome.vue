<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { researchEvents } from '@/data/researchContent'
import { YEAR_MAX, YEAR_MIN, type LayerKey } from '@/data/ww2MusicAtlas'
import { navigateTo } from '@/router'

const GlobeStage = defineAsyncComponent(() => import('@/components/GlobeStage.vue'))
const atlas = useAtlasState()
const layers: LayerKey[] = ['events']

const language = computed(() => atlas.language.value)
const currentEvent = computed(() => {
  const exact = researchEvents.find((event) => event.year === atlas.activeYear.value)
  if (exact) return exact

  return [...researchEvents]
    .filter((event) => event.year <= atlas.activeYear.value)
    .sort((left, right) => right.year - left.year)[0] ?? researchEvents[0]
})
const focusPose = computed(() => currentEvent.value?.globeFocus ?? { lat: 30, lng: 20, altitude: 2.2 })
const timelineProgress = computed(() => `${((atlas.activeYear.value - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100}%`)

const readingEntries = [
  { path: '/events' as const, index: '01', zh: '历史时间线', en: 'Historical timeline', noteZh: '十四个事件，分别说明事实、地点与音乐关系。', noteEn: 'Fourteen events with facts, locations and musical relations.' },
  { path: '/countries' as const, index: '02', zh: '地区音乐场景', en: 'Regional music scenes', noteZh: '比较八个地区的制度、媒介、日常聆听与跨境流动。', noteEn: 'Compare institutions, media, listening and circulation across eight regions.' },
  { path: '/works' as const, index: '03', zh: '作品与录音', en: 'Works and recordings', noteZh: '区分创作、首演、录音、再版与数字化版本。', noteEn: 'Separate composition, performance, recording, reissue and digitisation.' },
  { path: '/people' as const, index: '04', zh: '人物与机构', en: 'People and institutions', noteZh: '把音乐活动放回广播、军队、文化管理与演出网络。', noteEn: 'Place music within broadcast, military, cultural and performance networks.' },
]

async function selectEvent(eventId: string) {
  const event = researchEvents.find((item) => item.id === eventId)
  if (!event) return

  await atlas.setYear(event.year)
  await navigateTo({ path: '/events', query: { event: event.id, year: event.year, lang: language.value } })
}

function openEntry(path: '/events' | '/countries' | '/works' | '/people') {
  navigateTo({ path, query: { year: atlas.activeYear.value, lang: language.value } })
}
</script>

<template>
  <main class="atlas-home">
    <section class="map-hero">
      <div class="map-copy">
        <p class="eyebrow">{{ language === 'zh' ? '数字历史研究 · 1931—1945' : 'DIGITAL HISTORY · 1931—1945' }}</p>
        <h1>{{ language === 'zh' ? '战争年代的音乐地图' : 'Music in an Age of War' }}</h1>
        <p class="intro">
          {{
            language === 'zh'
              ? '以音乐作品、广播、演出与制度为线索，观察战争如何改变音乐的创作、传播和使用。'
              : 'An atlas of works, broadcasts, performances and institutions, tracing how war changed musical creation, circulation and use.'
          }}
        </p>
        <p class="scope-note">
          {{
            language === 'zh'
              ? '时间从1931年东亚冲突扩大开始；欧洲战事主要从1939年展开。地图只用于定位材料，不把法理领土、占领与实际控制混为一谈。'
              : 'The chronology begins with the expansion of conflict in East Asia in 1931; the European war begins chiefly in 1939. The map locates evidence without equating legal territory, occupation and effective control.'
          }}
        </p>
      </div>

      <div class="globe-wrap" aria-label="Interactive historical globe">
        <GlobeStage
          :active-year="atlas.activeYear.value"
          chrome="minimal"
          :countries="atlas.countries"
          :enabled-layers="layers"
          :events="researchEvents"
          :focus-pose="focusPose"
          :highlighted-event-id="currentEvent?.id ?? null"
          :language="language"
          :selected-artist-id="null"
          :selected-country-ids="[]"
          :timeline-playing="atlas.isPlaying.value"
          @select-event="selectEvent"
        />
      </div>

      <div class="map-controls">
        <button class="play-button" type="button" @click="atlas.togglePlay">
          <span aria-hidden="true">{{ atlas.isPlaying.value ? 'Ⅱ' : '▶' }}</span>
          {{ atlas.isPlaying.value ? (language === 'zh' ? '暂停' : 'Pause') : language === 'zh' ? '播放' : 'Play' }}
        </button>
        <strong>{{ atlas.activeYear.value }}</strong>
        <div class="slider-wrap">
          <input
            :value="atlas.activeYear.value"
            type="range"
            :min="YEAR_MIN"
            :max="YEAR_MAX"
            step="1"
            :style="{ '--timeline-progress': timelineProgress }"
            :aria-label="language === 'zh' ? '选择年份' : 'Select year'"
            @input="atlas.setYear(Number(($event.target as HTMLInputElement).value))"
          />
          <div class="year-range"><span>1931</span><span>1945</span></div>
        </div>
        <button v-if="currentEvent" class="current-event" type="button" @click="selectEvent(currentEvent.id)">
          <span>{{ language === 'zh' ? '当前材料' : 'Current material' }}</span>
          {{ language === 'zh' ? currentEvent.titleZh : currentEvent.titleEn }}
        </button>
      </div>
    </section>

    <section class="reading-section">
      <header>
        <p class="eyebrow">{{ language === 'zh' ? '研究路径' : 'RESEARCH PATHS' }}</p>
        <h2>{{ language === 'zh' ? '从地图进入材料' : 'Enter the evidence from the map' }}</h2>
        <p>{{ language === 'zh' ? '每个页面只展开一类材料，避免把历史叙述压缩成一张拥挤的总览。' : 'Each page opens one class of evidence instead of compressing the history into a crowded overview.' }}</p>
      </header>

      <div class="reading-grid">
        <button v-for="entry in readingEntries" :key="entry.path" type="button" @click="openEntry(entry.path)">
          <span>{{ entry.index }}</span>
          <strong>{{ language === 'zh' ? entry.zh : entry.en }}</strong>
          <p>{{ language === 'zh' ? entry.noteZh : entry.noteEn }}</p>
          <i aria-hidden="true">→</i>
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.atlas-home { background: #090a0c; color: var(--atlas-text); }
.map-hero { position: relative; min-height: 100vh; padding-top: 58px; overflow: hidden; background: radial-gradient(circle at 68% 38%, rgba(30, 56, 111, .24), transparent 42rem), #090a0c; }
.map-copy { position: absolute; z-index: 3; top: clamp(7.5rem, 15vh, 10.5rem); left: max(1.5rem, calc((100vw - var(--page-width)) / 2)); width: min(31rem, 38vw); padding: 1.5rem 1.5rem 1.7rem; border-left: 2px solid var(--atlas-accent); background: linear-gradient(90deg, rgba(9, 10, 12, .95), rgba(9, 10, 12, .72)); }
.eyebrow { margin: 0; color: var(--atlas-accent); font-size: .7rem; font-weight: 650; letter-spacing: .15em; }
.map-copy h1 { max-width: 28rem; margin: .75rem 0; font-size: clamp(2.2rem, 4.7vw, 4.7rem); font-weight: 450; line-height: .98; letter-spacing: -.045em; }
.intro { max-width: 29rem; margin: 0; color: rgba(245, 245, 247, .78); font-size: clamp(.95rem, 1.4vw, 1.12rem); line-height: 1.7; }
.scope-note { max-width: 29rem; margin: 1.15rem 0 0; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,.1); color: var(--atlas-faint); font-size: .78rem; line-height: 1.65; }
.globe-wrap { position: absolute; inset: 58px 0 7.25rem; min-height: 34rem; }
.map-controls { position: absolute; z-index: 5; right: max(1.5rem, calc((100vw - var(--page-width)) / 2)); bottom: 1.35rem; left: max(1.5rem, calc((100vw - var(--page-width)) / 2)); display: grid; grid-template-columns: auto auto minmax(12rem, 1fr) minmax(12rem, 20rem); gap: 1rem; align-items: center; padding: 1rem; border: 1px solid rgba(255,255,255,.1); background: rgba(12,13,15,.86); backdrop-filter: blur(16px); }
.play-button, .current-event { border: 0; color: var(--atlas-text); cursor: pointer; }
.play-button { min-height: 2.5rem; padding: .55rem .9rem; background: var(--atlas-accent); color: #17130d; font-weight: 650; }
.play-button span { margin-right: .45rem; }
.map-controls > strong { min-width: 3.2rem; font-size: 1.5rem; font-variant-numeric: tabular-nums; }
.slider-wrap { display: grid; gap: .3rem; }
.slider-wrap input { width: 100%; accent-color: var(--atlas-accent); }
.year-range { display: flex; justify-content: space-between; color: var(--atlas-faint); font-size: .66rem; }
.current-event { display: grid; gap: .2rem; padding: .45rem .7rem; border-left: 1px solid rgba(214,177,112,.45); background: transparent; text-align: left; font-size: .82rem; }
.current-event span { color: var(--atlas-accent); font-size: .62rem; letter-spacing: .08em; }
.reading-section { padding: clamp(4rem, 8vw, 7rem) max(1.5rem, calc((100vw - var(--page-width)) / 2)); }
.reading-section header { max-width: 48rem; }
.reading-section h2 { margin: .6rem 0 .8rem; font-size: clamp(2rem, 4vw, 3.6rem); font-weight: 450; letter-spacing: -.035em; }
.reading-section header > p:last-child { color: var(--atlas-muted); line-height: 1.7; }
.reading-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 2.5rem; border-top: 1px solid rgba(255,255,255,.11); }
.reading-grid button { position: relative; display: grid; gap: .7rem; min-height: 14rem; padding: 1.2rem; border: 0; border-right: 1px solid rgba(255,255,255,.09); border-bottom: 1px solid rgba(255,255,255,.09); color: inherit; background: rgba(255,255,255,.018); cursor: pointer; text-align: left; }
.reading-grid button:hover { background: rgba(214,177,112,.06); }
.reading-grid span { color: var(--atlas-accent); font-size: .7rem; }
.reading-grid strong { font-size: 1.2rem; font-weight: 500; }
.reading-grid p { margin: 0; color: var(--atlas-muted); font-size: .82rem; line-height: 1.65; }
.reading-grid i { align-self: end; color: var(--atlas-accent); font-style: normal; font-size: 1.3rem; }
@media (max-width: 1000px) { .map-hero { min-height: 61rem; padding-top: 7rem; } .map-copy { top: 8rem; width: min(32rem, calc(100vw - 3rem)); } .globe-wrap { inset: 18rem 0 10rem; } .map-controls { grid-template-columns: auto auto 1fr; } .current-event { grid-column: 1 / -1; } .reading-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 650px) { .map-hero { min-height: 66rem; } .map-copy { left: 1rem; width: calc(100vw - 2rem); padding: 1.1rem; } .map-copy h1 { font-size: 2.45rem; } .globe-wrap { inset: 23rem -6rem 11.5rem; } .map-controls { right: 1rem; bottom: 1rem; left: 1rem; grid-template-columns: auto 1fr; gap: .7rem; } .slider-wrap { grid-column: 1 / -1; } .reading-grid { grid-template-columns: 1fr; } }
</style>
