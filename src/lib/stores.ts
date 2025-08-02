import { writable, derived } from 'svelte/store';
import type { ContentInfo, Stats, NetworkStats } from './api';

// API configuration store
export const apiBaseUrl = writable<string>('http://localhost:8080');
export const isConnected = writable<boolean>(false);
export const connectionError = writable<string | null>(null);

// Content stores
export const contentList = writable<ContentInfo[]>([]);
export const pinnedList = writable<ContentInfo[]>([]);
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

