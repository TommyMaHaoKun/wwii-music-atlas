<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { getLocalized, researchSources } from '@/data/researchContent'

type SourceFilter = 'all' | 'east-asia' | 'europe' | 'methods'

const atlas = useAtlasState()
const language = computed(() => atlas.language.value)
const activeFilter = ref<SourceFilter>('all')
const search = ref('')
const visibleCount = ref(12)

const filters: Array<{ id: SourceFilter; zh: string; en: string }> = [
  { id: 'all', zh: '全部', en: 'All' },
  { id: 'east-asia', zh: '东亚', en: 'East Asia' },
  { id: 'europe', zh: '欧洲与大西洋', en: 'Europe & Atlantic' },
  { id: 'methods', zh: '方法与权利', en: 'Methods & rights' },
]

const filteredSources = computed(() => {
  const term = search.value.trim().toLowerCase()
  return researchSources.filter((source) => {
    const groupMatch = activeFilter.value === 'all' || source.group === activeFilter.value
    const textMatch = !term || `${source.id} ${source.institution} ${source.title} ${source.support.zh} ${source.support.en}`.toLowerCase().includes(term)
    return groupMatch && textMatch
  })
})
const visibleSources = computed(() => filteredSources.value.slice(0, visibleCount.value))

watch([activeFilter, search], () => { visibleCount.value = 12 })
</script>

<template>
  <main class="research-page source-page">
    <aside class="research-sidebar">
      <p class="research-kicker">{{ language === 'zh' ? '资料与引证' : 'SOURCES AND CITATION' }}</p>
      <h1>{{ language === 'zh' ? '从结论返回证据' : 'From claim back to evidence' }}</h1>
      <p>{{ language === 'zh' ? '资料优先使用档案馆、图书馆、博物馆、政府与广播机构页面。二手概述用于定位线索，不自动替代原始记录。' : 'Sources prioritise archives, libraries, museums, governments and broadcasters. Secondary overviews locate leads but do not automatically replace primary records.' }}</p>
      <div class="source-note">
        <strong>{{ researchSources.length }}</strong>
        <span>{{ language === 'zh' ? '条公开资料链接' : 'public source links' }}</span>
        <small>{{ language === 'zh' ? '网页核查日期：2026年7月14日' : 'Web links checked: 14 July 2026' }}</small>
      </div>
    </aside>

    <section class="research-main">
      <article class="research-surface source-tools">
        <header class="research-heading">
          <p class="research-kicker">{{ language === 'zh' ? '资料目录' : 'SOURCE CATALOGUE' }}</p>
          <h2>{{ language === 'zh' ? '检索与筛选' : 'Search and filter' }}</h2>
          <p class="research-lead">{{ language === 'zh' ? '每条记录说明该资料在网站中支持什么结论；点击后在原机构页面继续核查。' : 'Each record states what it supports on this site; follow the link to inspect the institutional record.' }}</p>
        </header>
        <div class="research-filter">
          <button v-for="filter in filters" :key="filter.id" type="button" :class="{ active: activeFilter === filter.id }" @click="activeFilter = filter.id">{{ language === 'zh' ? filter.zh : filter.en }}</button>
        </div>
        <input v-model="search" class="research-search" type="search" :placeholder="language === 'zh' ? '搜索机构、标题或编号' : 'Search institution, title or ID'">
      </article>

      <div v-if="visibleSources.length" class="source-list">
        <a v-for="source in visibleSources" :key="source.id" class="source-card" :href="source.url" target="_blank" rel="noopener noreferrer">
          <span>{{ source.id }} · {{ getLocalized(source.kind, language) }}</span>
          <small>{{ source.institution }}</small>
          <strong>{{ source.title }}</strong>
          <p>{{ getLocalized(source.support, language) }}</p>
        </a>
      </div>
      <article v-else class="research-surface empty-state">{{ language === 'zh' ? '没有匹配的资料。' : 'No matching sources.' }}</article>
      <button v-if="visibleCount < filteredSources.length" class="load-more" type="button" @click="visibleCount += 12">
        {{ language === 'zh' ? `继续显示（剩余 ${filteredSources.length - visibleCount}）` : `Show more (${filteredSources.length - visibleCount} remaining)` }}
      </button>
    </section>
  </main>
</template>

<style scoped>
.source-page { grid-template-columns: minmax(17rem, 20rem) minmax(0, 1fr); }
.source-note { display: grid; gap: .2rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,.1); }
.source-note strong { color: var(--atlas-accent); font-size: 2.3rem; font-weight: 450; }
.source-note span { color: var(--atlas-text); font-size: .8rem; }
.source-note small { margin-top: .5rem; color: var(--atlas-faint); }
.source-tools { display: grid; gap: 1rem; }
.load-more { min-height: 3rem; border: 1px solid rgba(214,177,112,.3); color: var(--atlas-accent); background: rgba(214,177,112,.05); cursor: pointer; }
.load-more:hover { background: rgba(214,177,112,.1); }
.empty-state { color: var(--atlas-muted); }
</style>
