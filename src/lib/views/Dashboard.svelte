<script lang="ts">
  import { onMount } from 'svelte';
  import { stats, networkStats, contentList, pinnedList, isConnected, api, isLoading } from '../stores';
  import { formatBytes } from '../utils';

  async function loadDashboardData() {
    if ($isLoading) return;
    isLoading.set(true);

    // Fetch stats and network in parallel
    const statsPromise = $api.getStats().then(stats.set).catch(err => {
        console.error('Failed to load stats:', err);
        stats.set(null);
    });

    const networkPromise = $api.getNetworkStats().then(networkStats.set).catch(err => {
        console.error('Failed to load network stats:', err);
        networkStats.set(null);
    });

    // Fetch content list
    const contentPromise = $api.listContent().then(contentList.set).catch(err => {
        console.error('Failed to load content list:', err);
        contentList.set([]);
    });

    // Fetch pinned list
    const pinsPromise = $api.listPins().then(async (pinHashes) => {
        try {
            const pinDetails = await Promise.all(
                (pinHashes as unknown as string[]).map(hash => $api.getContentInfo(hash))
            );
            pinnedList.set(pinDetails);
        } catch (err) {
            console.error('Failed to load pin details:', err);
            pinnedList.set([]);
        }
    }).catch(err => {
        console.error('Failed to load pin hashes:', err);
        pinnedList.set([]);
    });

    // Wait for all to settle before clearing the loading state
    await Promise.allSettled([statsPromise, networkPromise, contentPromise, pinsPromise]);
    
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
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span class="text-3xl">🔌</span>
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">Not Connected</h3>
    <p class="text-gray-600">Please connect to your Open Hash DB instance to view the dashboard.</p>
  </div>
{:else if $isLoading && $stats === null}
  <div class="text-center py-12">
    <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    <p class="text-gray-600">Loading dashboard data...</p>
  </div>
{:else}
  <div class="space-y-6">
    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Content</p>
            <p class="text-2xl font-bold text-gray-900">{$stats?.total_content || 0}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📁</span>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Size</p>
            <p class="text-2xl font-bold text-gray-900">{formatBytes($stats?.total_size || 0)}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">💾</span>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pinned Content</p>
            <p class="text-2xl font-bold text-gray-900">{$stats?.pinned_content || 0}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📌</span>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Connected Peers</p>
            <p class="text-2xl font-bold text-gray-900">{$networkStats?.connected_peers || 0}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🌐</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Network Status -->
    {#if $networkStats}
      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Network Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="text-center">
            <p class="text-sm text-gray-600">DHT Enabled</p>
            <p class="text-xl font-bold text-gray-900">{$networkStats.dht?.enabled ? 'Yes' : 'No'}</p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">DHT Peers</p>
            <p class="text-xl font-bold text-gray-900">{$networkStats.dht?.peer_count || 0}</p>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Recent Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Content</h3>
        {#if $contentList.length > 0}
          <div class="space-y-3">
            {#each $contentList.slice(0, 5) as content}
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <span class="text-lg">📄</span>
                  <div>
                    <p class="font-medium text-gray-900 truncate max-w-xs">{content.filename}</p>
                    <p class="text-sm text-gray-500">{formatBytes(content.size)}</p>
                  </div>
                </div>
                <span class="text-xs text-gray-400">{content.hash ? `${content.hash.slice(0, 8)}...` : 'N/A'}</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-gray-500 text-center py-4">No content available</p>
        {/if}
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Pinned Content</h3>
        {#if $pinnedList.length > 0}
          <div class="space-y-3">
            {#each $pinnedList.slice(0, 5) as content}
              <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <span class="text-lg">📌</span>
                  <div>
                    <p class="font-medium text-gray-900 truncate max-w-xs">{content.filename}</p>
                    <p class="text-sm text-gray-500">{formatBytes(content.size)}</p>
                  </div>
                </div>
                <span class="text-xs text-gray-400">{content.hash ? `${content.hash.slice(0, 8)}...` : 'N/A'}</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-gray-500 text-center py-4">No pinned content</p>
        {/if}
      </div>
    </div>
  </div>
{/if}

