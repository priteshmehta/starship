/**
 * Star Ship - Service Worker
 * Enables offline play and app-like experience
 */

const CACHE_NAME = 'star-ship-v1.0.0';
const STATIC_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/game.js',
    './js/background.js',
    './js/spaceship.js',
    './js/asteroid.js',
    './js/coin.js',
    './js/collision.js',
    './js/audio.js',
    './js/touch.js',
    './assets/images/spaceship.svg',
    './assets/images/asteroid.svg',
    './assets/images/coin.svg',
    './manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('🗂️ Service Worker: Caching static assets');
                return cache.addAll(STATIC_CACHE);
            })
            .then(() => {
                console.log('✅ Service Worker: Install complete');
                self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker: Install failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response (streams can only be consumed once)
                        const responseToCache = response.clone();

                        // Add to cache for future use
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.log('🌐 Service Worker: Network request failed', error);

                        // For navigation requests, return a custom offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }

                        throw error;
                    });
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Periodic sync for background updates (if supported)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Service Worker: Background sync triggered');
    }
});