<script setup lang="ts">
import type { AtlasMode, ChapterScene, CountryProfile, Language, LayerKey } from '@/data/ww2MusicAtlas'
import { getChapterTitle, getCountryName } from '@/lib/atlas'

const props = defineProps<{
  activeMode: AtlasMode
  activeChapterId: string
  enabledLayers: LayerKey[]
  language: Language
  selectedCountryIds: string[]
  countries: CountryProfile[]
  chapters: ChapterScene[]
}>()

const emit = defineEmits<{
  'update:mode': [mode: AtlasMode]
  'update:language': [language: Language]
  'toggle-layer': [layer: LayerKey]
  'toggle-country': [countryId: string]
  'jump-chapter': [chapterId: string]
}>()

function isLayerEnabled(layer: LayerKey) {
  return props.enabledLayers.includes(layer)
}
</script>

<template>
  <section class="controls" data-testid="atlas-controls">
    <p class="kicker">{{ language === 'zh' ? '数字历史研究 · 1931—1945' : 'DIGITAL HISTORY · 1931—1945' }}</p>
    <h1 class="title">
      {{ language === 'zh' ? '战争年代的音乐地图' : 'Music in an Age of War' }}
    </h1>
    <p class="lede">
      {{
        language === 'zh'
          ? '以作品、广播、演出与制度为线索，观察1931—1945年战争如何改变音乐的创作、传播和使用。'
          : 'Works, broadcasts, performances and institutions trace how war changed musical creation, circulation and use from 1931 to 1945.'
      }}
    </p>

    <div class="segmented" aria-label="Mode switch">
      <button class="segment" :class="{ active: activeMode === 'story' }" type="button" data-testid="mode-story" @click="emit('update:mode', 'story')">
        {{ language === 'zh' ? '叙事' : 'Story' }}
      </button>
      <button class="segment" :class="{ active: activeMode === 'explore' }" type="button" data-testid="mode-explore" @click="emit('update:mode', 'explore')">
        {{ language === 'zh' ? '探索' : 'Explore' }}
      </button>
    </div>

    <div class="row">
      <span class="label">{{ language === 'zh' ? '语言' : 'Language' }}</span>
      <div class="segmented compact">
        <button class="segment" :class="{ active: language === 'zh' }" type="button" data-testid="language-zh" @click="emit('update:language', 'zh')">中文</button>
        <button class="segment" :class="{ active: language === 'en' }" type="button" data-testid="language-en" @click="emit('update:language', 'en')">English</button>
      </div>
    </div>

    <div class="row">
      <span class="label">{{ language === 'zh' ? '图层' : 'Layers' }}</span>
      <div class="chip-list">
        <button
          v-for="layer in (['styles', 'events', 'influence'] as LayerKey[])"
          :key="layer"
          class="chip"
          :class="{ active: isLayerEnabled(layer) }"
          type="button"
          @click="emit('toggle-layer', layer)"
        >
          {{
            layer === 'styles'
              ? language === 'zh'
                ? '地区'
                : 'Regions'
              : layer === 'events'
                ? language === 'zh'
                  ? '事件'
                  : 'Events'
                : language === 'zh'
                  ? '影响'
                  : 'Influence'
          }}
        </button>
      </div>
    </div>

    <div v-if="activeMode === 'story'" class="story-grid">
      <button
        v-for="chapter in chapters"
        :key="chapter.id"
        class="chapter-button"
        :class="{ active: chapter.id === activeChapterId }"
        type="button"
        @click="emit('jump-chapter', chapter.id)"
      >
        <span>{{ getChapterTitle(chapter, language) }}</span>
        <small>{{ chapter.yearRange[0] }}-{{ chapter.yearRange[1] }}</small>
      </button>
    </div>

    <div v-else class="country-picker">
      <span class="label">{{ language === 'zh' ? '国家对比' : 'Country compare' }}</span>
      <div class="chip-list">
        <button
          v-for="country in countries"
          :key="country.id"
          class="chip country-chip"
          :class="{ active: selectedCountryIds.includes(country.id) }"
          type="button"
          :style="{ '--chip-color': country.color }"
          @click="emit('toggle-country', country.id)"
        >
          {{ getCountryName(country, language) }}
        </button>
      </div>
      <p class="hint">
        {{ language === 'zh' ? '最多选择两个国家进行并排阅读。' : 'Select up to two countries for side-by-side reading.' }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.controls {
  display: grid;
  gap: 1rem;
  max-width: 34rem;
  padding: 1.2rem 1.35rem 1.4rem;
  background: linear-gradient(180deg, rgba(8, 13, 19, 0.82), rgba(8, 13, 19, 0.48));
  border: 1px solid var(--atlas-line);
  backdrop-filter: blur(18px);
  box-shadow: var(--atlas-shadow);
}

.kicker,
.label {
  margin: 0;
  color: var(--atlas-accent);
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.title {
  margin: 0;
  max-width: 10ch;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: clamp(2.4rem, 4vw, 4.8rem);
  line-height: 0.92;
}

.lede,
.hint {
  margin: 0;
  max-width: 34rem;
  color: var(--atlas-muted);
  font-size: 0.95rem;
}

.row,
.country-picker {
  display: grid;
  gap: 0.65rem;
}

.label {
  color: rgba(255, 255, 255, 0.62);
}

.segmented,
.chip-list,
.story-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.compact {
  width: fit-content;
}

.segment,
.chip,
.chapter-button {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: var(--atlas-text);
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.segment {
  padding: 0.64rem 1rem;
  min-width: 6rem;
}

.chip {
  padding: 0.5rem 0.85rem;
}

.chapter-button {
  display: grid;
  gap: 0.25rem;
  padding: 0.72rem 0.82rem;
  min-width: 10rem;
  text-align: left;
}

.chapter-button small {
  color: rgba(255, 255, 255, 0.58);
}

.country-chip::before {
  content: '';
  display: inline-block;
  width: 0.55rem;
  height: 0.55rem;
  margin-right: 0.5rem;
  border-radius: 999px;
  background: var(--chip-color);
}

.segment.active,
.chip.active,
.chapter-button.active,
.segment:hover,
.chip:hover,
.chapter-button:hover {
  background: rgba(41, 151, 255, 0.14);
  border-color: rgba(41, 151, 255, 0.44);
  transform: translateY(-1px);
}

@media (max-width: 760px) {
  .controls {
    max-width: none;
    padding: 1rem;
  }

  .title {
    max-width: 12ch;
    font-size: clamp(2rem, 13vw, 3.4rem);
  }
}
</style>
