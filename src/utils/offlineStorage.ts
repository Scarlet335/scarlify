import localforage from 'localforage';

// Configure IndexedDB
localforage.config({
    name: 'ScarlifyOffline',
    storeName: 'offlineContent',
    description: 'Offline content storage for Scarlify'
});

export interface OfflineContent {
    id: string;
    type: 'lesson' | 'past_question' | 'quiz';
    title: string;
    content: any;
    downloadedAt: Date;
    size: number;
}

// Save content offline
export async function saveOffline(content: OfflineContent): Promise<void> {
    await localforage.setItem(`content_${content.type}_${content.id}`, content);
}

// Get offline content
export async function getOfflineContent(type: string, id: string): Promise<OfflineContent | null> {
    return await localforage.getItem(`content_${type}_${id}`);
}

// Get all offline content by type
export async function getAllOfflineByType(type: string): Promise<OfflineContent[]> {
    const keys = await localforage.keys();
    const contentList: OfflineContent[] = [];
    
    for (const key of keys) {
        if (key.startsWith(`content_${type}_`)) {
            const item = await localforage.getItem<OfflineContent>(key);
            if (item) contentList.push(item);
        }
    }
    return contentList;
}

// Get all offline content
export async function getAllOfflineContent(): Promise<OfflineContent[]> {
    const keys = await localforage.keys();
    const contentList: OfflineContent[] = [];
    
    for (const key of keys) {
        if (key.startsWith('content_')) {
            const item = await localforage.getItem<OfflineContent>(key);
            if (item) contentList.push(item);
        }
    }
    return contentList;
}

// Remove offline content
export async function removeOffline(type: string, id: string): Promise<void> {
    await localforage.removeItem(`content_${type}_${id}`);
}

// Clear all offline content
export async function clearAllOffline(): Promise<void> {
    const keys = await localforage.keys();
    for (const key of keys) {
        if (key.startsWith('content_')) {
            await localforage.removeItem(key);
        }
    }
}

// Get total storage used
export async function getStorageUsed(): Promise<number> {
    const contents = await getAllOfflineContent();
    return contents.reduce((total, item) => total + (item.size || 0), 0);
}

// Check if online
export function isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// Listen to online/offline events
export function addOfflineListeners(onOnline: () => void, onOffline: () => void): void {
    if (typeof window !== 'undefined') {
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
    }
}

export function removeOfflineListeners(onOnline: () => void, onOffline: () => void): void {
    if (typeof window !== 'undefined') {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
    }
}