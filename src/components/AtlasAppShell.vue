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
  grid-template-columns: minmax(12rem, 1fr) auto minmax(8rem, 1fr);
  gap: 1rem;
  align-items: center;
  padding: 0.8rem 1.2rem;
  color: var(--atlas-text);
  background: linear-gradient(180deg, rgba(7, 10, 15, 0.82), rgba(7, 10, 15, 0.36));
  border-bottom: 1px solid rgba(239, 228, 208, 0.08);
  backdrop-filter: blur(18px);
}

.brand,
.nav-actions button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.brand {
  display: grid;
  gap: 0.1rem;
  justify-self: start;
  min-width: 0;
  max-width: 28rem;
  padding: 0;
  text-align: left;
}

.brand span {
  color: var(--atlas-accent);
  font-size: 0.68rem;
  letter-spacing: 0.24em;
}

.brand strong {
  font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.nav-links {
  display: flex;
  gap: 0.35rem;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(239, 228, 208, 0.08);
}

.nav-links a,
.nav-actions button {
  padding: 0.52rem 0.8rem;
  color: rgba(239, 228, 208, 0.72);
  text-decoration: none;
  transition: background 180ms ease, color 180ms ease;
}

.nav-links a.active,
.nav-links a:hover,
.nav-actions button.active,
.nav-actions button:hover {
  background: rgba(201, 143, 88, 0.14);
  color: var(--atlas-text);
}

.nav-actions {
  display: flex;
  justify-self: end;
  gap: 0.25rem;
  border: 1px solid rgba(239, 228, 208, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

@media (max-width: 760px) {
  .site-nav {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.6rem;
    padding: 0.7rem;
  }

  .brand strong {
    font-size: 0.95rem;
    display: -webkit-box;
    overflow: hidden;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .nav-links {
    grid-column: 1 / -1;
    justify-self: stretch;
    overflow-x: auto;
  }

  .nav-actions {
    grid-column: 2;
    grid-row: 1;
    align-self: start;
    justify-self: end;
  }

  .nav-links a {
    flex: 1;
    text-align: center;
    white-space: nowrap;
  }
}

@media (min-width: 761px) and (max-width: 1180px) {
  .site-nav {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .nav-links {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-self: stretch;
    overflow-x: auto;
  }

  .nav-links a {
    flex: 1;
    text-align: center;
    white-space: nowrap;
  }

  .nav-actions {
    grid-column: 2;
    grid-row: 1;
  }
}
</style>
