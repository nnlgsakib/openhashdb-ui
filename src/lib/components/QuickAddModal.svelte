<script lang="ts">
  import UploadArea from './UploadArea.svelte';
  import { closeQuickAdd } from '../stores';
  function onBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) closeQuickAdd();
  }
</script>

<div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" on:click={onBackdrop}>
  <div class="card w-full max-w-3xl mx-4 overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200/60 dark:border-white/10">
      <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Add Files</h3>
      <button class="btn-ghost" on:click={closeQuickAdd} aria-label="Close">
        ✕
      </button>
    </div>
    <div class="p-4">
      <UploadArea />
    </div>
  </div>
  
</div>

