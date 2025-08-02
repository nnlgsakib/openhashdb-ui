<script lang="ts">
  import { api, addNotification } from '../stores';
  
  let isDragOver = false;
  let isUploading = false;
  let uploadProgress = 0;
  let fileInput: HTMLInputElement;
  let folderInput: HTMLInputElement;
  
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragOver = true;
  }
  
  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
  }
  
  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  }
  
  async function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
    target.value = '';
  }
  
  async function uploadFiles(files: FileList) {
    if (files.length === 0) return;
    
    isUploading = true;
    uploadProgress = 0;
    
    try {
      if (files.length === 1) {
        // Single file upload
        const file = files[0];
        const response = await $api.uploadFile(file);
        addNotification('success', `File uploaded: ${response.filename} (${response.hash.slice(0, 8)}...)`);
      } else {
        // Multiple files - upload as folder
        const response = await $api.uploadFolder(files);
        addNotification('success', `Folder uploaded: ${response.filename} (${response.hash.slice(0, 8)}...)`);
      }
      
      // Dispatch event to refresh content lists
      window.dispatchEvent(new CustomEvent('refresh-content'));
      
    } catch (error) {
      addNotification('error', `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isUploading = false;
      uploadProgress = 0;
    }
  }
  
  function triggerFileSelect() {
    fileInput.click();
  }
  
  function triggerFolderSelect() {
    folderInput.click();
  }
</script>

<div class="space-y-6">
  <!-- Drag and Drop Area -->
  <div
    class="border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 {isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'} {isUploading ? 'pointer-events-none opacity-50' : ''}"
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    role="button"
    tabindex="0"
  >
    {#if isUploading}
      <div class="space-y-4">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-lg font-medium text-gray-700">Uploading...</p>
        {#if uploadProgress > 0}
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: {uploadProgress}%"></div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="space-y-4">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <span class="text-3xl">📤</span>
        </div>
        <div>
          <p class="text-lg font-medium text-gray-700">Drop files here to upload</p>
          <p class="text-gray-500">or click the buttons below to select files</p>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Upload Buttons -->
  {#if !isUploading}
    <div class="flex space-x-4 justify-center">
      <button
        on:click={triggerFileSelect}
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
      >
        <span>📄</span>
        <span>Select Files</span>
      </button>
      
      <button
        on:click={triggerFolderSelect}
        class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
      >
        <span>📁</span>
        <span>Select Folder</span>
      </button>
    </div>
  {/if}
  
  <!-- Hidden file inputs -->
  <input
    bind:this={fileInput}
    type="file"
    multiple
    class="hidden"
    on:change={handleFileSelect}
  />
  
  <input
    bind:this={folderInput}
    type="file"
    webkitdirectory
    multiple
    class="hidden"
    on:change={handleFileSelect}
  />
  
  <!-- Upload Tips -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h4 class="font-medium text-blue-900 mb-2">💡 Upload Tips</h4>
    <ul class="text-sm text-blue-800 space-y-1">
      <li>• Single files will be uploaded individually</li>
      <li>• Multiple files will be zipped and uploaded as a folder</li>
      <li>• Large files are automatically chunked for efficient storage</li>
      <li>• All uploads are content-addressed and deduplicated</li>
    </ul>
  </div>
</div>

