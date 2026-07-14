<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAtlasState } from '@/composables/useAtlasState'
import { getLocalized, methodSections } from '@/data/researchContent'

const atlas = useAtlasState()
const language = computed(() => atlas.language.value)
const selectedId = ref(methodSections[0].id)
const selectedSection = computed(() => methodSections.find((section) => section.id === selectedId.value) ?? methodSections[0])
</script>

<template>
  <main class="research-page" data-testid="training-data-page">
    <aside class="research-sidebar">
      <p class="research-kicker">{{ language === 'zh' ? '数字研究方法' : 'DIGITAL RESEARCH METHODS' }}</p>
      <h1>{{ language === 'zh' ? '材料怎样成为数据' : 'How material becomes data' }}</h1>
      <p>{{ language === 'zh' ? '本页记录筛选、标注和权利判断。它解释研究流程，不把AI生成内容当作历史材料。' : 'This page records selection, annotation and rights decisions. It explains the workflow without treating AI output as historical evidence.' }}</p>
      <div class="research-index" aria-label="Method chapters">
        <button v-for="(section, index) in methodSections" :key="section.id" type="button" :class="{ active: section.id === selectedSection.id }" @click="selectedId = section.id">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ getLocalized(section.title, language) }}</strong>
        </button>
      </div>
    </aside>

    <section class="research-main">
      <article class="research-surface method-surface">
        <header class="research-heading">
          <p class="research-kicker">{{ language === 'zh' ? '方法记录' : 'METHOD RECORD' }}</p>
          <h2>{{ getLocalized(selectedSection.title, language) }}</h2>
          <p class="research-lead">{{ getLocalized(selectedSection.summary, language) }}</p>
        </header>
        <section class="research-card method-card">
          <h3>{{ language === 'zh' ? '执行原则' : 'Working principles' }}</h3>
          <ol class="method-points">
            <li v-for="point in selectedSection.points" :key="point.zh">{{ getLocalized(point, language) }}</li>
          </ol>
        </section>
      </article>
    </section>
  </main>
</template>

<style scoped>
.method-surface { min-height: min(42rem, calc(100vh - 8rem)); }
.method-card { max-width: 54rem; margin-top: 1rem; padding: clamp(1.2rem, 3vw, 2rem); }
.method-points { counter-reset: methods; list-style: none; padding: 0; }
.method-points li { display: grid; grid-template-columns: 2rem 1fr; gap: .75rem; align-items: start; }
.method-points li::before { counter-increment: methods; content: counter(methods, decimal-leading-zero); color: var(--atlas-accent); font-size: .7rem; }
</style>
