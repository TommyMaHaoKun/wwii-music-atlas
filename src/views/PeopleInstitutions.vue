<script setup lang="ts">
import { computed } from 'vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { getLocalized, getSourceById, researchInstitutions, researchPeople, type ResearchInstitution, type ResearchPerson } from '@/data/researchContent'
import { navigateTo, useCurrentRoute } from '@/router'

type ArchiveType = 'people' | 'institutions'

const atlas = useAtlasState()
const route = useCurrentRoute()
const language = computed(() => atlas.language.value)
const archiveType = computed<ArchiveType>(() => {
  const value = Array.isArray(route.value.query.type) ? route.value.query.type[0] : route.value.query.type
  return value === 'institutions' ? 'institutions' : 'people'
})
const entries = computed(() => archiveType.value === 'people' ? researchPeople : researchInstitutions)
const selectedEntry = computed(() => {
  const value = Array.isArray(route.value.query.entry) ? route.value.query.entry[0] : route.value.query.entry
  return entries.value.find((entry) => entry.id === value) ?? entries.value[0]
})
const selectedSources = computed(() => selectedEntry.value.sourceIds.map(getSourceById).filter((source): source is NonNullable<typeof source> => Boolean(source)))

function labelForEntry(entry: ResearchPerson | ResearchInstitution) {
  if (typeof entry.name === 'string') return entry.name
  return getLocalized(entry.name, language.value)
}

function setType(type: ArchiveType) {
  const firstEntry = type === 'people' ? researchPeople[0] : researchInstitutions[0]
  navigateTo({ path: '/people', query: { type, entry: firstEntry.id, lang: language.value } })
}

function selectEntry(entryId: string) {
  navigateTo({ path: '/people', query: { type: archiveType.value, entry: entryId, lang: language.value } })
}
</script>

<template>
  <main class="research-page">
    <aside class="research-sidebar">
      <p class="research-kicker">{{ language === 'zh' ? '人物与机构' : 'PEOPLE AND INSTITUTIONS' }}</p>
      <h1>{{ language === 'zh' ? '音乐如何进入制度' : 'Music within institutions' }}</h1>
      <p>{{ language === 'zh' ? '人物不是孤立的“名人”；创作、演出和广播都发生在具体机构、职业规则与传播网络中。' : 'People are not isolated celebrities: creation, performance and broadcast occurred within institutions, professional rules and media networks.' }}</p>
      <div class="research-tabs">
        <button type="button" :class="{ active: archiveType === 'people' }" @click="setType('people')">{{ language === 'zh' ? '人物' : 'People' }}</button>
        <button type="button" :class="{ active: archiveType === 'institutions' }" @click="setType('institutions')">{{ language === 'zh' ? '机构' : 'Institutions' }}</button>
      </div>
      <div class="research-index" aria-label="People and institution index">
        <button v-for="(entry, index) in entries" :key="entry.id" type="button" :class="{ active: entry.id === selectedEntry.id }" @click="selectEntry(entry.id)">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ labelForEntry(entry) }}</strong>
        </button>
      </div>
    </aside>

    <section class="research-main">
      <article class="research-surface">
        <template v-if="archiveType === 'people' && 'role' in selectedEntry">
          <header class="research-heading">
            <p class="research-kicker">{{ selectedEntry.years }}</p>
            <h2>{{ selectedEntry.name }}</h2>
            <p class="research-lead">{{ getLocalized(selectedEntry.role, language) }}</p>
            <div class="research-meta"><span>{{ getLocalized(selectedEntry.location, language) }}</span></div>
          </header>
          <div class="research-grid">
            <section class="research-card wide"><h3>{{ language === 'zh' ? '战时活动' : 'Wartime activity' }}</h3><p>{{ getLocalized(selectedEntry.activity, language) }}</p></section>
            <section class="research-card"><h3>{{ language === 'zh' ? '与机构的关系' : 'Institutional relation' }}</h3><p>{{ getLocalized(selectedEntry.institutionalRelation, language) }}</p></section>
            <section class="research-card"><h3>{{ language === 'zh' ? '相关作品' : 'Related works' }}</h3><ul><li v-for="work in selectedEntry.works" :key="work">{{ work }}</li></ul></section>
            <section class="research-card wide"><h3>{{ language === 'zh' ? '解释边界' : 'Interpretive boundary' }}</h3><p>{{ getLocalized(selectedEntry.boundary, language) }}</p></section>
          </div>
        </template>

        <template v-else-if="'period' in selectedEntry">
          <header class="research-heading">
            <p class="research-kicker">{{ selectedEntry.period }}</p>
            <h2>{{ getLocalized(selectedEntry.name, language) }}</h2>
            <p class="research-lead">{{ getLocalized(selectedEntry.activity, language) }}</p>
          </header>
          <div class="research-grid">
            <section class="research-card"><h3>{{ language === 'zh' ? '保存或传播的材料' : 'Material preserved or circulated' }}</h3><p>{{ getLocalized(selectedEntry.materials, language) }}</p></section>
            <section class="research-card"><h3>{{ language === 'zh' ? '机构边界' : 'Institutional boundary' }}</h3><p>{{ getLocalized(selectedEntry.boundary, language) }}</p></section>
          </div>
        </template>

        <section class="research-card sources-block">
          <h3>{{ language === 'zh' ? '本条资料' : 'Sources for this entry' }}</h3>
          <div class="research-links"><a v-for="source in selectedSources" :key="source.id" :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.id }} · {{ source.institution }}</a></div>
        </section>
      </article>
    </section>
  </main>
</template>

<style scoped>
.sources-block { margin-top: 1rem; }
</style>
