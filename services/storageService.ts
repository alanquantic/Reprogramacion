/**
 * Storage Service
 * Handles IndexedDB storage for audio data and music caching
 * Replaces localStorage for large audio files to avoid storage limits
 */

import { GeneratedImage, ReprogramArea } from '../types';

const DB_NAME = 'ReprogramacionDB';
const DB_VERSION = 1;

// Store names
const STORES = {
    HISTORY: 'history',
    MUSIC_CACHE: 'musicCache',
    SETTINGS: 'settings',
} as const;

let dbInstance: IDBDatabase | null = null;

/**
 * Opens or creates the IndexedDB database
 */
async function openDatabase(): Promise<IDBDatabase> {
    if (dbInstance) {
        return dbInstance;
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('[Storage] Failed to open database:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            dbInstance = request.result;
            console.log('[Storage] Database opened successfully');
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            console.log('[Storage] Upgrading database schema...');

            // History store - stores GeneratedImage objects
            if (!db.objectStoreNames.contains(STORES.HISTORY)) {
                const historyStore = db.createObjectStore(STORES.HISTORY, { keyPath: 'id' });
                historyStore.createIndex('timestamp', 'timestamp', { unique: false });
                historyStore.createIndex('area', 'area', { unique: false });
            }

            // Music cache store - caches generated music by area
            if (!db.objectStoreNames.contains(STORES.MUSIC_CACHE)) {
                db.createObjectStore(STORES.MUSIC_CACHE, { keyPath: 'area' });
            }

            // Settings store - for user preferences
            if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
            }
        };
    });
}

// ============ HISTORY OPERATIONS ============

/**
 * Saves a generated image to history
 */
export async function saveToHistory(image: GeneratedImage): Promise<void> {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.HISTORY, 'readwrite');
        const store = transaction.objectStore(STORES.HISTORY);
        const request = store.put(image);

        request.onsuccess = () => {
            console.log('[Storage] Saved to history:', image.id);
            resolve();
        };

        request.onerror = () => {
            console.error('[Storage] Failed to save to history:', request.error);
            reject(request.error);
        };
    });
}

/**
 * Gets all history items, sorted by timestamp (newest first)
 */
export async function getHistory(): Promise<GeneratedImage[]> {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.HISTORY, 'readonly');
        const store = transaction.objectStore(STORES.HISTORY);
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev'); // Descending order

        const items: GeneratedImage[] = [];

        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
                items.push(cursor.value);
                cursor.continue();
            } else {
                console.log('[Storage] Retrieved', items.length, 'history items');
                resolve(items);
            }
        };

        request.onerror = () => {
            console.error('[Storage] Failed to get history:', request.error);
            reject(request.error);
        };
    });
}

/**
 * Deletes a history item by ID
 */
export async function deleteFromHistory(id: string): Promise<void> {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.HISTORY, 'readwrite');
        const store = transaction.objectStore(STORES.HISTORY);
        const request = store.delete(id);

        request.onsuccess = () => {
            console.log('[Storage] Deleted from history:', id);
            resolve();
        };

        request.onerror = () => {
            console.error('[Storage] Failed to delete from history:', request.error);
            reject(request.error);
        };
    });
}

/**
 * Updates a history item (e.g., after image edit)
 */
export async function updateHistoryItem(image: GeneratedImage): Promise<void> {
    return saveToHistory(image); // put() updates if exists
}

// ============ MUSIC CACHE OPERATIONS ============

interface MusicCacheEntry {
    area: ReprogramArea;
    audioData: string;
    createdAt: number;
}

/**
 * Gets cached music for an area, if available
 */
export async function getCachedMusic(area: ReprogramArea): Promise<string | null> {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.MUSIC_CACHE, 'readonly');
        const store = transaction.objectStore(STORES.MUSIC_CACHE);
        const request = store.get(area);

        request.onsuccess = () => {
            const entry = request.result as MusicCacheEntry | undefined;
            if (entry) {
                console.log('[Storage] Cache hit for music:', area);
                resolve(entry.audioData);
            } else {
                console.log('[Storage] Cache miss for music:', area);
                resolve(null);
            }
        };

        request.onerror = () => {
            console.error('[Storage] Failed to get cached music:', request.error);
            reject(request.error);
        };
    });
}

