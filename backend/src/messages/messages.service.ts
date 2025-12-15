import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async findByConversation(conversationId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversationId },
      order: { timestamp: 'ASC' },
    });
  }

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);
    return this.messageRepository.save(message);
  }

  async createMany(messages: CreateMessageDto[]): Promise<Message[]> {
    const messageEntities = messages.map((dto) =>
      this.messageRepository.create(dto),
    );
    return this.messageRepository.save(messageEntities);
  }

  async remove(id: string): Promise<void> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`메시지를 찾을 수 없습니다: ${id}`);
    }
    await this.messageRepository.remove(message);
  }

  async removeByConversation(conversationId: string): Promise<void> {
    await this.messageRepository.delete({ conversationId });
  }
}
