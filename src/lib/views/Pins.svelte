<script lang="ts">
  import { onMount } from 'svelte';
  import { pinnedList, isConnected, isLoading } from '../stores';
  import { getApi } from '../api';
  import ContentCard from '../components/ContentCard.svelte';
  
  let searchTerm = '';
  let sortBy = 'created_at';
  let sortOrder = 'desc';
  
  onMount(async () => {
    if ($isConnected) {
      await loadPins();
    }
    
    // Listen for refresh events
    window.addEventListener('refresh-content', loadPins);
    return () => window.removeEventListener('refresh-content', loadPins);
  });
  
  async function loadPins() {
    isLoading.set(true);
    try {
      const api = getApi();
      const pins = await api.listPins();
      pinnedList.set(pins);
    } catch (error) {
      console.error('Failed to load pins:', error);
    } finally {
      isLoading.set(false);
    }
  }
  
  $: filteredPins = $pinnedList
    .filter(content => 
      content.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.mime_type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'filename':
          aVal = a.filename.toLowerCase();
          bVal = b.filename.toLowerCase();
          break;
        case 'size':
          aVal = a.size;
          bVal = b.size;
          break;
        case 'created_at':
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  
  // Refresh pins when connection status changes
  $: if ($isConnected && !$isLoading) {
    loadPins();
  }
</script>

{#if !$isConnected}
  <div class="text-center py-12">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span class="text-3xl">🔌</span>
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">Not Connected</h3>
    <p class="text-gray-600">Please connect to your Open Hash DB instance to view pinned content.</p>
  </div>
{:else}
  <div class="space-y-6">
    <!-- Header with search and controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Pinned Content</h2>
        <p class="text-gray-600">Content that is pinned to ensure local availability</p>
      </div>
      
      <button
        on:click={loadPins}
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
      >
        <span>🔄</span>
        <span>Refresh</span>
      </button>
    </div>
    
    <!-- Search and Filter Controls -->
    <div class="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            type="text"
            placeholder="Search pinned content..."
            bind:value={searchTerm}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        
        <div class="flex gap-2">
          <select
            bind:value={sortBy}
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="created_at">Created Date</option>
            <option value="filename">Filename</option>
            <option value="size">Size</option>
          </select>
          
          <select
            bind:value={sortOrder}
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Pinning Information -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-start space-x-3">
        <span class="text-yellow-600 text-lg">📌</span>
        <div>
          <h4 class="font-medium text-yellow-900">About Pinning</h4>
          <p class="text-sm text-yellow-800 mt-1">
            Pinned content is guaranteed to remain available in your local storage. 
            This ensures important files won't be garbage collected and can be quickly accessed.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Content Grid -->
    {#if $isLoading}
      <div class="text-center py-12">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Loading pinned content...</p>
      </div>
    {:else if filteredPins.length === 0}
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">📌</span>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {searchTerm ? 'No matching pinned content found' : 'No pinned content'}
        </h3>
        <p class="text-gray-600">
          {searchTerm ? 'Try adjusting your search terms' : 'Pin some content to ensure it stays available locally'}
        </p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredPins as content (content.hash)}
          <ContentCard {content} showPinActions={false} />
        {/each}
      </div>
      
      <!-- Results summary -->
      <div class="text-center text-gray-600">
        <p>Showing {filteredPins.length} of {$pinnedList.length} pinned items</p>
      </div>
    {/if}
  </div>
{/if}

