<script lang="ts">
  import { onMount } from 'svelte';
  import Layout from '../lib/components/Layout.svelte';
  import Dashboard from '../lib/views/Dashboard.svelte';
  import Upload from '../lib/views/Upload.svelte';
  import Content from '../lib/views/Content.svelte';
  import Pins from '../lib/views/Pins.svelte';
  import Settings from '../lib/views/Settings.svelte';
  import { currentView, isConnected, apiBaseUrl } from '../lib/stores';
  import { initializeApi, getApi } from '../lib/api';
  
  onMount(async () => {
    // Initialize API with default URL
    initializeApi($apiBaseUrl);
    
    // Test initial connection
    try {
      const api = getApi();
      const connected = await api.testConnection();
      isConnected.set(connected);
    } catch (error) {
      isConnected.set(false);
    }
  });
  
  function getViewTitle(view: string): string {
    switch (view) {
      case 'dashboard': return 'Dashboard';
      case 'upload': return 'Upload Content';
      case 'content': return 'All Content';
      case 'pins': return 'Pinned Content';
      case 'settings': return 'Settings';
      default: return 'Open Hash DB';
    }
  }
</script>

<svelte:head>
  <title>Open Hash DB - Distributed Content Storage</title>
  <meta name="description" content="A versatile UI for Open Hash DB - Distributed Content Addressable Database" />
</svelte:head>

<Layout title={getViewTitle($currentView)}>
  {#if $currentView === 'dashboard'}
    <Dashboard />
  {:else if $currentView === 'upload'}
    <Upload />
  {:else if $currentView === 'content'}
    <Content />
  {:else if $currentView === 'pins'}
    <Pins />
  {:else if $currentView === 'settings'}
    <Settings />
  {/if}
</Layout>

