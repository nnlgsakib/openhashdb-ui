<script lang="ts">
  import { onMount } from 'svelte';
  import { exploreHash, isConnected, isLoading, api, addNotification } from '../stores';
  import { formatBytes, formatDate, truncateHash, getMimeTypeIcon } from '../utils';
  import type { ContentInfo } from '../api';

  let input = '';
  let result: ContentInfo | { message: string } | null = null;
  let error: string = '';

  async function search(hash: string) {
    if (!hash) return;
    error = '';
    result = null;
    isLoading.set(true);
    try {
      const data = await $api.findContent(hash);
      result = data;
      if ('message' in data) {
        error = data.message;
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Lookup failed';
    } finally {
      isLoading.set(false);
    }
  }

  function openView(url: string) {
    window.open(url, '_blank');
  }

  onMount(() => {
    const unsub = exploreHash.subscribe((v) => {
      input = v;
      if (v) void search(v);
    });
    return () => unsub();
  });
</script>

<div class="space-y-4">
  <div class="card p-4">
    <div class="flex items-center gap-3">
      <input class="input flex-1" placeholder="Enter CID / hash..." bind:value={input} on:keydown={(e) => { if (e.key==='Enter') { exploreHash.set(input); search(input); } }} />
      <button class="btn-primary" on:click={() => { exploreHash.set(input); search(input); }}>Explore</button>
    </div>
  </div>

  {#if !$isConnected}
    <div class="text-center py-12">
      <div class="w-16 h-16 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">🔌</div>
      <p class="text-zinc-600 dark:text-zinc-400">Connect to explore content.</p>
    </div>
  {:else if $isLoading}
    <div class="text-center py-12">
      <div class="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-zinc-600 dark:text-zinc-400">Searching...</p>
    </div>
  {:else if error}
    <div class="card p-4">
      <p class="text-red-600 dark:text-red-400">{error}</p>
    </div>
  {:else if result}
    {#if 'hash' in result}
      <div class="card p-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{getMimeTypeIcon(result.mime_type)}</span>
            <div>
              <div class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{result.filename}</div>
              <div class="text-xs text-zinc-500">{result.mime_type}</div>
            </div>
          </div>
          <div class="badge">{result.is_directory ? 'Directory' : 'File'}</div>
        </div>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div class="flex justify-between"><span class="text-zinc-600 dark:text-zinc-400">CID:</span><code class="ml-3 font-mono">{result.hash}</code></div>
          <div class="flex justify-between"><span class="text-zinc-600 dark:text-zinc-400">Size:</span><span>{formatBytes(result.size)}</span></div>
          <div class="flex justify-between"><span class="text-zinc-600 dark:text-zinc-400">Created:</span><span>{formatDate(result.created_at)}</span></div>
          {#if result.chunk_count}
            <div class="flex justify-between"><span class="text-zinc-600 dark:text-zinc-400">Chunks:</span><span>{result.chunk_count}</span></div>
          {/if}
          {#if result.ref_count}
            <div class="flex justify-between"><span class="text-zinc-600 dark:text-zinc-400">Refs:</span><span>{result.ref_count}</span></div>
          {/if}
        </div>
        <div class="mt-4 flex gap-2">
          <button class="btn-primary" on:click={() => openView($api.getViewUrl(result.hash))}>View</button>
          <button class="btn-secondary" on:click={() => openView($api.getDownloadUrl(result.hash))}>Download</button>
        </div>
      </div>
    {:else}
      <div class="card p-4">
        <p class="text-zinc-600 dark:text-zinc-400">{result.message}</p>
      </div>
    {/if}
  {/if}
</div>

