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
  
    function resetToDefault() {
    if (typeof window !== 'undefined') {
      inputUrl = window.location.origin;
    } else {
      inputUrl = 'http://localhost:8080';
    }
  }
  
  async function checkHealth() {
    try {
      const health = await $api.healthCheck();
      addNotification('success', `Health check passed: ${health.status || 'OK'}`);
    } catch (error) {
      addNotification('error', `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <div>
    <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Settings</h2>
    <p class="text-zinc-600 dark:text-zinc-400">Configure your Open Hash DB connection and preferences</p>
  </div>
  
  <!-- Connection Settings -->
  <div class="card p-6">
    <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Connection Settings</h3>
    
    <div class="space-y-4">
      <div>
        <label for="api-url" class="block text-sm font-medium text-gray-700 mb-2">
          API Base URL
        </label>
        <div class="flex gap-2">
          <input
            id="api-url"
            type="url"
            bind:value={inputUrl}
            placeholder="e.g. http://localhost:8080"
            class="input flex-1"
            disabled={isConnecting}
          />
          <button
            on:click={resetToDefault}
            class="btn-ghost border border-zinc-300 dark:border-white/10"
            disabled={isConnecting}
          >
            Reset
          </button>
        </div>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          The base URL of your Open Hash DB API server
        </p>
      </div>
      
      {#if $connectionError}
        <div class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
          <div class="flex items-center space-x-2">
            <span class="text-red-500">❌</span>
            <p class="text-sm text-red-700 dark:text-red-300">{$connectionError}</p>
          </div>
        </div>
      {/if}
      
      <div class="flex gap-2">
        <button
          on:click={testConnection}
          disabled={isConnecting || !inputUrl.trim()}
          class="btn-primary disabled:bg-zinc-300 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {#if isConnecting}
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Testing...</span>
          {:else}
            <span>Test Connection</span>
          {/if}
        </button>
        
        {#if $isConnected}
          <button
            on:click={checkHealth}
            class="btn bg-green-600 hover:bg-green-700 text-white"
          >
            Health Check
          </button>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Connection Status -->
  <div class="card p-6">
    <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Connection Status</h3>
    
    <div class="flex items-center space-x-4">
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 rounded-full {$isConnected ? 'bg-green-500' : 'bg-red-500'}"></div>
        <span class="font-medium {$isConnected ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}">
          {$isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {#if $isConnected}
        <div class="text-sm text-gray-600">
          <span class="text-zinc-600 dark:text-zinc-400">Connected to: </span>
          <code class="bg-zinc-100 dark:bg-white/10 px-2 py-1 rounded text-xs text-zinc-800 dark:text-zinc-200">{$apiBaseUrl}</code>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Application Information -->
  <div class="card p-6">
    <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">About</h3>
    
    <div class="space-y-4">
      <div>
        <h4 class="font-medium text-zinc-900 dark:text-zinc-100">Open Hash DB UI</h4>
        <p class="text-sm text-zinc-600 dark:text-zinc-400">A versatile frontend for Open Hash DB - Distributed Content Addressable Database</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium text-zinc-700 dark:text-zinc-300">Features:</span>
          <ul class="text-zinc-600 dark:text-zinc-400 mt-1 space-y-1">
            <li>• File and folder uploads</li>
            <li>• Content viewing and downloading</li>
            <li>• Pin management</li>
            <li>• Network statistics</li>
          </ul>
        </div>
        <div>
          <span class="font-medium text-zinc-700 dark:text-zinc-300">Technology:</span>
          <ul class="text-zinc-600 dark:text-zinc-400 mt-1 space-y-1">
            <li>• SvelteKit frontend</li>
            <li>• TailwindCSS styling</li>
            <li>• REST API integration</li>
            <li>• Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Tips and Help -->
  <div class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900 rounded-lg p-6">
    <h4 class="font-medium text-blue-900 dark:text-blue-200 mb-3">💡 Tips</h4>
    <ul class="text-sm text-blue-800 dark:text-blue-300/80 space-y-2">
      <li>• Make sure your Open Hash DB server is running before connecting</li>
      <li>• The default port is 8080, but you can use any port your server is configured for</li>
      <li>• Use HTTPS URLs for secure connections when available</li>
      <li>• Pin important content to ensure it remains available locally</li>
      <li>• Large files are automatically chunked for efficient storage</li>
    </ul>
  </div>
</div>