/**
 * Caches music for an area
 */
export async function cacheMusic(area: ReprogramArea, audioData: string): Promise<void> {
    const db = await openDatabase();
    
    const entry: MusicCacheEntry = {
        area,
        audioData,
        createdAt: Date.now(),
    };
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.MUSIC_CACHE, 'readwrite');
        const store = transaction.objectStore(STORES.MUSIC_CACHE);
        const request = store.put(entry);

        request.onsuccess = () => {
            console.log('[Storage] Cached music for area:', area);
            resolve();
        };

        request.onerror = () => {
            console.error('[Storage] Failed to cache music:', request.error);
            reject(request.error);
        };
    });
}

/**
 * Clears all cached music (useful for forcing regeneration)
 */
export async function clearMusicCache(): Promise<void> {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.MUSIC_CACHE, 'readwrite');
        const store = transaction.objectStore(STORES.MUSIC_CACHE);
        const request = store.clear();

        request.onsuccess = () => {
            console.log('[Storage] Music cache cleared');
            resolve();
        };

        request.onerror = () => {
            console.error('[Storage] Failed to clear music cache:', request.error);
            reject(request.error);
        };
    });
}

// ============ SETTINGS OPERATIONS ============

interface SettingEntry {
    key: string;
    value: unknown;
}

/**
 * Saves a setting
 */
export async function saveSetting(key: string, value: unknown): Promise<void> {
    const db = await openDatabase();
    
    const entry: SettingEntry = { key, value };
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
        const store = transaction.objectStore(STORES.SETTINGS);
        const request = store.put(entry);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Gets a setting
 */
export async function getSetting<T>(key: string): Promise<T | null> {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.SETTINGS, 'readonly');
        const store = transaction.objectStore(STORES.SETTINGS);
        const request = store.get(key);

        request.onsuccess = () => {
            const entry = request.result as SettingEntry | undefined;
            resolve(entry ? (entry.value as T) : null);
        };

        request.onerror = () => reject(request.error);
    });
}

// ============ MIGRATION FROM LOCALSTORAGE ============

/**
 * Migrates existing localStorage data to IndexedDB (one-time operation)
 */
export async function migrateFromLocalStorage(): Promise<void> {
    const MIGRATION_KEY = 'indexeddb_migration_complete';
    
    // Check if already migrated
    const migrated = await getSetting<boolean>(MIGRATION_KEY);
    if (migrated) {
        console.log('[Storage] Migration already complete');
        return;
    }

    console.log('[Storage] Starting migration from localStorage...');

    try {
        // Migrate history
        const historyJson = localStorage.getItem('reprogramacion_history_v2');
        if (historyJson) {
            const history: GeneratedImage[] = JSON.parse(historyJson);
            for (const item of history) {
                // Add default values for new fields if missing
                const migratedItem: GeneratedImage = {
                    ...item,
                    area: item.area || ReprogramArea.Spiritual,
                    gender: item.gender || 'neutral',
                };
                await saveToHistory(migratedItem);
            }
            console.log('[Storage] Migrated', history.length, 'history items');
        }

        // Migrate last selections
        const selectionsJson = localStorage.getItem('reprogramacion_last_selections_v2');
        if (selectionsJson) {
            const selections = JSON.parse(selectionsJson);
            await saveSetting('lastSelections', selections);
        }

        // Mark migration complete
        await saveSetting(MIGRATION_KEY, true);
        
        // Clear old localStorage data (optional - keep for backup)
        // localStorage.removeItem('reprogramacion_history_v2');
        // localStorage.removeItem('reprogramacion_last_selections_v2');
        
        console.log('[Storage] Migration complete');
    } catch (error) {
        console.error('[Storage] Migration failed:', error);
        // Don't throw - app should still work with localStorage
    }
}

/**
 * Initializes the storage service
 */
export async function initStorage(): Promise<void> {
    await openDatabase();
    await migrateFromLocalStorage();
}

