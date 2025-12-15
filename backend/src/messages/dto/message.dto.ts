import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: '역할', enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @ApiProperty({ description: '메시지 내용' })
  @IsString()
  content: string;

  @ApiProperty({ description: '대화 ID' })
  @IsString()
  conversationId: string;
}
