<script lang="ts">
  import { currentView, isConnected, connectionError } from '../stores';
  import Sidebar from './Sidebar.svelte';
  import Header from './Header.svelte';
  import Notifications from './Notifications.svelte';
  import ConnectionModal from './ConnectionModal.svelte';
  
  export let title = 'Open Hash DB';
</script>

<div class="min-h-screen bg-gray-50 flex">
  <!-- Sidebar -->
  <Sidebar />
  
  <!-- Main content -->
  <div class="flex-1 flex flex-col">
    <!-- Header -->
    <Header {title} />
    
    <!-- Main content area -->
    <main class="flex-1 p-6 overflow-auto">
      <slot />
    </main>
  </div>
  
  <!-- Notifications -->
  <Notifications />
  
  <!-- Connection Modal -->
  {#if !$isConnected || $connectionError}
    <ConnectionModal />
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }
</style>

