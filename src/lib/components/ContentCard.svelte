<script lang="ts">
  import type { ContentInfo } from '../api';
  import { formatBytes, formatDate, truncateHash, copyToClipboard, getMimeTypeIcon } from '../utils';
  import { addNotification, api } from '../stores';
  
  export let content: ContentInfo;
  export let showPinActions = true;
  
  let isLoading = false;
  
  async function handlePin() {
    isLoading = true;
    try {
      await $api.pinContent(content.hash);
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
      await $api.unpinContent(content.hash);
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
    const url = $api.getDownloadUrl(content.hash);
    window.open(url, '_blank');
  }
  
  function handleView() {
    const url = $api.getViewUrl(content.hash);
    window.open(url, '_blank');
  }
</script>

<div class="card card-hover p-4">
  <div class="flex items-start justify-between mb-3">
    <div class="flex items-center space-x-3">
      <span class="text-2xl">{getMimeTypeIcon(content.mime_type)}</span>
      <div>
        <h3 class="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs" title={content.filename}>
          {content.filename}
        </h3>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">{content.mime_type}</p>
      </div>
    </div>
    
    {#if content.is_directory}
      <span class="badge bg-brand-100 text-brand-800 dark:bg-white/10 dark:text-zinc-300">
        Directory
      </span>
    {/if}
  </div>
  
  <div class="space-y-2 mb-4">
    <div class="flex justify-between text-sm">
      <span class="text-zinc-600 dark:text-zinc-400">Size:</span>
      <span class="font-medium">{formatBytes(content.size)}</span>
    </div>
    
    <div class="flex justify-between text-sm">
      <span class="text-zinc-600 dark:text-zinc-400">Created:</span>
      <span class="font-medium">{formatDate(content.created_at)}</span>
    </div>
    
    <div class="flex justify-between text-sm">
      <span class="text-zinc-600 dark:text-zinc-400">Hash:</span>
      <button
        on:click={copyHash}
        class="font-mono text-xs bg-zinc-100 dark:bg-white/10 px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors"
        title="Click to copy full hash"
      >
        {truncateHash(content.hash)}
      </button>
    </div>
    
    {#if content.ref_count > 0}
      <div class="flex justify-between text-sm">
        <span class="text-zinc-600 dark:text-zinc-400">References:</span>
        <span class="font-medium">{content.ref_count}</span>
      </div>
    {/if}
  </div>
  
  <div class="flex space-x-2">
    <button
      on:click={handleView}
      class="flex-1 btn-primary"
    >
      👁️ View
    </button>
    
    <button
      on:click={handleDownload}
      class="flex-1 btn-secondary"
    >
      📥 Download
    </button>
    
    {#if showPinActions}
      <button
        on:click={handlePin}
        disabled={isLoading}
        class="btn bg-green-600 text-white hover:bg-green-700 disabled:bg-zinc-300 transition-colors text-sm font-medium"
        title="Pin content"
      >
        📌
      </button>
    {:else}
      <button
        on:click={handleUnpin}
        disabled={isLoading}
        class="btn bg-red-600 text-white hover:bg-red-700 disabled:bg-zinc-300 transition-colors text-sm font-medium"
        title="Unpin content"
      >
        📌❌
      </button>
    {/if}
  </div>
</div>

