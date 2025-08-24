<script lang="ts">
  import { onMount } from 'svelte';
  import { contentList, isConnected, isLoading, api, filesViewMode } from '../stores';
  import { formatBytes, formatDate, truncateHash } from '../utils';
  import ContentCard from '../components/ContentCard.svelte';
  import type { ContentInfo } from '../api';
  
  let searchTerm = '';
  let sortBy = 'created_at';
  let sortOrder = 'desc';

  let findHashInput = '';
  let showFindModal = false;
  let foundContent: ContentInfo | null = null;
  let findErrorMessage = '';
  let contentHasBeenLoaded = false;
  
  onMount(async () => {
    if ($isConnected) {
      await loadContent();
    }
    
    // Listen for refresh events
    window.addEventListener('refresh-content', loadContent);
    return () => window.removeEventListener('refresh-content', loadContent);
  });
  
  async function loadContent() {
    isLoading.set(true);
    try {
      const content = await $api.listContent();
      contentList.set(content || []);
      contentHasBeenLoaded = true;
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      isLoading.set(false);
    }
  }

  async function handleFindHash() {
    findErrorMessage = '';
    foundContent = null;
    showFindModal = true; // Always show modal, either with data or error

    if (!findHashInput) {
      findErrorMessage = 'Please enter a hash to search.';
      return;
    }

    // 1. Check existing list
    const localContent = $contentList.find(c => c.hash.toLowerCase() === findHashInput.toLowerCase());
    if (localContent) {
      foundContent = localContent;
      return;
    }

    // 2. If not found locally, request from API
    try {
      const response = await $api.findContent(findHashInput);
      if ('message' in response) {
        findErrorMessage = response.message;
      } else {
        foundContent = response;
      }
    } catch (error) {
      console.error('Failed to find content from network:', error);
      findErrorMessage = 'Unable to find data from network.';
    }
  }

  function closeFindModal() {
    showFindModal = false;
    foundContent = null;
    findErrorMessage = '';
    findHashInput = '';
  }
  
  $: filteredContent = $contentList
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
  
  // Refresh content when connection status changes
  $: if ($isConnected && !contentHasBeenLoaded && !$isLoading) {
    loadContent();
  }
</script>

  {#if !$isConnected}
  <div class="text-center py-12">
    <div class="w-16 h-16 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
      <span class="text-3xl">🔌</span>
    </div>
    <h3 class="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Not Connected</h3>
    <p class="text-zinc-600 dark:text-zinc-400">Please connect to your Open Hash DB instance to view content.</p>
  </div>
{:else}
  <div class="space-y-6">
    <!-- Header with search and controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Files</h2>
        <p class="text-zinc-600 dark:text-zinc-400">Browse and manage your files</p>
      </div>
      
      <div class="flex gap-2">
        <button on:click={loadContent} class="btn-primary">
          <span>🔄</span>
          <span>Refresh</span>
        </button>
        <button on:click={() => showFindModal = true} class="btn-secondary">
          <span>🔍</span>
          <span>Find</span>
        </button>
      </div>
    </div>
    
    <!-- Search and Filter Controls -->
    <div class="card p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            type="text"
            placeholder="Search by filename, hash, or type..."
            bind:value={searchTerm}
            class="input"
          />
        </div>
        
        <div class="flex gap-2 items-center">
          <div class="hidden sm:flex items-center rounded-lg border border-zinc-300 dark:border-white/10 overflow-hidden">
            <button class={"px-3 py-2 text-sm " + ($filesViewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-zinc-700 dark:text-zinc-300')} on:click={() => filesViewMode.set('grid')}>
              Grid
            </button>
            <button class={"px-3 py-2 text-sm " + ($filesViewMode === 'table' ? 'bg-brand-600 text-white' : 'text-zinc-700 dark:text-zinc-300')} on:click={() => filesViewMode.set('table')}>
              Table
            </button>
          </div>
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

    <!-- Content Grid -->
    {#if $isLoading}
      <div class="text-center py-12">
        <div class="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-zinc-600 dark:text-zinc-400">Loading content...</p>
      </div>
    {:else if filteredContent.length === 0}
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">📁</span>
        </div>
        <h3 class="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          {searchTerm ? 'No matching content found' : 'No content available'}
        </h3>
        <p class="text-zinc-600 dark:text-zinc-400">
          {searchTerm ? 'Try adjusting your search terms' : 'Upload some files to get started'}
        </p>
      </div>
    {:else}
      {#if $filesViewMode === 'grid'}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each filteredContent as content (content.hash)}
            <ContentCard {content} showPinActions={true} />
          {/each}
        </div>
      {:else}
        <div class="card overflow-x-auto">
          <table class="min-w-full divide-y divide-zinc-200 dark:divide-white/10 text-sm">
            <thead class="bg-zinc-50 dark:bg-white/5">
              <tr>
                <th class="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Name</th>
                <th class="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Type</th>
                <th class="px-4 py-2 text-right font-medium text-zinc-700 dark:text-zinc-300">Size</th>
                <th class="px-4 py-2 text-left font-medium text-zinc-700 dark:text-zinc-300">Created</th>
                <th class="px-4 py-2 text-right font-medium text-zinc-700 dark:text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-white/10">
              {#each filteredContent as content (content.hash)}
                <tr>
                  <td class="px-4 py-2">
                    <div class="flex items-center gap-3">
                      <span>{content.is_directory ? '📁' : '📄'}</span>
                      <div>
                        <div class="font-medium text-zinc-900 dark:text-zinc-100">{content.filename}</div>
                        <div class="text-xs text-zinc-500">{truncateHash(content.hash)}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-2 text-zinc-600 dark:text-zinc-400">{content.mime_type}</td>
                  <td class="px-4 py-2 text-right">{formatBytes(content.size)}</td>
                  <td class="px-4 py-2">{formatDate(content.created_at)}</td>
                  <td class="px-4 py-2 text-right">
                    <div class="inline-flex gap-2">
                      <button class="btn-ghost" on:click={() => window.open($api.getViewUrl(content.hash), '_blank')}>View</button>
                      <button class="btn-ghost" on:click={() => window.open($api.getDownloadUrl(content.hash), '_blank')}>Download</button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
      
      <!-- Results summary -->
      <div class="text-center text-zinc-600 dark:text-zinc-400">
        <p>Showing {filteredContent.length} of {$contentList.length} items</p>
      </div>
    {/if}

    {#if showFindModal}
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="card p-6 max-w-md w-full">
          <h3 class="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
            {#if foundContent}
              Content Found
            {:else}
              Search Result
            {/if}
          </h3>
          <div class="flex flex-col sm:flex-row gap-4 items-center mb-4">
            <input
              type="text"
              placeholder="Enter hash to find..."
              bind:value={findHashInput}
              on:keydown={(e) => { if (e.key === 'Enter') handleFindHash(); }}
              class="input flex-1"
            />
            <button
              on:click={handleFindHash}
              class="btn-primary bg-green-600 hover:bg-green-700"
            >
              Search Hash
            </button>
          </div>
          {#if foundContent}
            <ContentCard content={foundContent} showPinActions={true} />
          {:else if findErrorMessage}
            <p class="text-red-600 dark:text-red-400 mb-4">{findErrorMessage}</p>
          {/if}
          <div class="mt-4 flex justify-end">
            <button
              on:click={closeFindModal}
              class="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

