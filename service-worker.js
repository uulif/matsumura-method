const CACHE_NAME = 'matsumura-method-v250';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/noteview.css',
  '/js/app.js',
  '/js/db.js',
  '/js/pages.js',
  '/js/icons.js',
  '/js/noteview.js',
  '/manifest.json'
];

// インストール時にファイルをキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ネットワーク優先戦略（オンライン時は常に最新、オフライン時はキャッシュ）
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 成功したらキャッシュを更新
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // ネットワーク失敗時はキャッシュから返す（バージョン番号を無視して照合）
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});
