<script lang="ts">
  import UploadArea from '../components/UploadArea.svelte';
  import { isConnected } from '../stores';
</script>

{#if !$isConnected}
  <div class="text-center py-12">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span class="text-3xl">🔌</span>
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">Not Connected</h3>
    <p class="text-gray-600">Please connect to your Open Hash DB instance to upload content.</p>
  </div>
{:else}
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Upload Content</h2>
      <p class="text-gray-600">Upload files or folders to your distributed content addressable database.</p>
    </div>
    
    <UploadArea />
    
    <!-- Upload Information -->
    <div class="mt-8 bg-gray-50 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-gray-900 mb-2">🔗 Content Addressing</h4>
          <p class="text-sm text-gray-600">Each file is identified by its cryptographic hash, ensuring data integrity and deduplication.</p>
        </div>
        <div>
          <h4 class="font-medium text-gray-900 mb-2">🧩 Chunking</h4>
          <p class="text-sm text-gray-600">Large files are automatically split into smaller chunks for efficient storage and retrieval.</p>
        </div>
        <div>
          <h4 class="font-medium text-gray-900 mb-2">🌐 Distribution</h4>
          <p class="text-sm text-gray-600">Content is distributed across the network, making it available to other peers.</p>
        </div>
        <div>
          <h4 class="font-medium text-gray-900 mb-2">📌 Pinning</h4>
          <p class="text-sm text-gray-600">Pin important content to ensure it remains available in your local storage.</p>
        </div>
      </div>
    </div>
  </div>
{/if}

