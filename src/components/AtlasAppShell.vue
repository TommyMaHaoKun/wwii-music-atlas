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
        <span>1931—1949</span>
        <strong>{{ atlas.language.value === 'zh' ? '二战音乐地图' : 'WWII Music Atlas' }}</strong>
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

    <footer class="site-footer">
      <p>
        {{ atlas.language.value === 'zh' ? '历史国界' : 'Historical borders' }}:
        <a href="https://github.com/aourednik/historical-basemaps" target="_blank" rel="noopener noreferrer">historical-basemaps</a>
        (1938 / 1945, GPL-3.0)
        · {{ atlas.language.value === 'zh' ? '海岸线' : 'Coastlines' }}: Natural Earth
        · {{ atlas.language.value === 'zh' ? '地球渲染' : 'Globe' }}: globe.gl
      </p>
      <p class="footer-note">
        {{
          atlas.language.value === 'zh'
            ? '地图边界按年份显示 1938 或 1945 年的历史政区，用于定位，不代表精确主权。'
            : 'Borders show 1938 or 1945 political territories by year, for orientation — not precise sovereignty.'
        }}
      </p>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.site-footer {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0.35rem;
  padding: 1.4rem clamp(1.2rem, 5vw, 3rem) 1.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: #0b0b0c;
  color: var(--atlas-faint);
  font-size: 0.76rem;
  line-height: 1.5;
  text-align: center;
}

.site-footer p {
  margin: 0;
}

.site-footer a {
  color: var(--atlas-muted);
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.22);
}

.site-footer a:hover {
  color: var(--atlas-text);
}

.footer-note {
  color: rgba(245, 245, 247, 0.4);
}

.site-nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(11rem, 1fr) auto minmax(5rem, 1fr);
  gap: 1.5rem;
  align-items: center;
  height: 58px;
  padding: 0 max(1.25rem, calc((100vw - var(--page-width)) / 2));
  color: var(--atlas-text);
  background: rgba(11, 11, 12, 0.92);
  border-bottom: 1px solid var(--atlas-line);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
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
  gap: 0.05rem;
  justify-self: start;
  min-width: 0;
  max-width: 28rem;
  padding: 0;
  text-align: left;
}

.brand span {
  display: block;
  color: var(--atlas-accent);
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.16em;
}

.brand strong {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-links {
  display: flex;
  gap: 0.2rem;
  padding: 0;
  background: transparent;
  border: 0;
}

.nav-links a {
  position: relative;
  padding: 0.45rem 0.68rem;
  color: rgba(245, 245, 247, 0.72);
  font-size: 0.82rem;
  font-weight: 400;
  text-decoration: none;
  border-radius: 0;
  white-space: nowrap;
  transition: background 200ms ease, color 200ms ease;
}

.nav-links a:hover {
  color: var(--atlas-text);
}

.nav-links a.active {
  color: var(--atlas-text);
  background: transparent;
}

.nav-links a.active::after {
  content: '';
  position: absolute;
  right: 0.68rem;
  bottom: -0.54rem;
  left: 0.68rem;
  height: 1px;
  background: var(--atlas-accent);
}

.nav-actions {
  display: flex;
  justify-self: end;
  gap: 0.05rem;
  padding: 0;
  border: 0;
  background: transparent;
}

.nav-actions button {
  padding: 0.28rem 0.7rem;
  color: rgba(245, 245, 247, 0.72);
  font-size: 0.78rem;
  border-radius: 4px;
  transition: background 200ms ease, color 200ms ease;
}

.nav-actions button.active {
  color: var(--atlas-accent);
  background: transparent;
}

@media (max-width: 1180px) {
  .site-nav {
    grid-template-columns: minmax(0, 1fr) auto;
    height: auto;
    row-gap: 0.5rem;
    padding: 0.55rem clamp(0.8rem, 3vw, 1.4rem);
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

  .nav-links a.active::after {
    bottom: -0.2rem;
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
