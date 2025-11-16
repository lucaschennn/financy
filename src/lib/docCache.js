// Simple client-side cache for documents list.
// - in-memory cache for immediate reuse
// - sessionStorage persistence across page reloads in the same tab
// - in-flight promise deduplication so concurrent callers share the same request

const STORAGE_KEY = 'financy:documents_cache_v1';
let inMemory = null;
let inFlightPromise = null;

export function getCachedDocs() {
  if (inMemory) return Promise.resolve(inMemory);
  try {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        inMemory = JSON.parse(raw);
        return Promise.resolve(inMemory);
      }
    }
  } catch (err) {
    // ignore sessionStorage errors
  }
  return Promise.resolve(null);
}

export function invalidateDocsCache() {
  inMemory = null;
  inFlightPromise = null;
  try {
    if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {}
}

export function fetchAndCacheDocs() {
  if (inMemory) return Promise.resolve(inMemory);
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = fetch('/api/documents')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch documents');
      return res.json();
    })
    .then((data) => {
      const files = data?.files || [];
      inMemory = files;
      try {
        if (typeof window !== 'undefined') sessionStorage.setItem(STORAGE_KEY, JSON.stringify(files));
      } catch (err) {
        // ignore
      }
      return inMemory;
    })
    .catch((err) => {
      // clear inFlight so future calls may retry
      inFlightPromise = null;
      throw err;
    })
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
}

export async function getDocs({ force = false } = {}) {
  if (!force) {
    const cached = await getCachedDocs();
    if (cached) return cached;
  }
  return fetchAndCacheDocs();
}
