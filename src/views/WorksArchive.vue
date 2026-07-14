<script setup lang="ts">
import { computed } from 'vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { getLocalized, getSourceById, researchWorks } from '@/data/researchContent'
import { navigateTo, useCurrentRoute } from '@/router'

const atlas = useAtlasState()
const route = useCurrentRoute()
const language = computed(() => atlas.language.value)
const selectedWork = computed(() => {
  const queryValue = Array.isArray(route.value.query.work) ? route.value.query.work[0] : route.value.query.work
  return researchWorks.find((work) => work.id === queryValue) ?? researchWorks[0]
})
const selectedSources = computed(() => selectedWork.value.sourceIds.map(getSourceById).filter((source): source is NonNullable<typeof source> => Boolean(source)))
const statusLabels = {
  A: { zh: 'A · 战时版本可核查', en: 'A · Wartime version verified' },
  B: { zh: 'B · 战时作品，当前试听版本较晚', en: 'B · Wartime work, later listening copy' },
  C: { zh: 'C · 仅作背景或待补证', en: 'C · Context only or pending evidence' },
}

function selectWork(workId: string) {
  navigateTo({ path: '/works', query: { work: workId, lang: language.value } })
}
</script>

<template>
  <main class="research-page">
    <aside class="research-sidebar">
      <p class="research-kicker">{{ language === 'zh' ? '作品与录音' : 'WORKS AND RECORDINGS' }}</p>
      <h1>{{ language === 'zh' ? '版本先于试听' : 'Version before listening' }}</h1>
      <p>{{ language === 'zh' ? '创作、首演、录音、发行、再版和数字化是不同日期。每个条目只陈述当前资料能够支持的版本结论。' : 'Composition, performance, recording, release, reissue and digitisation are different dates. Each entry states only what the current evidence supports.' }}</p>
      <div class="research-index" aria-label="Work index">
        <button v-for="(work, index) in researchWorks" :key="work.id" type="button" :class="{ active: work.id === selectedWork.id }" @click="selectWork(work.id)">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ work.title }}</strong>
        </button>
      </div>
    </aside>

    <section class="research-main">
      <article class="research-surface">
        <header class="research-heading">
          <p class="research-kicker">{{ language === 'zh' ? '作品档案' : 'WORK RECORD' }}</p>
          <h2>{{ selectedWork.title }}</h2>
          <p class="research-lead">{{ getLocalized(selectedWork.translatedTitle, language) }}</p>
          <div class="research-meta"><span class="status-pill">{{ statusLabels[selectedWork.status][language] }}</span></div>
        </header>

        <div class="research-grid">
          <section class="research-card wide">
            <h3>{{ language === 'zh' ? '创作者与表演者' : 'Creators and performers' }}</h3>
            <p>{{ getLocalized(selectedWork.creators, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '创作' : 'Composition' }}</h3>
            <p>{{ getLocalized(selectedWork.composition, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '首次使用或演出' : 'First use or performance' }}</h3>
            <p>{{ getLocalized(selectedWork.firstUse, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '录音与版本' : 'Recording and version' }}</h3>
            <p>{{ getLocalized(selectedWork.recording, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '语言与类型' : 'Language and type' }}</h3>
            <p>{{ getLocalized(selectedWork.languageAndType, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '传播场景' : 'Circulation' }}</h3>
            <p>{{ getLocalized(selectedWork.circulation, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '与战争的关系' : 'Relation to war' }}</h3>
            <p>{{ getLocalized(selectedWork.relation, language) }}</p>
          </section>
          <section class="research-card wide status-note">
            <h3>{{ language === 'zh' ? '版本判断' : 'Version judgement' }}</h3>
            <p>{{ getLocalized(selectedWork.statusNote, language) }}</p>
          </section>
          <section class="research-card wide">
            <h3>{{ language === 'zh' ? '本条资料' : 'Sources for this entry' }}</h3>
            <div class="research-links">
              <a v-for="source in selectedSources" :key="source.id" :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.id }} · {{ source.institution }}</a>
            </div>
          </section>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.status-note { border-left-color: rgba(214,177,112,.55); }
</style>
