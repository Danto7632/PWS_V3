import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ description: '대화 제목' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '미리보기 텍스트' })
  @IsOptional()
  @IsString()
  preview?: string;

  @ApiProperty({ description: '역할', enum: ['customer', 'employee'] })
  @IsIn(['customer', 'employee'])
  role: 'customer' | 'employee';

  @ApiProperty({ description: '프로젝트 ID' })
  @IsString()
  projectId: string;
}

export class UpdateConversationDto {
  @ApiPropertyOptional({ description: '대화 제목' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '미리보기 텍스트' })
  @IsOptional()
  @IsString()
  preview?: string;
}
