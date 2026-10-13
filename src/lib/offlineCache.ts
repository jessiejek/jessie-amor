import { useEffect, useState } from "react";

export type CachedDataset<T> = {
  data: T;
  syncedSignature: string;
  dirty: boolean;
  syncedIds?: string[];
};

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const CACHE_UPDATE_EVENT = "offline-cache-update";

export const makeOfflineCacheKey = (tripKey: string, dataset: string) => `offline-cache:${tripKey}:${dataset}`;

export const readCachedDataset = <T,>(key: string): CachedDataset<T> | null => {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CachedDataset<T>> | null;
    if (!parsed || typeof parsed !== "object" || !("data" in parsed)) return null;

    return {
      data: parsed.data as T,
      syncedSignature: typeof parsed.syncedSignature === "string" ? parsed.syncedSignature : "",
      dirty: Boolean(parsed.dirty),
      syncedIds: Array.isArray(parsed.syncedIds) ? parsed.syncedIds.map((id) => String(id)) : undefined,
    };
  } catch {
    return null;
  }
};

export const writeCachedDataset = <T,>(key: string, snapshot: CachedDataset<T>): boolean => {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(snapshot));
    window.dispatchEvent(new CustomEvent(CACHE_UPDATE_EVENT, { detail: { key } }));
    return true;
  } catch (error) {
    console.warn(`Failed to write offline cache for ${key}:`, error);
    return false;
  }
};

/** Side-store for large receipt data URLs so the expenses list cache stays small. */
export const makeReceiptBlobCacheKey = (tripKey: string, expenseId: string) =>
  makeOfflineCacheKey(tripKey, `receipt-blob:${expenseId}`);

export const writeReceiptBlob = (tripKey: string, expenseId: string, dataUrl: string): boolean => {
  if (!canUseStorage() || !dataUrl.startsWith("data:")) return false;
  try {
    window.localStorage.setItem(makeReceiptBlobCacheKey(tripKey, expenseId), dataUrl);
    return true;
  } catch (error) {
    console.warn(`Failed to persist receipt blob for ${expenseId}:`, error);
    return false;
  }
};

export const readReceiptBlob = (tripKey: string, expenseId: string): string | null => {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(makeReceiptBlobCacheKey(tripKey, expenseId));
  } catch {
    return null;
  }
};

export const deleteReceiptBlob = (tripKey: string, expenseId: string) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(makeReceiptBlobCacheKey(tripKey, expenseId));
  } catch {
    // ignore
  }
};

export const useCachedDataset = <T,>(key: string) => {
  const [snapshot, setSnapshot] = useState<CachedDataset<T> | null>(() => readCachedDataset<T>(key));

  useEffect(() => {
    if (!canUseStorage()) return;

    const refresh = () => {
      setSnapshot(readCachedDataset<T>(key));
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== key && event.key !== null) return;
      refresh();
    };

    const handleCacheUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ key?: string }>;
      if (customEvent.detail?.key !== key) return;
      refresh();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(CACHE_UPDATE_EVENT, handleCacheUpdate as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CACHE_UPDATE_EVENT, handleCacheUpdate as EventListener);
    };
  }, [key]);

  return snapshot;
};

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return isOnline;
};
