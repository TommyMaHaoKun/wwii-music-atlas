import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const distDir = fileURLToPath(new URL('../dist/', import.meta.url))
const indexPath = join(distDir, 'index.html')
const fallbackPath = join(distDir, '404.html')
const noJekyllPath = join(distDir, '.nojekyll')

if (!existsSync(indexPath)) {
  throw new Error('Cannot prepare GitHub Pages output because dist/index.html does not exist.')
}

copyFileSync(indexPath, fallbackPath)
writeFileSync(noJekyllPath, '')
