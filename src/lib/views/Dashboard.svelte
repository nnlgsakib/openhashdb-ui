<script lang="ts">
  import { onMount } from 'svelte';
  import { stats, networkStats, contentList, pinnedList, isConnected } from '../stores';
  import { getApi } from '../api';
  import { formatBytes } from '../utils';
  
  let isLoading = true;
  
  onMount(async () => {
    if ($isConnected) {
      await loadDashboardData();
    }
    isLoading = false;
  });
  
  async function loadDashboardData() {
    try {
      const api = getApi();
      const [statsData, networkData, contentData, pinsData] = await Promise.all([
        api.getStats(),
        api.getNetworkStats(),
        api.listContent(),
        api.listPins()
      ]);
      
      stats.set(statsData);
      networkStats.set(networkData);
      contentList.set(contentData);
      pinnedList.set(pinsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }
  
  // Refresh data when connection status changes
  $: if ($isConnected && !isLoading) {
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
{:else if isLoading}
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
            <p class="text-sm font-medium text-gray-600">Network Peers</p>
            <p class="text-2xl font-bold text-gray-900">{$networkStats?.peers || 0}</p>
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
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Network Status</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center">
            <p class="text-sm text-gray-600">Connections</p>
            <p class="text-xl font-bold text-gray-900">{$networkStats.connections}</p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">Bandwidth In</p>
            <p class="text-xl font-bold text-green-600">{formatBytes($networkStats.bandwidth_in)}/s</p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600">Bandwidth Out</p>
            <p class="text-xl font-bold text-blue-600">{formatBytes($networkStats.bandwidth_out)}/s</p>
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
                <span class="text-xs text-gray-400">{content.hash.slice(0, 8)}...</span>
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
                <span class="text-xs text-gray-400">{content.hash.slice(0, 8)}...</span>
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

