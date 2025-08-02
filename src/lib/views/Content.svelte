<script lang="ts">
  import { onMount } from 'svelte';
  import { contentList, isConnected, isLoading, api } from '../stores';
  import ContentCard from '../components/ContentCard.svelte';
  import type { ContentInfo } from '../api';
  
  let searchTerm = '';
  let sortBy = 'created_at';
  let sortOrder = 'desc';

  let findHashInput = '';
  let showFindModal = false;
  let foundContent: ContentInfo | null = null;
  let findErrorMessage = '';
  
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
      contentList.set(content);
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
      const networkContent = await $api.getContentInfo(findHashInput);
      foundContent = networkContent;
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
  $: if ($isConnected) {
    // This check prevents re-loading when the component is mounted
    if ($contentList.length === 0 && !$isLoading) {
      loadContent();
    }
  }
</script>

{#if !$isConnected}
  <div class="text-center py-12">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span class="text-3xl">🔌</span>
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">Not Connected</h3>
    <p class="text-gray-600">Please connect to your Open Hash DB instance to view content.</p>
  </div>
{:else}
  <div class="space-y-6">
    <!-- Header with search and controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">All Content</h2>
        <p class="text-gray-600">Browse and manage all content in the database</p>
      </div>
      
      <div class="flex gap-2">
        <button
          on:click={loadContent}
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
        <button
          on:click={() => showFindModal = true}
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <span>🔍</span>
          <span>Find</span>
        </button>
      </div>
    </div>
    
    <!-- Search and Filter Controls -->
    <div class="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            type="text"
            placeholder="Search by filename, hash, or type..."
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

    <!-- Content Grid -->
    {#if $isLoading}
      <div class="text-center py-12">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Loading content...</p>
      </div>
    {:else if filteredContent.length === 0}
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">📁</span>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {searchTerm ? 'No matching content found' : 'No content available'}
        </h3>
        <p class="text-gray-600">
          {searchTerm ? 'Try adjusting your search terms' : 'Upload some files to get started'}
        </p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredContent as content (content.hash)}
          <ContentCard {content} showPinActions={true} />
        {/each}
      </div>
      
      <!-- Results summary -->
      <div class="text-center text-gray-600">
        <p>Showing {filteredContent.length} of {$contentList.length} items</p>
      </div>
    {/if}

    {#if showFindModal}
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 class="text-xl font-bold mb-4">
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
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <button
              on:click={handleFindHash}
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Search Hash
            </button>
          </div>
          {#if foundContent}
            <ContentCard content={foundContent} showPinActions={true} />
          {:else if findErrorMessage}
            <p class="text-red-600 mb-4">{findErrorMessage}</p>
          {/if}
          <div class="mt-4 flex justify-end">
            <button
              on:click={closeFindModal}
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

