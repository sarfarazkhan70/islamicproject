// Islamic Prayer Service Worker (Phase 5 — Web Push & PWA Offline Support)

const CACHE_NAME = 'islamic-prayer-v5';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/favicon.svg',
        '/manifest.json',
        '/audio/madina_azaan.mp3',
        '/audio/namaz_reminder.mp3',
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ==========================================
// WEB PUSH EVENT HANDLER
// ==========================================
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Islamic Prayer',
    body: 'Time for prayer or daily remembrance.',
    url: '/',
    type: 'GENERAL',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      notificationData = { ...notificationData, ...parsed };
    } catch {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: notificationData.tag || notificationData.type,
    renotify: true,
    data: {
      url: notificationData.url || '/',
      type: notificationData.type,
    },
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// ==========================================
// NOTIFICATION CLICK ROUTING HANDLER
// ==========================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there is already a window open
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(targetUrl)) {
            return client.focus();
          }
          return client.navigate(targetUrl).then((c) => c.focus());
        }
      }
      // If no window is open, open a new browser window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
