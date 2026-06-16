const CACHE_NAME = 'edu-learn-v1'

const PRECACHE_URLS = [
  '/',
  '/courses',
  '/pricing',
  '/about',
  '/faq',
  '/contact',
  '/offline',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return

  if (/\.(js|css|png|jpg|svg|ico|woff2?|ttf)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        return res
      }))
    )
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        return response
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached
          if (request.mode === 'navigate') {
            return caches.match('/offline')
          }
          return new Response('Offline', { status: 503 })
        })
      })
  )
})
