const preloadedSources = new Set()

const canPreload = () => typeof window !== 'undefined' && typeof Image !== 'undefined'

export const preloadImage = (src) => {
  if (!src || preloadedSources.has(src) || !canPreload()) return

  preloadedSources.add(src)
  const image = new Image()
  image.decoding = 'async'
  image.loading = 'eager'
  image.src = src
  image.decode?.().catch(() => {})
}

export const preloadImages = (sources) => {
  sources.filter(Boolean).forEach(preloadImage)
}

export const preloadImagesOnIdle = (sources, batchSize = 3) => {
  if (!canPreload()) return

  const queue = [...new Set(sources.filter(Boolean))]
  const runBatch = () => {
    queue.splice(0, batchSize).forEach(preloadImage)
    if (!queue.length) return

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(runBatch, { timeout: 1200 })
      return
    }

    window.setTimeout(runBatch, 250)
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(runBatch, { timeout: 800 })
    return
  }

  window.setTimeout(runBatch, 250)
}

export const firstVisibleProductMedia = (product) => [
  product.images?.[0],
  product.videoPosters?.[0],
].filter(Boolean)
