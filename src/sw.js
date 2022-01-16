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

const getCachedResponse = async (e) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(e.request);

  return cachedResponse;
}

const fetchWorkerRemote = async (e) => {
  return fetch(e.request);
}

async function fetchWorker(e) {
  e.respondWith((async () => {
    let cachedResponse;
    try {
      console.log(`[Service Worker]: request for ${e.request.url}`);
      const u = new URL(e.request.url);
      const isLocal = u.hostname.startsWith('localhost');
      console.log('[Service Worker]: is localhost?', isLocal);
      const cachedResponse = await getCachedResponse(e);
      console.log(`[Service Worker]: have cached?`, cachedResponse);

      if (!isLocal && cachedResponse) {
        return cachedResponse;
      }
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      return fetchWorkerRemote(e);
    } catch (error) {
      console.log(`[Service Worker]: No cached resource, throwing. ${e.request.url}`);

      throw error;
    }
  })())
}

addEventListener('fetch', fetchWorker)
