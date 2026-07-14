<script setup lang="ts">
import { computed } from 'vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { getLocalized, getSourceById, regionScenes } from '@/data/researchContent'
import { navigateTo, useCurrentRoute } from '@/router'

const atlas = useAtlasState()
const route = useCurrentRoute()
const language = computed(() => atlas.language.value)
const selectedRegion = computed(() => {
  const queryValue = Array.isArray(route.value.query.region) ? route.value.query.region[0] : route.value.query.region
  const legacyValue = Array.isArray(route.value.query.countries) ? route.value.query.countries[0] : route.value.query.countries
  return regionScenes.find((region) => region.id === queryValue) ?? regionScenes.find((region) => region.id === legacyValue?.split(',')[0]) ?? regionScenes[0]
})
const selectedSources = computed(() => selectedRegion.value.sourceIds.map(getSourceById).filter((source): source is NonNullable<typeof source> => Boolean(source)))

function selectRegion(regionId: string) {
  navigateTo({ path: '/countries', query: { region: regionId, countries: regionId, lang: language.value } })
}
</script>

<template>
  <main class="research-page">
    <aside class="research-sidebar">
      <p class="research-kicker">{{ language === 'zh' ? '地区音乐场景' : 'REGIONAL MUSIC SCENES' }}</p>
      <h1>{{ language === 'zh' ? '制度、媒介与聆听' : 'Institutions, media and listening' }}</h1>
      <p>{{ language === 'zh' ? '这里比较音乐如何被生产、管理和听见。“地区”是研究入口，不等于把复杂政权关系简化成固定国界。' : 'These regional entries compare how music was made, governed and heard. They do not reduce complex political control to fixed borders.' }}</p>
      <div class="research-index" aria-label="Region index">
        <button v-for="(region, index) in regionScenes" :key="region.id" type="button" :class="{ active: region.id === selectedRegion.id }" @click="selectRegion(region.id)">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ getLocalized(region.name, language) }}</strong>
        </button>
      </div>
    </aside>

    <section class="research-main">
      <article class="research-surface">
        <header class="research-heading">
          <p class="research-kicker">1931—1945</p>
          <h2>{{ getLocalized(selectedRegion.name, language) }}</h2>
          <p class="research-lead">{{ getLocalized(selectedRegion.overview, language) }}</p>
        </header>

        <div class="research-grid">
          <section class="research-card">
            <h3>{{ language === 'zh' ? '政治与制度环境' : 'Political and institutional setting' }}</h3>
            <p>{{ getLocalized(selectedRegion.politics, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '广播、唱片与演出媒介' : 'Broadcast, records and performance' }}</h3>
            <p>{{ getLocalized(selectedRegion.media, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '官方或军事使用' : 'Official or military use' }}</h3>
            <p>{{ getLocalized(selectedRegion.officialUse, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '日常聆听' : 'Everyday listening' }}</h3>
            <p>{{ getLocalized(selectedRegion.dailyLife, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '人员与音乐流动' : 'Movement of people and music' }}</h3>
            <p>{{ getLocalized(selectedRegion.movement, language) }}</p>
          </section>
          <section class="research-card">
            <h3>{{ language === 'zh' ? '区域内部差异' : 'Differences within the region' }}</h3>
            <p>{{ getLocalized(selectedRegion.differences, language) }}</p>
          </section>
          <section class="research-card wide">
            <h3>{{ language === 'zh' ? '可继续核查的作品与材料' : 'Works and material for further checking' }}</h3>
            <ul><li v-for="example in selectedRegion.examples" :key="example">{{ example }}</li></ul>
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
