import {manifest, version} from '@parcel/service-worker';

const cacheName = version;
async function install() {
  console.warn(manifest);
  const cache = await caches.open(cacheName);
  await cache.addAll(manifest);
}

addEventListener('install', e => e.waitUntil(install()));

async function activate() {
  const keys = await caches.keys();
  await Promise.all(
    keys.map(key => key !== cacheName && caches.delete(key))
  );
}

addEventListener('activate', e => e.waitUntil(activate()));

async function fetchWorker(e) {
  e.respondWith((async () => {
    console.warn(e.request);
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) { return r; }
    await fetch(e.request);
  })())
}

addEventListener('fetch', fetchWorker)
