<script lang="ts">
  import Dashboard from '../lib/views/Dashboard.svelte';
  import Upload from '../lib/views/Upload.svelte';
  import Content from '../lib/views/Content.svelte';
  import Pins from '../lib/views/Pins.svelte';
  import Settings from '../lib/views/Settings.svelte';
  import Explore from '../lib/views/Explore.svelte';
  import Peers from '../lib/views/Peers.svelte';
  import { currentView } from '../lib/stores';
  
  function getViewTitle(view: string): string {
    switch (view) {
      case 'dashboard': return 'Status';
      case 'upload': return 'Add';
      case 'content': return 'Files';
      case 'explore': return 'Explore';
      case 'peers': return 'Peers';
      case 'pins': return 'Pins';
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
  {:else if $currentView === 'explore'}
    <Explore />
  {:else if $currentView === 'peers'}
    <Peers />
  {:else if $currentView === 'pins'}
    <Pins />
  {:else if $currentView === 'settings'}
    <Settings />
  {/if}

