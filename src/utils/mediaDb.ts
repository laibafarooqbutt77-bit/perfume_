// Local IndexedDB storage for larger uploaded images & videos (strictly browser-local)

const DB_NAME = 'maisondor_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

const objectUrlCache = new Map<string, string>();
const pendingReads = new Map<string, Promise<string | null>>();

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB.'));
  });
}

export function isIdbMediaRef(src?: string | null): boolean {
  return Boolean(src && src.startsWith('idb://'));
}

export function extractIdbMediaId(src: string): string {
  return src.replace(/^idb:\/\//, '');
}

export async function saveMediaBlob(id: string, blob: Blob): Promise<void> {
  const db = await openMediaDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id, blob, updatedAt: new Date().toISOString() });
    tx.oncomplete = () => {
      // Refresh cached ObjectURL if already cached
      const existingUrl = objectUrlCache.get(id);
      if (existingUrl) {
        URL.revokeObjectURL(existingUrl);
      }
      objectUrlCache.set(id, URL.createObjectURL(blob));
      resolve();
    };
    tx.onerror = () => reject(tx.error || new Error('Failed to write media to IndexedDB.'));
  });
}

export async function getMediaBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openMediaDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const row = req.result as { id: string; blob: Blob } | undefined;
        resolve(row?.blob || null);
      };
      req.onerror = () => reject(req.error || new Error('Failed to read media from IndexedDB.'));
    });
  } catch {
    return null;
  }
}

export async function resolveIdbMediaUrl(src: string): Promise<string | null> {
  if (!isIdbMediaRef(src)) return src || null;
  const id = extractIdbMediaId(src);
  const cached = objectUrlCache.get(id);
  if (cached) return cached;

  const existingPromise = pendingReads.get(id);
  if (existingPromise) return existingPromise;

  const promise = getMediaBlob(id)
    .then(blob => {
      pendingReads.delete(id);
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      objectUrlCache.set(id, url);
      return url;
    })
    .catch(() => {
      pendingReads.delete(id);
      return null;
    });

  pendingReads.set(id, promise);
  return promise;
}

export async function deleteMediaBlob(id: string): Promise<void> {
  const cached = objectUrlCache.get(id);
  if (cached) {
    URL.revokeObjectURL(cached);
    objectUrlCache.delete(id);
  }
  const db = await openMediaDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Failed to delete media from IndexedDB.'));
  });
}

export async function clearAllUploadedMediaBlobs(): Promise<void> {
  for (const url of objectUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  objectUrlCache.clear();
  try {
    const db = await openMediaDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore if DB does not exist yet
  }
}
