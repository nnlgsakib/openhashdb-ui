<script lang="ts">
  import { onMount } from 'svelte';
  import { pinnedList, isConnected, isLoading, api } from '../stores';
  import ContentCard from '../components/ContentCard.svelte';
  import type { ContentInfo } from '../api';
  
  let searchTerm = '';
  let sortBy = 'created_at';
  let sortOrder = 'desc';
  
  let interval: ReturnType<typeof setInterval> | null = null;

  onMount(() => {
    // Initial load
    loadPins();
    // Listen for global refresh events, e.g., after an unpin action
    window.addEventListener('refresh-content', loadPins);

    // Auto-refresh every 15s while on this page
    interval = setInterval(loadPins, 15000);

    return () => {
      window.removeEventListener('refresh-content', loadPins);
      if (interval) clearInterval(interval);
    };
  });
  
  // This function is now primarily for manual refresh via the button
  async function loadPins() {
    if ($isLoading) return;
    isLoading.set(true);
    try {
      const pinHashes = await $api.listPins();
      const pinInfoResults = await Promise.all(
        pinHashes.map(hash => $api.findContent(hash))
      );
      
      const pinDetails = pinInfoResults.filter(
        (info): info is ContentInfo => info && 'hash' in info
      );
      
      pinnedList.set(pinDetails);
    } catch (error) {
      console.error('Failed to load pins:', error);
      pinnedList.set([]);
    } finally {
      isLoading.set(false);
    }
  }
  
  $: filteredPins = ($pinnedList || [])
    .filter(content => {
      if (!content) return false;
      const term = searchTerm.toLowerCase();
      return (
        (content.filename && content.filename.toLowerCase().includes(term)) ||
        (content.hash && content.hash.toLowerCase().includes(term)) ||
        (content.mime_type && content.mime_type.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'filename':
          aVal = a.filename?.toLowerCase() || '';
          bVal = b.filename?.toLowerCase() || '';
          break;
        case 'size':
          aVal = a.size || 0;
          bVal = b.size || 0;
          break;
        case 'created_at':
          aVal = new Date(a.created_at || 0).getTime();
          bVal = new Date(b.created_at || 0).getTime();
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
</script>

{#if !$isConnected}
  <div class="text-center py-12">
    <div class="w-16 h-16 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
      <span class="text-3xl">🔌</span>
    </div>
    <h3 class="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Not Connected</h3>
    <p class="text-zinc-600 dark:text-zinc-400">Please connect to your Open Hash DB instance to view pinned content.</p>
  </div>
{:else}
  <div class="space-y-6">
    <!-- Header with search and controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Pinned Content</h2>
        <p class="text-zinc-600 dark:text-zinc-400">Content that is pinned to ensure local availability</p>
      </div>
      
      <button on:click={loadPins} class="btn-primary">
        <span>🔄</span>
        <span>Refresh</span>
      </button>
    </div>
    
    <!-- Search and Filter Controls -->
    <div class="card p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            type="text"
            placeholder="Search pinned content..."
            bind:value={searchTerm}
            class="input"
          />
        </div>
        
        <div class="flex gap-2">
          <select
            bind:value={sortBy}
            class="input w-auto"
          >
            <option value="created_at">Created Date</option>
            <option value="filename">Filename</option>
            <option value="size">Size</option>
          </select>
          
          <select
            bind:value={sortOrder}
            class="input w-auto"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Pinning Information -->
    <div class="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200/70 dark:border-yellow-900 rounded-lg p-4">
      <div class="flex items-start space-x-3">
        <span class="text-yellow-600 text-lg">📌</span>
        <div>
          <h4 class="font-medium text-yellow-900 dark:text-yellow-200">About Pinning</h4>
          <p class="text-sm text-yellow-800 dark:text-yellow-300/80 mt-1">
            Pinned content is guaranteed to remain available in your local storage. 
            This ensures important files won't be garbage collected and can be quickly accessed.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Content Grid -->
    {#if $isLoading}
      <div class="text-center py-12">
        <div class="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-zinc-600 dark:text-zinc-400">Loading pinned content...</p>
      </div>
    {:else if filteredPins.length === 0}
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">📌</span>
        </div>
        <h3 class="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          {searchTerm ? 'No matching pinned content found' : 'No pinned content'}
        </h3>
        <p class="text-zinc-600 dark:text-zinc-400">
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
      <div class="text-center text-zinc-600 dark:text-zinc-400">
        <p>Showing {filteredPins.length} of {$pinnedList.length} pinned items</p>
      </div>
    {/if}
  </div>
{/if}
