<script lang="ts">
  import { onMount } from 'svelte';
  import { currentView, closeCommandPalette, commandPaletteOpen, theme, addNotification } from '../stores';

  type Cmd = { label: string; action: () => void; hint?: string };
  let query = '';

  const baseCommands: Cmd[] = [
    { label: 'Go to Dashboard', action: () => (currentView.set('dashboard'), closeCommandPalette()) },
    { label: 'Go to Upload', action: () => (currentView.set('upload'), closeCommandPalette()) },
    { label: 'Go to Content', action: () => (currentView.set('content'), closeCommandPalette()) },
    { label: 'Go to Pinned', action: () => (currentView.set('pins'), closeCommandPalette()) },
    { label: 'Go to Settings', action: () => (currentView.set('settings'), closeCommandPalette()) },
    { label: 'Toggle Theme', action: () => (theme.update(t => (t === 'light' ? 'dark' : 'light')), closeCommandPalette()) },
    { label: 'Refresh Content', action: () => (window.dispatchEvent(new CustomEvent('refresh-content')), closeCommandPalette()) },
    { label: 'Copy API URL', action: () => { navigator.clipboard?.writeText(window.location.origin); addNotification('success', 'API URL copied'); closeCommandPalette(); } },
  ];

  $: results = baseCommands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') closeCommandPalette();
  }

  let inputEl: HTMLInputElement;
  onMount(() => {
    inputEl?.focus();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

<div class="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50" on:click={() => closeCommandPalette()}>
  <div class="w-full max-w-xl mx-4" on:click|stopPropagation>
    <div class="card overflow-hidden">
      <div class="p-3 border-b border-gray-200/60 dark:border-white/5 bg-white/90 dark:bg-white/5">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input bind:this={inputEl} bind:value={query} placeholder="Type a command..." class="input !border-0 !ring-0 bg-transparent focus:ring-0" />
          <kbd class="ml-auto hidden md:inline text-[10px] text-zinc-500 bg-zinc-100 dark:bg-white/10 px-1.5 py-0.5 rounded">Esc</kbd>
        </div>
      </div>
      <div class="max-h-80 overflow-auto">
        {#if results.length === 0}
          <div class="p-4 text-sm text-zinc-500">No results</div>
        {:else}
          {#each results as cmd}
            <button class="w-full text-left px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors flex items-center gap-3 text-sm" on:click={cmd.action}>
              <span>{cmd.label}</span>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>
