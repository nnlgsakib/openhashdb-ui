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
    <h2 class="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
    <p class="text-gray-600">Configure your Open Hash DB connection and preferences</p>
  </div>
  
  <!-- Connection Settings -->
  <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Connection Settings</h3>
    
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
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            disabled={isConnecting}
          />
          <button
            on:click={resetToDefault}
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isConnecting}
          >
            Reset
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          The base URL of your Open Hash DB API server
        </p>
      </div>
      
      {#if $connectionError}
        <div class="bg-red-50 border border-red-200 rounded-lg p-3">
          <div class="flex items-center space-x-2">
            <span class="text-red-500">❌</span>
            <p class="text-sm text-red-700">{$connectionError}</p>
          </div>
        </div>
      {/if}
      
      <div class="flex gap-2">
        <button
          on:click={testConnection}
          disabled={isConnecting || !inputUrl.trim()}
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Health Check
          </button>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Connection Status -->
  <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Connection Status</h3>
    
    <div class="flex items-center space-x-4">
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 rounded-full {$isConnected ? 'bg-green-500' : 'bg-red-500'}"></div>
        <span class="font-medium {$isConnected ? 'text-green-700' : 'text-red-700'}">
          {$isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {#if $isConnected}
        <div class="text-sm text-gray-600">
          <span>Connected to: </span>
          <code class="bg-gray-100 px-2 py-1 rounded text-xs">{$apiBaseUrl}</code>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Application Information -->
  <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">About</h3>
    
    <div class="space-y-4">
      <div>
        <h4 class="font-medium text-gray-900">Open Hash DB UI</h4>
        <p class="text-sm text-gray-600">A versatile frontend for Open Hash DB - Distributed Content Addressable Database</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium text-gray-700">Features:</span>
          <ul class="text-gray-600 mt-1 space-y-1">
            <li>• File and folder uploads</li>
            <li>• Content viewing and downloading</li>
            <li>• Pin management</li>
            <li>• Network statistics</li>
          </ul>
        </div>
        <div>
          <span class="font-medium text-gray-700">Technology:</span>
          <ul class="text-gray-600 mt-1 space-y-1">
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
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
    <h4 class="font-medium text-blue-900 mb-3">💡 Tips</h4>
    <ul class="text-sm text-blue-800 space-y-2">
      <li>• Make sure your Open Hash DB server is running before connecting</li>
      <li>• The default port is 8080, but you can use any port your server is configured for</li>
      <li>• Use HTTPS URLs for secure connections when available</li>
      <li>• Pin important content to ensure it remains available locally</li>
      <li>• Large files are automatically chunked for efficient storage</li>
    </ul>
  </div>
</div>

