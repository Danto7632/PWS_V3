/**
 * API Service for CS Work Simulator
 * NestJS 백엔드 및 FastAPI AI 서비스와 통신
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// ========================
// Types
// ========================

export interface ApiProject {
  id: string;
  name: string;
  category?: string;
  guidelines?: string;
  uploadPercentage?: number;
  isExpanded: boolean;
  createdAt: string;
  updatedAt: string;
  conversations: ApiConversation[];
  files: ApiFile[];
}

export interface ApiConversation {
  id: string;
  title: string;
  preview?: string;
  role: 'customer' | 'employee';
  projectId: string;
  createdAt: string;
  updatedAt: string;
  messages: ApiMessage[];
}

export interface ApiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  conversationId: string;
  timestamp: string;
}

export interface ApiFile {
  id: string;
  name: string;
  type: string;
  size: number;
  embeddingFileId?: string;
  projectId: string;
  createdAt: string;
}

export interface ChatResponse {
  response: string;
  evaluation?: {
    score: number;
    max_score: number;
    feedback: string;
  };
}

export interface ScenarioResponse {
  situation: string;
  customer_type: string;
  first_message: string;
}

export interface FileUploadResponse {
  success: boolean;
  file_id: string;
  chunks_count: number;
  message: string;
}

export interface ApiKeys {
  gpt: string;
  gemini: string;
  claude: string;
  perplexity: string;
  ollama: string;
}

// ========================
// Auth Types
// ========================

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserSettings {
  apiKeys: ApiKeys;
  enabledModels: string[];
  selectedModel: string;
}

// ========================
// Token Management
// ========================

const TOKEN_KEY = 'cs_simulator_token';
const REFRESH_TOKEN_KEY = 'cs_simulator_refresh_token';
const USER_KEY = 'cs_simulator_user';

export const tokenManager = {
  getAccessToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUser: (): AuthResponse['user'] | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setTokens: (auth: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isLoggedIn: (): boolean => !!localStorage.getItem(TOKEN_KEY),
};

// ========================
// API Client
// ========================

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {};
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    // Add Authorization header if logged in
    const token = tokenManager.getAccessToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Handle token refresh on 401
    if (response.status === 401 && tokenManager.getRefreshToken()) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry the request with new token
        defaultHeaders['Authorization'] = `Bearer ${tokenManager.getAccessToken()}`;
        response = await fetch(url, {
          ...options,
          headers: {
            ...defaultHeaders,
            ...options.headers,
          },
        });
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        tokenManager.clearTokens();
        return false;
      }

      const auth = await response.json();
      tokenManager.setTokens(auth);
      return true;
    } catch {
      tokenManager.clearTokens();
      return false;
    }
  }

  // ========================
  // Auth API
  // ========================

  async register(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    tokenManager.setTokens(response);
    return response;
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    tokenManager.setTokens(response);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', { method: 'POST' });
    } finally {
      tokenManager.clearTokens();
    }
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/profile');
  }

  // ========================
  // User Settings API
  // ========================

  async getSettings(): Promise<UserSettings> {
    return this.request<UserSettings>('/auth/settings');
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return this.request<UserSettings>('/auth/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // ========================
  // Projects API
  // ========================

  async getProjects(): Promise<ApiProject[]> {
    return this.request<ApiProject[]>('/projects');
  }

  async getProject(id: string): Promise<ApiProject> {
    return this.request<ApiProject>(`/projects/${id}`);
  }

  async createProject(data: {
    name: string;
    category?: string;
    guidelines?: string;
    uploadPercentage?: number;
  }): Promise<ApiProject> {
    return this.request<ApiProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(
    id: string,
    data: {
      name?: string;
      category?: string;
      guidelines?: string;
      uploadPercentage?: number;
      isExpanded?: boolean;
    }
  ): Promise<ApiProject> {
    return this.request<ApiProject>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async migrateProjectsToUser(projectIds: string[]): Promise<void> {
    return this.request<void>('/projects/migrate', {
      method: 'POST',
      body: JSON.stringify({ projectIds }),
    });
  }

  // ========================
  // Conversations API
  // ========================

  async getConversations(projectId?: string): Promise<ApiConversation[]> {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.request<ApiConversation[]>(`/conversations${query}`);
  }

  async getConversation(id: string): Promise<ApiConversation> {
    return this.request<ApiConversation>(`/conversations/${id}`);
  }

  async createConversation(data: {
    title: string;
    preview?: string;
    role: 'customer' | 'employee';
    projectId: string;
  }): Promise<ApiConversation> {
    return this.request<ApiConversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateConversation(
    id: string,
    data: { title?: string; preview?: string }
  ): Promise<ApiConversation> {
    return this.request<ApiConversation>(`/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteConversation(id: string): Promise<void> {
    return this.request<void>(`/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================
  // Messages API
  // ========================

  async getMessages(conversationId: string): Promise<ApiMessage[]> {
    return this.request<ApiMessage[]>(`/messages/conversation/${conversationId}`);
  }

  async createMessage(data: {
    role: 'user' | 'assistant';
    content: string;
    conversationId: string;
  }): Promise<ApiMessage> {
    return this.request<ApiMessage>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteMessage(id: string): Promise<void> {
    return this.request<void>(`/messages/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================
  // Files API
  // ========================

  async getFiles(projectId: string): Promise<ApiFile[]> {
    return this.request<ApiFile[]>(`/files/project/${projectId}`);
  }

  async createFileRecord(data: {
    name: string;
    type: string;
    size: number;
    projectId: string;
    embeddingFileId?: string;
  }): Promise<ApiFile> {
    return this.request<ApiFile>('/files', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteFile(id: string): Promise<void> {
    return this.request<void>(`/files/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================
  // AI API
  // ========================

  async chat(data: {
    message: string;
    projectId: string;
    conversationId: string;
    role: string;
    modelId?: string;
    apiKeys?: ApiKeys;
    guidelines?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    userId?: string;
  }): Promise<ChatResponse> {
    return this.request<ChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateScenario(data: {
    projectId: string;
    modelId?: string;
    apiKeys?: ApiKeys;
    guidelines?: string;
    userId?: string;
  }): Promise<ScenarioResponse> {
    return this.request<ScenarioResponse>('/ai/scenario', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadFile(
    file: File,
    projectId: string,
    embedPercentage: number = 100,
    userId?: string
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    formData.append('embed_percentage', embedPercentage.toString());
    if (userId) {
      formData.append('user_id', userId);
    }

    return this.request<FileUploadResponse>('/ai/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async searchKnowledge(
    query: string,
    projectId: string,
    topK: number = 3,
    userId?: string
  ): Promise<{ results: string[] }> {
    return this.request<{ results: string[] }>('/ai/search', {
      method: 'POST',
      body: JSON.stringify({ query, projectId, topK, userId }),
    });
  }

  async deleteProjectFiles(projectId: string): Promise<void> {
    return this.request<void>(`/ai/project/${projectId}/files`, {
      method: 'DELETE',
    });
  }

  async getAiHealth(): Promise<{
    status: string;
    ollama_available: boolean;
    openai_available: boolean;
    gemini_available: boolean;
    claude_available: boolean;
  }> {
    return this.request('/ai/health');
  }

  async getOllamaModels(): Promise<{ models: string[]; error?: string }> {
    return this.request('/ai/models/ollama');
  }
}

export const apiService = new ApiService();
export default apiService;
