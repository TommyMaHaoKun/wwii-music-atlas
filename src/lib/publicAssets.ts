const absoluteUrlPattern = /^(?:[a-z]+:)?\/\//i

export function publicAssetPath(path: string) {
  if (!path || absoluteUrlPattern.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }

  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = path.replace(/^\/+/, '')

  return `${normalizedBase}${normalizedPath}`
}
