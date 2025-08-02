<script lang="ts">
  import type { ContentInfo } from '../api';
  import { formatBytes, formatDate, truncateHash, copyToClipboard, getMimeTypeIcon } from '../utils';
  import { addNotification } from '../stores';
  import { getApi } from '../api';
  
  export let content: ContentInfo;
  export let showPinActions = true;
  
  let isLoading = false;
  
  async function handlePin() {
    isLoading = true;
    try {
      const api = getApi();
      await api.pinContent(content.hash);
      addNotification('success', `Content pinned: ${content.filename}`);
      // Dispatch event to refresh lists
      window.dispatchEvent(new CustomEvent('refresh-content'));
    } catch (error) {
      addNotification('error', `Failed to pin content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isLoading = false;
    }
  }
  
  async function handleUnpin() {
    isLoading = true;
    try {
      const api = getApi();
      await api.unpinContent(content.hash);
      addNotification('success', `Content unpinned: ${content.filename}`);
      // Dispatch event to refresh lists
      window.dispatchEvent(new CustomEvent('refresh-content'));
    } catch (error) {
      addNotification('error', `Failed to unpin content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isLoading = false;
    }
  }
  
  async function copyHash() {
    try {
      await copyToClipboard(content.hash);
      addNotification('success', 'Hash copied to clipboard');
    } catch (error) {
      addNotification('error', 'Failed to copy hash');
    }
  }
  
  function handleDownload() {
    const api = getApi();
    const url = api.getDownloadUrl(content.hash);
    window.open(url, '_blank');
  }
  
  function handleView() {
    const api = getApi();
    const url = api.getViewUrl(content.hash);
    window.open(url, '_blank');
  }
</script>

<div class="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200">
  <div class="flex items-start justify-between mb-3">
    <div class="flex items-center space-x-3">
      <span class="text-2xl">{getMimeTypeIcon(content.mime_type)}</span>
      <div>
        <h3 class="font-semibold text-gray-900 truncate max-w-xs" title={content.filename}>
          {content.filename}
        </h3>
        <p class="text-sm text-gray-500">{content.mime_type}</p>
      </div>
    </div>
    
    {#if content.is_directory}
      <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
        Directory
      </span>
    {/if}
  </div>
  
  <div class="space-y-2 mb-4">
    <div class="flex justify-between text-sm">
      <span class="text-gray-600">Size:</span>
      <span class="font-medium">{formatBytes(content.size)}</span>
    </div>
    
    <div class="flex justify-between text-sm">
      <span class="text-gray-600">Created:</span>
      <span class="font-medium">{formatDate(content.created_at)}</span>
    </div>
    
    <div class="flex justify-between text-sm">
      <span class="text-gray-600">Hash:</span>
      <button
        on:click={copyHash}
        class="font-mono text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
        title="Click to copy full hash"
      >
        {truncateHash(content.hash)}
      </button>
    </div>
    
    {#if content.ref_count > 0}
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">References:</span>
        <span class="font-medium">{content.ref_count}</span>
      </div>
    {/if}
  </div>
  
  <div class="flex space-x-2">
    <button
      on:click={handleView}
      class="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
    >
      👁️ View
    </button>
    
    <button
      on:click={handleDownload}
      class="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
    >
      📥 Download
    </button>
    
    {#if showPinActions}
      <button
        on:click={handlePin}
        disabled={isLoading}
        class="bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors text-sm font-medium"
        title="Pin content"
      >
        📌
      </button>
    {:else}
      <button
        on:click={handleUnpin}
        disabled={isLoading}
        class="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors text-sm font-medium"
        title="Unpin content"
      >
        📌❌
      </button>
    {/if}
  </div>
</div>

