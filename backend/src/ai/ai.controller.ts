import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatRequestDto, ScenarioRequestDto } from './dto/ai.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('AI')
@Controller('ai')
@Public() // AI 기능은 비회원도 사용 가능
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'AI 채팅 요청' })
  @ApiResponse({ status: 200, description: 'AI 응답 반환' })
  async chat(@Body() chatRequest: ChatRequestDto) {
    return this.aiService.chat(chatRequest);
  }

  @Post('scenario')
  @ApiOperation({ summary: '고객 시나리오 생성' })
  @ApiResponse({ status: 200, description: '시나리오 반환' })
  async generateScenario(@Body() scenarioRequest: ScenarioRequestDto) {
    return this.aiService.generateScenario(scenarioRequest);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '파일 업로드 및 임베딩' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        projectId: { type: 'string' },
        embedPercentage: { type: 'number' },
        userId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '파일 업로드 및 임베딩 완료' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('projectId') projectId: string,
    @Body('embedPercentage') embedPercentage?: number,
    @Body('userId') userId?: string,
  ) {
    return this.aiService.uploadFile(
      file,
      projectId,
      embedPercentage ? parseInt(embedPercentage.toString()) : 100,
      userId,
    );
  }

  @Post('search')
  @ApiOperation({ summary: 'RAG 검색' })
  @ApiResponse({ status: 200, description: '검색 결과 반환' })
  async search(
    @Body('query') query: string,
    @Body('projectId') projectId: string,
    @Body('topK') topK?: number,
    @Body('userId') userId?: string,
  ) {
    return this.aiService.search(query, projectId, topK || 3, userId);
  }

  @Delete('project/:projectId/files')
  @ApiOperation({ summary: '프로젝트 파일 삭제' })
  @ApiResponse({ status: 200, description: '파일 삭제 완료' })
  async deleteProjectFiles(@Param('projectId') projectId: string) {
    return this.aiService.deleteProjectFiles(projectId);
  }

  @Get('health')
  @ApiOperation({ summary: 'AI 서비스 상태 확인' })
  @ApiResponse({ status: 200, description: '서비스 상태 반환' })
  async healthCheck() {
    return this.aiService.healthCheck();
  }

  @Get('models/ollama')
  @ApiOperation({ summary: 'Ollama 모델 목록 조회' })
  @ApiResponse({ status: 200, description: '모델 목록 반환' })
  async getOllamaModels() {
    return this.aiService.getOllamaModels();
  }
}
