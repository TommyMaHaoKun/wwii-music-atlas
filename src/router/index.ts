import { computed } from 'vue'
import { createRouter, createWebHistory, type LocationQueryRaw, type RouteLocationRaw } from 'vue-router'

export type AtlasRoutePath = '/' | '/events' | '/countries' | '/sources' | '/training-data'

export interface RouteTarget {
  path?: AtlasRoutePath
  query?: Record<string, string | number | null | undefined>
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/AtlasHome.vue') },
    { path: '/events', name: 'events', component: () => import('@/views/AtlasEvents.vue') },
    { path: '/countries', name: 'countries', component: () => import('@/views/AtlasCountries.vue') },
    { path: '/sources', name: 'sources', component: () => import('@/views/AtlasSources.vue') },
    { path: '/training-data', name: 'training-data', component: () => import('@/views/TrainingDataShowcase.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

function cleanQuery(query: Record<string, unknown> = {}) {
  return Object.entries(query).reduce<LocationQueryRaw>((nextQuery, [key, value]) => {
    if (Array.isArray(value)) {
      const values = value.filter((item) => item !== null && item !== undefined && item !== '').map(String)
      if (values.length) {
        nextQuery[key] = values
      }
    } else if (value !== null && value !== undefined && value !== '') {
      nextQuery[key] = String(value)
    }
    return nextQuery
  }, {})
}

function buildTarget(target: RouteTarget): RouteLocationRaw {
  return {
    path: target.path ?? router.currentRoute.value.path,
    query: cleanQuery({
      ...router.currentRoute.value.query,
      ...(target.query ?? {}),
    }),
  }
}

export function useCurrentRoute() {
  return router.currentRoute
}

export function routeHref(target: RouteTarget) {
  return router.resolve(buildTarget(target)).href
}

export function navigateTo(target: RouteTarget, replace = false) {
  const nextTarget = buildTarget(target)
  const nextFullPath = router.resolve(nextTarget).fullPath

  if (nextFullPath === router.currentRoute.value.fullPath) {
    return Promise.resolve()
  }

  return replace ? router.replace(nextTarget) : router.push(nextTarget)
}

export function updateRouteQuery(query: Record<string, string | number | null | undefined>, replace = true) {
  return navigateTo({ query }, replace)
}

export const activeRoutePath = computed(() => router.currentRoute.value.path)
