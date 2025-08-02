<script lang="ts">
  import Dashboard from '../lib/views/Dashboard.svelte';
  import Upload from '../lib/views/Upload.svelte';
  import Content from '../lib/views/Content.svelte';
  import Pins from '../lib/views/Pins.svelte';
  import Settings from '../lib/views/Settings.svelte';
  import { currentView } from '../lib/stores';
  
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
  <title>Open Hash DB - {getViewTitle($currentView)}</title>
  <meta name="description" content="A versatile UI for Open Hash DB - Distributed Content Addressable Database" />
</svelte:head>

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

