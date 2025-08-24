<script lang="ts">
  import { onMount } from 'svelte';
  import { isConnected, networkStats, api, isLoading } from '../stores';

  onMount(async () => {
    if ($isConnected && !$networkStats) {
      isLoading.set(true);
      try {
        const ns = await $api.getNetworkStats();
        networkStats.set(ns);
      } finally {
        isLoading.set(false);
      }
    }
  });
</script>

<div class="space-y-4">
  <div class="flex items-baseline justify-between">
    <div>
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Peers</h2>
      <p class="text-zinc-600 dark:text-zinc-400">Connected peers and addresses</p>
    </div>
    <button class="btn-primary" on:click={async () => networkStats.set(await $api.getNetworkStats())}>Refresh</button>
  </div>

  {#if !$isConnected}
    <div class="text-center py-12">
      <div class="w-16 h-16 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">🔌</div>
      <p class="text-zinc-600 dark:text-zinc-400">Connect to view peers.</p>
    </div>
  {:else if $isLoading}
    <div class="text-center py-12">
      <div class="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-zinc-600 dark:text-zinc-400">Loading peers...</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="card p-4">
        <h3 class="text-lg font-semibold mb-3">Node</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-zinc-600 dark:text-zinc-400">Peer ID</span><code>{$networkStats?.peer_id}</code></div>
          <div>
            <div class="text-zinc-600 dark:text-zinc-400 mb-1">Addresses</div>
            <div class="space-y-1 text-xs font-mono bg-zinc-50 dark:bg-white/5 p-2 rounded max-h-40 overflow-auto">
              {#each $networkStats?.addresses || [] as addr}
                <div class="truncate" title={addr}>{addr}</div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <h3 class="text-lg font-semibold mb-3">Peer List ({$networkStats?.connected_peers || 0})</h3>
        {#if $networkStats?.peer_list?.length}
          <div class="space-y-1 text-xs font-mono bg-zinc-50 dark:bg-white/5 p-2 rounded max-h-80 overflow-auto">
            {#each $networkStats.peer_list as peer}
              <div class="truncate" title={peer}>{peer}</div>
            {/each}
          </div>
        {:else}
          <p class="text-zinc-600 dark:text-zinc-400">No peers available.</p>
        {/if}
      </div>
    </div>
  {/if}
</div>

