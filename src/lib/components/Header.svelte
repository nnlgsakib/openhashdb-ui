<script lang="ts">
  import { isConnected, connectionError, apiBaseUrl, theme, openCommandPalette, openQuickAdd, currentView, exploreHash } from '../stores';
  
  export let title: string;

  function toggleTheme() {
    theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }
</script>

<header class="glass border-b border-gray-200/60 dark:border-white/6 px-4 md:px-6 py-3 sticky top-0 z-30">
  <div class="flex items-center gap-3">
    <div class="flex-1 min-w-0">
      <h2 class="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">{title}</h2>
    </div>

    <!-- Global CID search -->
    <div class="hidden lg:flex items-center gap-2 mx-2 min-w-[280px]">
      <div class="relative flex-1">
        <input class="input pl-9" placeholder="Search CID / hash" on:keydown={(e) => { if (e.key==='Enter') { exploreHash.set((e.target as HTMLInputElement).value); currentView.set('explore'); } }} />
        <svg class="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      </div>
      <button class="btn-ghost" title="Command palette (Ctrl/Cmd+K)" on:click={openCommandPalette}>
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 8h8v8H8z"/></svg>
        <span class="hidden xl:inline text-sm">Commands</span>
      </button>
    </div>

    <!-- Global Add -->
    <button class="btn-primary" on:click={openQuickAdd} title="Add files">
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
      <span class="hidden md:inline">Add</span>
    </button>

    <!-- Theme toggle -->
    <button class="btn-ghost" on:click={toggleTheme} title="Toggle theme">
      {#if $theme === 'dark'}
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      {:else}
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8 1.8-1.8zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm8.83-3.17l1.8-1.8-1.8-1.79-1.8 1.8 1.8 1.79zM20 13h3v-2h-3v2zM6.76 19.16l-1.8 1.8 1.79 1.8 1.8-1.8-1.79-1.8zM13 1h-2v3h2V1zM17.24 4.84l1.8-1.79L17.24 1.26l-1.8 1.8 1.8 1.78z"/></svg>
      {/if}
    </button>

    <!-- Connection status -->
    <div class="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5">
      <span class="w-2.5 h-2.5 rounded-full {$isConnected ? 'bg-green-500' : 'bg-red-500'}"></span>
      <span class="text-sm text-zinc-700 dark:text-zinc-300">{$isConnected ? 'Connected' : 'Disconnected'}</span>
      {#if $isConnected}
        <span class="hidden lg:inline text-xs text-zinc-500">{$apiBaseUrl}</span>
      {/if}
    </div>

    <!-- Error indicator -->
    {#if $connectionError}
      <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
        <span class="text-sm">⚠️</span>
        <span class="text-sm">Connection Error</span>
      </div>
    {/if}
  </div>
</header>

