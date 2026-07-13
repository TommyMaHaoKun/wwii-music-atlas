import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

function normalizeBasePath(basePath = '/') {
  if (!basePath || basePath === '/') {
    return '/'
  }

  const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: normalizeBasePath(process.env.BASE_PATH),
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('globe.gl') || id.includes('three') || id.includes('world-atlas') || id.includes('topojson-client')) {
            return 'globe-vendor'
          }

          if (id.includes('/src/data/') || id.includes('/src/lib/') || id.includes('\\src\\data\\') || id.includes('\\src\\lib\\')) {
            return 'atlas-data'
          }

          if (id.includes('node_modules/vue')) {
            return 'vue-vendor'
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.spec.ts'],
    exclude: ['e2e/**'],
  },
})
