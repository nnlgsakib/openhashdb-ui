// API service layer for Open Hash DB
export interface ApiConfig {
  baseUrl: string;
}

export interface UploadResponse {
  hash: string;
  size: number;
  filename?: string;
  message: string;
}

export interface ErrorResponse {
  error: string;
  code: number;
  message: string;
}

export interface ContentInfo {
  hash: string;
  filename: string;
  mime_type: string;
  size: number;
  mod_time: string;
  chunk_count?: number;
  is_directory: boolean;
  created_at: string;
  ref_count: number;
}

export interface NetworkStats {
  peers: number;
  connections: number;
  bandwidth_in: number;
  bandwidth_out: number;
}

export interface Stats {
  total_content: number;
  total_size: number;
  pinned_content: number;
  pinned_size: number;
}

class ApiService {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  updateConfig(config: ApiConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json().catch(() => ({
          error: 'Network Error',
          code: response.status,
          message: response.statusText,
        }));
        throw new Error(`${errorData.message || errorData.error}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  // Upload operations
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.config.baseUrl}/upload/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        error: 'Upload Error',
        code: response.status,
        message: response.statusText,
      }));
      throw new Error(`${errorData.message || errorData.error}`);
    }

    return await response.json();
  }

  async uploadFolder(files: FileList): Promise<UploadResponse> {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${this.config.baseUrl}/upload/folder`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        error: 'Upload Error',
        code: response.status,
        message: response.statusText,
      }));
      throw new Error(`${errorData.message || errorData.error}`);
    }

    return await response.json();
  }

  // Content operations
  async getContentInfo(hash: string): Promise<ContentInfo> {
    return this.request<ContentInfo>(`/info/${hash}`);
  }

  async listContent(): Promise<ContentInfo[]> {
    return this.request<ContentInfo[]>('/list');
  }

  async listPins(): Promise<ContentInfo[]> {
    return this.request<ContentInfo[]>('/pins');
  }

  // Pin operations
  async pinContent(hash: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/pin/${hash}`, {
      method: 'POST',
    });
  }

  async unpinContent(hash: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/unpin/${hash}`, {
      method: 'DELETE',
    });
  }

  // Stats operations
  async getStats(): Promise<Stats> {
    return this.request<Stats>('/stats');
  }

  async getNetworkStats(): Promise<NetworkStats> {
    return this.request<NetworkStats>('/network');
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  // Download operations
  getDownloadUrl(hash: string): string {
    return `${this.config.baseUrl}/download/${hash}`;
  }

  getViewUrl(hash: string): string {
    return `${this.config.baseUrl}/view/${hash}`;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }
}

// Create a default instance
let apiService: ApiService;

export function initializeApi(baseUrl: string = 'http://localhost:8080') {
  apiService = new ApiService({ baseUrl });
  return apiService;
}

export function getApi(): ApiService {
  if (!apiService) {
    apiService = initializeApi();
  }
  return apiService;
}

export { ApiService };

