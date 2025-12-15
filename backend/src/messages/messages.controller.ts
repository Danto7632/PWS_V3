import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/message.dto';
import { Message } from './entities/message.entity';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: '대화의 메시지 목록 조회' })
  @ApiResponse({ status: 200, description: '메시지 목록 반환' })
  async findByConversation(
    @Param('conversationId') conversationId: string,
  ): Promise<Message[]> {
    return this.messagesService.findByConversation(conversationId);
  }

  @Post()
  @ApiOperation({ summary: '새 메시지 생성' })
  @ApiResponse({ status: 201, description: '메시지 생성됨' })
  async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messagesService.create(createMessageDto);
  }

  @Post('batch')
  @ApiOperation({ summary: '여러 메시지 일괄 생성' })
  @ApiResponse({ status: 201, description: '메시지들 생성됨' })
  async createMany(@Body() createMessageDtos: CreateMessageDto[]): Promise<Message[]> {
    return this.messagesService.createMany(createMessageDtos);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '메시지 삭제' })
  @ApiResponse({ status: 204, description: '메시지 삭제됨' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.messagesService.remove(id);
  }
}
