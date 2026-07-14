<script setup lang="ts">
import { computed } from 'vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { getLocalized, getSourceById, relationTypes, researchEvents, researchWorks } from '@/data/researchContent'
import { navigateTo, useCurrentRoute } from '@/router'

const atlas = useAtlasState()
const route = useCurrentRoute()
const language = computed(() => atlas.language.value)

const selectedEvent = computed(() => {
  const queryValue = Array.isArray(route.value.query.event) ? route.value.query.event[0] : route.value.query.event
  return researchEvents.find((event) => event.id === queryValue) ?? researchEvents[0]
})
const selectedRelations = computed(() => relationTypes.filter((relation) => selectedEvent.value.relationTypes.includes(relation.id)))
const selectedSources = computed(() => selectedEvent.value.sourceIds.map(getSourceById).filter((source): source is NonNullable<typeof source> => Boolean(source)))

async function selectEvent(eventId: string) {
  const event = researchEvents.find((item) => item.id === eventId)
  if (!event) return
  await atlas.setYear(event.year)
  await navigateTo({ path: '/events', query: { event: event.id, year: event.year, lang: language.value } })
}

function openWork(title: string) {
  const work = researchWorks.find((item) => item.title === title || item.translatedTitle.zh === title || item.translatedTitle.en === title)
  if (work) navigateTo({ path: '/works', query: { work: work.id, lang: language.value } })
}
</script>

<template>
  <main class="research-page">
    <aside class="research-sidebar">
      <p class="research-kicker">{{ language === 'zh' ? '历史时间线' : 'HISTORICAL TIMELINE' }}</p>
      <h1>1931—1945</h1>
      <p>{{ language === 'zh' ? '事件与音乐的关系按证据强度分别说明，不把后来流行的作品倒贴到更早事件。' : 'Musical relations are stated by evidence, without projecting later popularity back onto earlier events.' }}</p>
      <div class="research-index" aria-label="Timeline index">
        <button
          v-for="event in researchEvents"
          :key="event.id"
          type="button"
          :class="{ active: event.id === selectedEvent.id }"
          @click="selectEvent(event.id)"
        >
          <span>{{ event.year }}</span>
          <strong>{{ language === 'zh' ? event.titleZh : event.titleEn }}</strong>
        </button>
      </div>
    </aside>

    <section class="research-main">
      <article class="research-surface">
        <header class="research-heading">
          <p class="research-kicker">{{ getLocalized(selectedEvent.dateLabel, language) }}</p>
          <h2>{{ language === 'zh' ? selectedEvent.titleZh : selectedEvent.titleEn }}</h2>
          <p class="research-lead">{{ language === 'zh' ? selectedEvent.descriptionZh : selectedEvent.descriptionEn }}</p>
          <div class="research-meta">
            <span>{{ getLocalized(selectedEvent.place, language) }}</span>
            <span>{{ language === 'zh' ? `事件年份 ${selectedEvent.year}` : `Event year ${selectedEvent.year}` }}</span>
          </div>
        </header>

        <div class="research-grid">
          <section class="research-card wide">
            <h3>{{ language === 'zh' ? '事件事实' : 'Event facts' }}</h3>
            <p>{{ getLocalized(selectedEvent.fact, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '地点与参与者' : 'Place and participants' }}</h3>
            <p>{{ getLocalized(selectedEvent.participants, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '音乐关系' : 'Musical relation' }}</h3>
            <p>{{ getLocalized(selectedEvent.musicRelation, language) }}</p>
          </section>
          <section class="research-card wide">
            <h3>{{ language === 'zh' ? '关系类型' : 'Relation types' }}</h3>
            <div class="relation-list">
              <div v-for="relation in selectedRelations" :key="relation.id">
                <span class="relation-pill">{{ relation.id }}</span>
                <p><strong>{{ getLocalized(relation.title, language) }}</strong><br>{{ getLocalized(relation.description, language) }}</p>
              </div>
            </div>
          </section>
          <section v-if="selectedEvent.relatedWorks.length" class="research-card">
            <h3>{{ language === 'zh' ? '相关作品' : 'Related works' }}</h3>
            <div class="research-links">
              <button v-for="work in selectedEvent.relatedWorks" :key="work" class="research-action" type="button" @click="openWork(work)">{{ work }}</button>
            </div>
          </section>
          <section class="research-card" :class="{ wide: !selectedEvent.relatedWorks.length }">
            <h3>{{ language === 'zh' ? '证据边界' : 'Evidence boundary' }}</h3>
            <p>{{ getLocalized(selectedEvent.uncertainty, language) }}</p>
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
.relation-list { display: grid; gap: .7rem; }
.relation-list > div { display: grid; grid-template-columns: auto 1fr; gap: .7rem; align-items: start; }
.relation-list p { margin: 0; color: var(--atlas-muted); line-height: 1.6; }
.relation-list strong { color: var(--atlas-text); font-weight: 550; }
.research-action { cursor: pointer; }
</style>
