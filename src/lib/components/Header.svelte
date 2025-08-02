<script lang="ts">
  import { isConnected, connectionError, apiBaseUrl } from '../stores';
  
  export let title: string;
</script>

<header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
    
    <div class="flex items-center space-x-4">
      <!-- Connection Status -->
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded-full {$isConnected ? 'bg-green-500' : 'bg-red-500'}"></div>
        <span class="text-sm text-gray-600">
          {$isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {#if $isConnected}
          <span class="text-xs text-gray-400">({$apiBaseUrl})</span>
        {/if}
      </div>
      
      <!-- Error indicator -->
      {#if $connectionError}
        <div class="flex items-center space-x-2 text-red-600">
          <span class="text-sm">⚠️</span>
          <span class="text-sm">Connection Error</span>
        </div>
      {/if}
    </div>
  </div>
</header>

