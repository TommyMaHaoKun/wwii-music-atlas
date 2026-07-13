import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const rootDir = fileURLToPath(new URL('../', import.meta.url))
const packageJsonPath = join(rootDir, 'package.json')

function normalizeBasePath(basePath = '/') {
  if (!basePath || basePath === '/') {
    return '/'
  }

  const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

function packageRepoName() {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const packageName = String(packageJson.name ?? '').split('/').pop()
  return packageName || 'heatmap'
}

function defaultPagesBasePath() {
  const repository = process.env.GITHUB_REPOSITORY

  if (repository) {
    const repoName = repository.split('/').pop()
    return repoName?.endsWith('.github.io') ? '/' : normalizeBasePath(repoName)
  }

  return normalizeBasePath(packageRepoName())
}

const basePath = normalizeBasePath(process.env.BASE_PATH || defaultPagesBasePath())
const isWindows = process.platform === 'win32'
const npmCommand = isWindows ? 'npm run build' : 'npm'
const npmArgs = isWindows ? [] : ['run', 'build']

console.log(`Building GitHub Pages output with BASE_PATH=${basePath}`)

const buildResult = spawnSync(npmCommand, npmArgs, {
  cwd: rootDir,
  env: {
    ...process.env,
    BASE_PATH: basePath,
  },
  shell: isWindows,
  stdio: 'inherit',
})

if (buildResult.status !== 0) {
  if (buildResult.error) {
    console.error(buildResult.error)
  }
  process.exit(buildResult.status ?? 1)
}

const postbuildPath = join(dirname(fileURLToPath(import.meta.url)), 'pages-postbuild.mjs')
await import(pathToFileURL(postbuildPath).href)
