import {manifest, version} from '@parcel/service-worker';

const cacheName = version;

console.warn(manifest);
async function install() {
  const cache = await caches.open(cacheName);
  await cache.addAll(manifest);
  await cache.addAll([
    '/',
  ])
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

const doFetch = (e) => {
  e.respondWith((async () => {
    const url = e.request.url
    try {
      console.log(`[Service Worker]: request for ${url}`);
      const u = new URL(url);
      const isLocal = u.hostname.startsWith('localhost');
      const isSelfDomain = u.hostname === self.location.hostname;
      const canCache = !isLocal && isSelfDomain;

      console.log('Trying to fetch', url);
      const result = await fetchWorkerRemote(e);
      console.log('Fetched', result);

      if (canCache) {
        console.log('Add to cache', url);
        const cache = caches.open(cacheName);
        cache.add(result);
      }

      return result;
    } catch (error) {
      const cached = await getCachedResponse(e);
      console.log(`Fetch for url ${url} failed, cached version`, cached);
      if (cached) {
        return cached;
      }

      throw error;
    }
  })());
}

addEventListener('fetch', doFetch)
