import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ChatRequestDto, ScenarioRequestDto } from './dto/ai.dto';
import * as FormData from 'form-data';

@Injectable()
export class AiService {
  private readonly aiClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
    
    this.aiClient = axios.create({
      baseURL: aiServiceUrl,
      timeout: 60000, // AI 응답은 시간이 걸릴 수 있음
    });
  }

  async chat(chatRequest: ChatRequestDto): Promise<any> {
    try {
      const response = await this.aiClient.post('/api/ai/chat', {
        message: chatRequest.message,
        project_id: chatRequest.projectId,
        conversation_id: chatRequest.conversationId,
        role: chatRequest.role,
        model_id: chatRequest.modelId || 'gpt-4o',
        api_keys: chatRequest.apiKeys,
        guidelines: chatRequest.guidelines,
        conversation_history: chatRequest.conversationHistory,
        user_id: chatRequest.userId || null,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'AI 채팅 요청 실패');
    }
  }

  async generateScenario(scenarioRequest: ScenarioRequestDto): Promise<any> {
    try {
      const response = await this.aiClient.post('/api/ai/scenario', {
        project_id: scenarioRequest.projectId,
        model_id: scenarioRequest.modelId || 'gpt-4o',
        api_keys: scenarioRequest.apiKeys,
        guidelines: scenarioRequest.guidelines,
        user_id: scenarioRequest.userId || null,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, '시나리오 생성 실패');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    projectId: string,
    embedPercentage: number = 100,
    userId?: string,
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      formData.append('project_id', projectId);
      formData.append('embed_percentage', embedPercentage.toString());
      if (userId) {
        formData.append('user_id', userId);
      }

      const response = await this.aiClient.post('/api/ai/upload', formData, {
        headers: formData.getHeaders(),
      });
      return response.data;
    } catch (error) {
      this.handleError(error, '파일 업로드 실패');
    }
  }

  async search(query: string, projectId: string, topK: number = 3, userId?: string): Promise<any> {
    try {
      const response = await this.aiClient.post('/api/ai/search', {
        query,
        project_id: projectId,
        top_k: topK,
        user_id: userId || null,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'RAG 검색 실패');
    }
  }

  async deleteProjectFiles(projectId: string): Promise<any> {
    try {
      const response = await this.aiClient.delete(
        `/api/ai/project/${projectId}/files`,
      );
      return response.data;
    } catch (error) {
      this.handleError(error, '프로젝트 파일 삭제 실패');
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await this.aiClient.get('/api/ai/health');
      return response.data;
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async getOllamaModels(): Promise<any> {
    try {
      const response = await this.aiClient.get('/api/ai/models/ollama');
      return response.data;
    } catch (error) {
      return { models: [], error: error.message };
    }
  }

  private handleError(error: any, context: string): never {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || error.message;
      throw new HttpException(
        `${context}: ${message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    throw new HttpException(
      `${context}: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
