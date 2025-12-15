import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import {
  CreateConversationDto,
  UpdateConversationDto,
} from './dto/conversation.dto';
import { Conversation } from './entities/conversation.entity';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @ApiOperation({ summary: '대화 목록 조회' })
  @ApiQuery({ name: 'projectId', required: false, description: '프로젝트 ID로 필터링' })
  @ApiResponse({ status: 200, description: '대화 목록 반환' })
  async findAll(@Query('projectId') projectId?: string): Promise<Conversation[]> {
    return this.conversationsService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 대화 조회' })
  @ApiResponse({ status: 200, description: '대화 정보 반환' })
  @ApiResponse({ status: 404, description: '대화를 찾을 수 없음' })
  async findOne(@Param('id') id: string): Promise<Conversation> {
    return this.conversationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '새 대화 생성' })
  @ApiResponse({ status: 201, description: '대화 생성됨' })
  async create(
    @Body() createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    return this.conversationsService.create(createConversationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '대화 수정' })
  @ApiResponse({ status: 200, description: '대화 수정됨' })
  @ApiResponse({ status: 404, description: '대화를 찾을 수 없음' })
  async update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation> {
    return this.conversationsService.update(id, updateConversationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '대화 삭제' })
  @ApiResponse({ status: 204, description: '대화 삭제됨' })
  @ApiResponse({ status: 404, description: '대화를 찾을 수 없음' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.conversationsService.remove(id);
  }
}
