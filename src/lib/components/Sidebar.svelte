<script lang="ts">
  import { currentView, totalContent, totalPinned } from '../stores';
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'upload', label: 'Upload', icon: '📤' },
    { id: 'content', label: 'All Content', icon: '📁' },
    { id: 'pins', label: 'Pinned', icon: '📌' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];
  
  function setView(view: typeof $currentView) {
    currentView.set(view);
  }
</script>

<aside class="w-64 bg-white shadow-lg border-r border-gray-200">
  <div class="p-6">
    <div class="flex items-center space-x-2 mb-8">
      <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <span class="text-white font-bold text-sm">OH</span>
      </div>
      <div>
        <h1 class="text-lg font-bold text-gray-900">Open Hash DB</h1>
        <p class="text-xs text-gray-500">Distributed Storage</p>
      </div>
    </div>
    
    <nav class="space-y-2">
      {#each navItems as item}
        <button
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:bg-gray-50 {$currentView === item.id ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-gray-700'}"
          on:click={() => setView(item.id)}
        >
          <span class="text-lg">{item.icon}</span>
          <span class="font-medium">{item.label}</span>
          {#if item.id === 'content' && $totalContent > 0}
            <span class="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {$totalContent}
            </span>
          {/if}
          {#if item.id === 'pins' && $totalPinned > 0}
            <span class="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
              {$totalPinned}
            </span>
          {/if}
        </button>
      {/each}
    </nav>
  </div>
  
  <div class="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
    <div class="text-xs text-gray-500 text-center">
      <p>Distributed Content</p>
      <p>Addressable Database</p>
    </div>
  </div>
</aside>

<style>
  aside {
    position: relative;
  }
</style>

