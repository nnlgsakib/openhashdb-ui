<script lang="ts">
  import { notifications, removeNotification } from '../stores';
  import { fly } from 'svelte/transition';
  
  function getNotificationIcon(type: string) {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  }
  
  function getNotificationClasses(type: string) {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }
</script>

<div class="fixed top-4 right-4 z-50 space-y-2">
  {#each $notifications as notification (notification.id)}
    <div
      class="max-w-sm p-4 rounded-lg border shadow-lg {getNotificationClasses(notification.type)}"
      transition:fly={{ x: 300, duration: 300 }}
    >
      <div class="flex items-start space-x-3">
        <span class="text-lg">{getNotificationIcon(notification.type)}</span>
        <div class="flex-1">
          <p class="text-sm font-medium">{notification.message}</p>
        </div>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          on:click={() => removeNotification(notification.id)}
        >
          ✕
        </button>
      </div>
    </div>
  {/each}
</div>

