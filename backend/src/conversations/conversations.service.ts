import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import {
  CreateConversationDto,
  UpdateConversationDto,
} from './dto/conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async findAll(projectId?: string): Promise<Conversation[]> {
    const where = projectId ? { projectId } : {};
    return this.conversationRepository.find({
      where,
      relations: ['messages'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new NotFoundException(`대화를 찾을 수 없습니다: ${id}`);
    }

    return conversation;
  }

  async findByProject(projectId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { projectId },
      relations: ['messages'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const conversation = this.conversationRepository.create(createConversationDto);
    return this.conversationRepository.save(conversation);
  }

  async update(
    id: string,
    updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.findOne(id);
    Object.assign(conversation, updateConversationDto);
    return this.conversationRepository.save(conversation);
  }

  async remove(id: string): Promise<void> {
    const conversation = await this.findOne(id);
    await this.conversationRepository.remove(conversation);
  }
}
