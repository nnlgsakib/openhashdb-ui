<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import Layout from '$lib/components/Layout.svelte';
  import ConnectionModal from '$lib/components/ConnectionModal.svelte';
  import Notifications from '$lib/components/Notifications.svelte';
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import QuickAddModal from '$lib/components/QuickAddModal.svelte';
  import { isConnected, apiBaseUrl, api, connectionError, pinnedList, theme, sidebarCollapsed, commandPaletteOpen, openCommandPalette, quickAddOpen } from '$lib/stores';

  onMount(() => {
    // Activate the persistent stores
    apiBaseUrl.useLocalStorage();
    pinnedList.useLocalStorage();
    theme.useLocalStorage();
    sidebarCollapsed.useLocalStorage();

    let healthCheckInterval: NodeJS.Timeout;
    let pinsCheckInterval: NodeJS.Timeout;

    async function checkConnection() {
      try {
        const connected = await $api.testConnection();
        isConnected.set(connected);
        if (connected) {
          connectionError.set(null);
        }
      } catch (e) {
        isConnected.set(false);
      }
    }

    async function checkPins() {
      if (!$isConnected) return;
      try {
        const pinHashes = await $api.listPins();
        const pinDetails = await Promise.all(
          (pinHashes as unknown as string[]).map(hash => $api.getContentInfo(hash))
        );
        pinnedList.set(pinDetails);
      } catch (error) {
        console.error('Failed to refresh pinned content in background:', error);
      }
    }

    // Initial checks
    setTimeout(() => {
      checkConnection().then(() => {
        // Only check pins after confirming connection
        checkPins();
      });
    }, 100);

    // Keyboard shortcuts
    const keyHandler = (e: KeyboardEvent) => {
      // Ctrl/Cmd+K for command palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
    };
    window.addEventListener('keydown', keyHandler);

    // Periodic checks
    healthCheckInterval = setInterval(checkConnection, 15000); // every 15 seconds
    pinsCheckInterval = setInterval(checkPins, 60000); // every 60 seconds

    return () => {
      clearInterval(healthCheckInterval);
      clearInterval(pinsCheckInterval);
      window.removeEventListener('keydown', keyHandler);
    };
  });
</script>

<div class={$theme === 'dark' ? 'dark min-h-screen' : 'min-h-screen'}>
  <Layout>
    <slot />
  </Layout>

  {#if !$isConnected}
    <ConnectionModal />
  {/if}

  <Notifications />
  {#if $commandPaletteOpen}
    <CommandPalette />
  {/if}
  {#if $quickAddOpen}
    <QuickAddModal />
  {/if}
</div>
