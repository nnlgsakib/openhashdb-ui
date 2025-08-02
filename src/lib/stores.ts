import { writable, derived } from 'svelte/store';
import type { ContentInfo, Stats, NetworkStats, ApiService } from './api';
import { initializeApi } from './api';

// Helper for local storage
function createPersistentStore<T>(key: string, startValue: T) {
  const { subscribe, set, update } = writable<T>(startValue);

  return {
    subscribe,
    set,
    update,
    useLocalStorage: () => {
      if (typeof window !== 'undefined') {
        const json = localStorage.getItem(key);
        if (json) {
          set(JSON.parse(json));
        }

        subscribe(current => {
          localStorage.setItem(key, JSON.stringify(current));
        });
      }
    }
  };
}

// API configuration store
export const apiBaseUrl = createPersistentStore<string>('apiBaseUrl', 'http://localhost:8080');
export const isConnected = writable<boolean>(false);
export const connectionError = writable<string | null>(null);

// Centralized API service
export const api = derived<typeof apiBaseUrl, ApiService>(apiBaseUrl, $url => initializeApi($url));

// Content stores
export const contentList = writable<ContentInfo[]>([]);
export const pinnedList = createPersistentStore<ContentInfo[]>('pinnedList', []);
export const selectedContent = writable<ContentInfo | null>(null);

// Stats stores
export const stats = writable<Stats | null>(null);
export const networkStats = writable<NetworkStats | null>(null);

// UI state stores
export const isLoading = writable<boolean>(false);
export const currentView = writable<'dashboard' | 'upload' | 'content' | 'pins' | 'settings'>('dashboard');
export const notifications = writable<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

// Derived stores
export const totalContent = derived(contentList, ($contentList) => $contentList.length);
export const totalPinned = derived(pinnedList, ($pinnedList) => $pinnedList.length);

// Notification helpers
let notificationId = 0;

export function addNotification(type: 'success' | 'error' | 'info', message: string) {
  const id = `notification-${++notificationId}`;
  notifications.update(n => [...n, { id, type, message }]);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notifications.update(n => n.filter(notification => notification.id !== id));
  }, 5000);
}

export function removeNotification(id: string) {
  notifications.update(n => n.filter(notification => notification.id !== id));
}

