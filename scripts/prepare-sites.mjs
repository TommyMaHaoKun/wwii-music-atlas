import { copyFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const serverDir = resolve(projectRoot, 'dist', 'server')

await mkdir(serverDir, { recursive: true })
await copyFile(resolve(projectRoot, 'sites-worker.js'), resolve(serverDir, 'index.js'))

console.log('Prepared the Cloudflare Worker entry point for Sites hosting.')
