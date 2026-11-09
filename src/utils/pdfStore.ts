/** IndexedDB storage for PDFs uploaded through the "Adobe Reader" File ▸ Open dialog. */
export interface StoredPdf {
  id: string;
  docId: string;
  name: string;
  size: number;
  addedAt: number;
  blob: Blob;
  sessionOnly?: boolean;
}

const DB_NAME = 'xp-portfolio-documents';
const STORE = 'pdfs';
let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

export async function listPdfs(docId: string): Promise<StoredPdf[]> {
  const all = await run<StoredPdf[]>('readonly', (s) => s.getAll() as IDBRequest<StoredPdf[]>);
  return all.filter((p) => p.docId === docId).sort((a, b) => b.addedAt - a.addedAt);
}

export async function savePdf(docId: string, file: File): Promise<StoredPdf> {
  const record: StoredPdf = {
    id: `upload-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    docId,
    name: file.name,
    size: file.size,
    addedAt: Date.now(),
    blob: file,
  };
  try {
    await run('readwrite', (s) => s.put(record));
    return record;
  } catch {
    return { ...record, sessionOnly: true };
  }
}

export async function deletePdf(id: string): Promise<void> {
  try {
    await run('readwrite', (s) => s.delete(id));
  } catch {
    /* ignore */
  }
}
