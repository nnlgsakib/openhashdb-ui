<script lang="ts">
  import { currentView, totalContent, totalPinned, sidebarCollapsed } from '../stores';

  const navItems = [
    { id: 'dashboard', label: 'Status', icon: 'M3 12l2-2 4 4 10-10 2 2-12 12-6-6z' },
    { id: 'pins', label: 'Pins', icon: 'M6 3l12 12-4 4-12-12 4-4zm3 3l9 9' },
    { id: 'content', label: 'Files', icon: 'M4 6h16v12H4z M8 6v12' },
    { id: 'explore', label: 'Explore', icon: 'M12 3l9 9-9 9-9-9 9-9z' },
    { id: 'peers', label: 'Peers', icon: 'M7 8a5 5 0 1010 0 5 5 0 10-10 0zm-4 12a8 8 0 0116 0v1H3v-1z' },
    { id: 'settings', label: 'Settings', icon: 'M12 6l1.5-3 3 1.5L18 6l3 1.5L20.5 11l.5 3-3 1.5L16 18l-3-.5L11 20.5 9.5 18l-3-1.5L6 14l.5-3L4 7.5 7 6l3-1.5L12 6z' }
  ];

  function setView(view: typeof $currentView) {
    currentView.set(view);
  }

  function toggleCollapse() {
    sidebarCollapsed.update(v => !v);
  }
</script>

<aside class="relative h-screen sticky top-0 bg-white/80 dark:bg-black/60 border-r border-gray-200/60 dark:border-white/8 backdrop-blur-md">
  <div class={"flex flex-col h-full " + ($sidebarCollapsed ? 'w-[4.25rem]' : 'w-64')}>
    <div class="px-4 pt-4 pb-2 flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-content-center font-bold">OH</div>
      {#if !$sidebarCollapsed}
        <div>
          <h1 class="text-base font-bold text-zinc-900 dark:text-zinc-100">Open Hash DB</h1>
          <p class="text-[11px] text-zinc-500 dark:text-zinc-400 -mt-0.5">Distributed Storage</p>
        </div>
      {/if}
      <button class="ml-auto btn-ghost" on:click={toggleCollapse} aria-label="Toggle sidebar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h10"/></svg>
      </button>
    </div>
    <nav class="px-2 pt-3 space-y-1 overflow-y-auto">
      {#each navItems as item}
        <button
          class="group w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 border border-transparent"
          class:bg-brand-50={$currentView === item.id}
          class:text-brand-700={$currentView === item.id}
          class:dark:text-white={$currentView === item.id}
          class:border-brand-100={$currentView === item.id}
          on:click={() => setView(item.id)}
        >
          <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d={item.icon} stroke-linecap="round" stroke-linejoin="round"/></svg>
          {#if !$sidebarCollapsed}
            <span class="font-medium">{item.label}</span>
            {#if item.id === 'content' && $totalContent > 0}
              <span class="ml-auto badge">{$totalContent}</span>
            {/if}
            {#if item.id === 'pins' && $totalPinned > 0}
              <span class="ml-auto badge">{$totalPinned}</span>
            {/if}
          {/if}
        </button>
      {/each}
    </nav>
    <div class="mt-auto p-3 text-center text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-gray-200/60 dark:border-white/5">
      {#if !$sidebarCollapsed}
        <p>Content Addressable DB</p>
        <p class="opacity-80">Peer-to-peer storage</p>
      {/if}
    </div>
  </div>
</aside>

