<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo, routeHref, useCurrentRoute, type AtlasRoutePath } from '@/router'
import { useAtlasState } from '@/composables/useAtlasState'

const route = useCurrentRoute()
const atlas = useAtlasState()

const links: Array<{ path: AtlasRoutePath; labelZh: string; labelEn: string }> = [
  { path: '/', labelZh: '地图首页', labelEn: 'Map' },
  { path: '/events', labelZh: '重大事件', labelEn: 'Events' },
  { path: '/countries', labelZh: '国家风格', labelEn: 'Countries' },
  { path: '/sources', labelZh: '档案资料', labelEn: 'Sources' },
  { path: '/training-data', labelZh: '训练数据', labelEn: 'Training Data' },
  { path: '/generate', labelZh: '生成音乐', labelEn: 'Generate' },
]

const routeQuery = computed(() => ({
  year: atlas.activeYear.value,
  event: atlas.selectedEventId.value,
  countries: atlas.selectedCountryIds.value.join(','),
  lang: atlas.language.value,
}))

function openPath(path: AtlasRoutePath) {
  navigateTo({ path, query: routeQuery.value })
}

function linkHref(path: AtlasRoutePath) {
  return routeHref({ path, query: routeQuery.value })
}
</script>

<template>
  <div class="app-shell">
    <header class="site-nav">
      <button class="brand" type="button" @click="openPath('/')">
        <span>{{ atlas.language.value === 'zh' ? 'AI 二战音乐研究' : 'AI WWII MUSIC STUDY' }}</span>
        <strong>{{ atlas.language.value === 'zh' ? '我用 AI 做的二战音乐地图' : 'My AI Study Map of WWII Music' }}</strong>
      </button>

      <nav class="nav-links" aria-label="Main navigation">
        <a
          v-for="link in links"
          :key="link.path"
          :class="{ active: route.path === link.path }"
          :href="linkHref(link.path)"
          @click.prevent="openPath(link.path)"
        >
          {{ atlas.language.value === 'zh' ? link.labelZh : link.labelEn }}
        </a>
      </nav>

      <div class="nav-actions" aria-label="Language">
        <button type="button" :class="{ active: atlas.language.value === 'zh' }" @click="atlas.setLanguage('zh')">中文</button>
        <button type="button" :class="{ active: atlas.language.value === 'en' }" @click="atlas.setLanguage('en')">EN</button>
      </div>
    </header>

    <slot />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.site-nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(10rem, 1fr) auto minmax(6rem, 1fr);
  gap: 1rem;
  align-items: center;
  height: 52px;
  padding: 0 clamp(1rem, 3vw, 2.2rem);
  color: var(--atlas-text);
  background: rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

.brand,
.nav-actions button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  justify-self: start;
  min-width: 0;
  max-width: 28rem;
  padding: 0;
  text-align: left;
}

.brand span {
  display: none;
}

.brand strong {
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-links {
  display: flex;
  gap: 0.15rem;
  padding: 0;
  background: transparent;
  border: 0;
}

.nav-links a {
  padding: 0.4rem 0.85rem;
  color: rgba(245, 245, 247, 0.72);
  font-size: 0.82rem;
  font-weight: 400;
  text-decoration: none;
  border-radius: 980px;
  white-space: nowrap;
  transition: background 200ms ease, color 200ms ease;
}

.nav-links a:hover {
  color: var(--atlas-text);
}

.nav-links a.active {
  color: var(--atlas-text);
  background: rgba(255, 255, 255, 0.1);
}

.nav-actions {
  display: flex;
  justify-self: end;
  gap: 0.15rem;
  padding: 0.15rem;
  border-radius: 980px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
}

.nav-actions button {
  padding: 0.28rem 0.7rem;
  color: rgba(245, 245, 247, 0.72);
  font-size: 0.78rem;
  border-radius: 980px;
  transition: background 200ms ease, color 200ms ease;
}

.nav-actions button.active {
  color: #fff;
  background: var(--atlas-accent);
}

@media (max-width: 1180px) {
  .site-nav {
    grid-template-columns: minmax(0, 1fr) auto;
    height: auto;
    row-gap: 0.5rem;
    padding: 0.6rem clamp(0.8rem, 3vw, 1.4rem);
  }

  .nav-links {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-self: stretch;
    overflow-x: auto;
    padding-bottom: 0.15rem;
  }

  .nav-links a {
    flex: 0 0 auto;
    text-align: center;
  }

  .nav-actions {
    grid-column: 2;
    grid-row: 1;
    align-self: center;
    justify-self: end;
  }
}

@media (max-width: 760px) {
  .brand strong {
    font-size: 0.9rem;
  }
}
</style>
