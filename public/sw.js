// Service Worker for Weather App PWA
const CACHE_NAME = 'weather-app-v1'
const STATIC_CACHE = 'weather-static-v1'

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
]

// API URLs to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.bmkg\.go\.id/,
  /^https:\/\/.*\.vercel\.app\/api/
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static files')
      return cache.addAll(STATIC_FILES)
    })
  )
  
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Claim all clients immediately
  self.clients.claim()
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Handle API requests with network-first strategy
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      networkFirstStrategy(request)
    )
    return
  }
  
  // Handle static files with cache-first strategy
  if (request.method === 'GET') {
    event.respondWith(
      cacheFirstStrategy(request)
    )
  }
})

// Network-first strategy for API calls
async function networkFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME)
  
  try {
    // Try network first
    const response = await fetch(request)
    
    if (response.ok) {
      // Cache successful responses
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('Network failed, serving from cache:', request.url)
    
    // Fallback to cache
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline fallback
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Data tidak tersedia saat offline. Mohon periksa koneksi internet Anda.'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Cache-first strategy for static files
async function cacheFirstStrategy(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/')
    }
    
    throw error
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered')
    // Handle any offline actions when connection is restored
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body || 'Peringatan cuaca penting!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Buka Aplikasi'
        },
        {
          action: 'dismiss',
          title: 'Tutup'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Prakiraan Cuaca', options)
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})