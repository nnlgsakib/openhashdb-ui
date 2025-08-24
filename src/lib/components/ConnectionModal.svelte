<script lang="ts">
  import { apiBaseUrl, isConnected, connectionError, api, addNotification } from '../stores';
  
  let inputUrl = $apiBaseUrl;
  let isConnecting = false;
  
  async function testConnection() {
    if (!inputUrl.trim()) {
      addNotification('error', 'Please enter a valid API URL');
      return;
    }
    
    isConnecting = true;
    connectionError.set(null);
    
    try {
      // Temporarily update the base URL to test
      apiBaseUrl.set(inputUrl.trim());
      
      // Get the latest api instance from the derived store
      const currentApi = await new Promise(resolve => api.subscribe(resolve)());
      const connected = await currentApi.testConnection();
      
      if (connected) {
        isConnected.set(true);
        addNotification('success', 'Successfully connected to Open Hash DB');
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      connectionError.set(errorMessage);
      isConnected.set(false);
      addNotification('error', `Connection failed: ${errorMessage}`);
    } finally {
      isConnecting = false;
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      testConnection();
    }
  }
</script>

<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
  <div class="card shadow-xl p-6 w-full max-w-md mx-4">
    <div class="text-center mb-6">
      <div class="w-16 h-16 bg-brand-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-2xl">🔗</span>
      </div>
      <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">Connect to Open Hash DB</h2>
      <p class="text-zinc-600 dark:text-zinc-400 mt-2">Enter the API base URL to connect to your Open Hash DB instance</p>
    </div>
    
    <div class="space-y-4">
      <div>
        <label for="api-url" class="block text-sm font-medium text-gray-700 mb-2">
          API Base URL
        </label>
        <input
          id="api-url"
          type="url"
          bind:value={inputUrl}
          on:keydown={handleKeydown}
          placeholder="e.g. http://localhost:8080"
          class="input"
          disabled={isConnecting}
        />
      </div>
      
      {#if $connectionError}
        <div class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
          <div class="flex items-center space-x-2">
            <span class="text-red-500">❌</span>
            <p class="text-sm text-red-700 dark:text-red-300">{$connectionError}</p>
          </div>
        </div>
      {/if}
      
      <button
        on:click={testConnection}
        disabled={isConnecting || !inputUrl.trim()}
        class="w-full btn-primary disabled:bg-zinc-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {#if isConnecting}
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        {:else}
          <span>Connect</span>
        {/if}
      </button>
    </div>
    
    <div class="mt-6 text-center">
      <p class="text-xs text-zinc-500 dark:text-zinc-400">
        Make sure your Open Hash DB server is running and accessible
      </p>
    </div>
  </div>
</div>
