<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { stats, networkStats, contentList, pinnedList, isConnected, api, isLoading } from '../stores';
  import { formatBytes } from '../utils';

  async function loadDashboardData() {
    if (get(isLoading)) return;
    isLoading.set(true);

    // Fetch network stats
    const networkPromise = $api.getNetworkStats().then(networkStats.set).catch(err => {
        console.error('Failed to load network stats:', err);
        networkStats.set(null);
    });

    // Fetch content and pins in parallel
    const contentPromise = $api.listContent().catch(err => {
        console.error('Failed to load content list:', err);
        return []; // Return empty array on failure
    });

    const pinsPromise = $api.listPins()
        .then(pinHashes => {
            if (!pinHashes || !Array.isArray(pinHashes)) {
                return Promise.resolve([]);
            }
            return Promise.all(pinHashes.map(hash => $api.getContentInfo(hash)));
        })
        .catch(err => {
            console.error('Failed to load pin details:', err);
            return []; // Return empty array on failure
        });

    // Wait for both content and pins to be fetched
    const [contentResponse, pinDetails] = await Promise.all([contentPromise, pinsPromise]);

    const contentData = contentResponse || [];
    
    contentList.set(contentData);
    pinnedList.set(pinDetails || []);

    // --- Calculate Combined Stats ---
    const allContent = new Map();
    contentData.forEach(item => allContent.set(item.hash, item));
    (pinDetails || []).forEach(item => allContent.set(item.hash, item));

    const uniqueContent = Array.from(allContent.values());
    
    const total_size = uniqueContent.reduce((acc, item) => acc + (item.size || 0), 0);
    const total_content = uniqueContent.length;
    const pinned_size = (pinDetails || []).reduce((acc, item) => acc + (item.size || 0), 0);
    const pinned_content = (pinDetails || []).length;

    stats.set({ total_content, total_size, pinned_content, pinned_size });
    // --- End of Stat Calculation ---

    isLoading.set(false);
  }

  onMount(() => {
    // Load data when component mounts if connected
    if ($isConnected) {
      loadDashboardData();
    }
  });

  // This reactive statement will trigger when isConnected becomes true
  // and the core dashboard data (stats) is missing.
  $: if ($isConnected && $stats === null && !$isLoading) {
    loadDashboardData();
  }
</script>

{#if !$isConnected}
  <div class="text-center py-12">
    <div class="w-16 h-16 bg-zinc-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
      <span class="text-3xl">🔌</span>
    </div>
    <h3 class="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Not Connected</h3>
    <p class="text-zinc-600 dark:text-zinc-400">Please connect to your Open Hash DB instance to view the dashboard.</p>
  </div>
{:else if $isLoading && $stats === null}
  <div class="text-center py-12">
    <div class="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    <p class="text-zinc-600 dark:text-zinc-400">Loading dashboard data...</p>
  </div>
{:else}
  <div class="space-y-6">
    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card card-hover p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Content</p>
            <p class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{$stats?.total_content || 0}</p>
          </div>
          <div class="w-12 h-12 bg-brand-100 dark:bg-white/10 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📁</span>
          </div>
        </div>
      </div>

      <div class="card card-hover p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-zinc-600 dark:text-zinc-400">Pinned Content</p>
            <p class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{$stats?.pinned_content || 0}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 dark:bg-white/10 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📌</span>
          </div>
        </div>
      </div>

      <div class="card card-hover p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-zinc-600 dark:text-zinc-400">Connected Peers</p>
            <p class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{$networkStats?.connected_peers || 0}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 dark:bg-white/10 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🌐</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Network Status -->
    {#if $networkStats}
      <div class="card card-hover p-6">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Network Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="text-center">
            <p class="text-sm text-zinc-600 dark:text-zinc-400">DHT Enabled</p>
            <p class="text-xl font-bold text-zinc-900 dark:text-zinc-100">{$networkStats.dht?.enabled ? 'Yes' : 'No'}</p>
          </div>
          <div class="text-center">
            <p class="text-sm text-zinc-600 dark:text-zinc-400">DHT Peers</p>
            <p class="text-xl font-bold text-zinc-900 dark:text-zinc-100">{$networkStats.dht?.peer_count || 0}</p>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Recent Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card card-hover p-6">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Recent Content</h3>
        {#if $contentList.length > 0}
          <div class="space-y-3">
            {#each $contentList.slice(0, 5) as content}
              <div class="flex items-center justify-between p-3 bg-zinc-50 dark:bg-white/5 rounded-lg">
                <div class="flex items-center space-x-3">
                  <span class="text-lg">📄</span>
                  <div>
                    <p class="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-xs">{content.filename}</p>
                    <p class="text-sm text-zinc-500 dark:text-zinc-400">{formatBytes(content.size)}</p>
                  </div>
                </div>
                <span class="text-xs text-zinc-400">{content.hash ? `${content.hash.slice(0, 8)}...` : 'N/A'}</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-zinc-500 text-center py-4">No content available</p>
        {/if}
      </div>
      
      <div class="card card-hover p-6">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Pinned Content</h3>
        {#if $pinnedList.length > 0}
          <div class="space-y-3">
            {#each $pinnedList.slice(0, 5) as content}
              <div class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-white/5 rounded-lg">
                <div class="flex items-center space-x-3">
                  <span class="text-lg">📌</span>
                  <div>
                    <p class="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-xs">{content.filename}</p>
                    <p class="text-sm text-zinc-500 dark:text-zinc-400">{formatBytes(content.size)}</p>
                  </div>
                </div>
                <span class="text-xs text-zinc-400">{content.hash ? `${content.hash.slice(0, 8)}...` : 'N/A'}</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-zinc-500 text-center py-4">No pinned content</p>
        {/if}
      </div>
    </div>

    <!-- Detailed Network Info -->
    {#if $networkStats}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card card-hover p-6">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">DHT Information</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-zinc-600 dark:text-zinc-400">DHT Enabled:</span>
            <span class="font-medium text-zinc-900 dark:text-zinc-100">{$networkStats.dht?.enabled ? 'Yes' : 'No'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-600 dark:text-zinc-400">DHT Peers:</span>
            <span class="font-medium text-zinc-900 dark:text-zinc-100">{$networkStats.dht?.peer_count || 0}</span>
          </div>
        </div>
      </div>

      <div class="card card-hover p-6">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Peer List</h3>
        {#if $networkStats.peer_list && $networkStats.peer_list.length > 0}
          <div class="space-y-2 text-sm font-mono bg-zinc-50 dark:bg-white/5 p-3 rounded-lg max-h-48 overflow-y-auto">
            {#each $networkStats.peer_list as peer}
              <div class="truncate" title={peer}>{peer}</div>
            {/each}
          </div>
        {:else}
          <p class="text-zinc-500 text-center py-4">No peers in list</p>
        {/if}
      </div>
    </div>
    {/if}
  </div>
{/if}


