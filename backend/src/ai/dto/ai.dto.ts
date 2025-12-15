import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsArray } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({ description: '메시지 내용' })
  @IsString()
  message: string;

  @ApiProperty({ description: '프로젝트 ID' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: '대화 ID' })
  @IsString()
  conversationId: string;

  @ApiProperty({ description: '역할 (customer | employee)' })
  @IsString()
  role: string;

  @ApiPropertyOptional({ description: '모델 ID' })
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiPropertyOptional({ description: 'API 키들' })
  @IsOptional()
  @IsObject()
  apiKeys?: Record<string, string>;

  @ApiPropertyOptional({ description: '프로젝트 지침' })
  @IsOptional()
  @IsString()
  guidelines?: string;

  @ApiPropertyOptional({ description: '대화 히스토리' })
  @IsOptional()
  @IsArray()
  conversationHistory?: Array<{ role: string; content: string }>;

  @ApiPropertyOptional({ description: '사용자 ID (로그인 시)' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class ScenarioRequestDto {
  @ApiProperty({ description: '프로젝트 ID' })
  @IsString()
  projectId: string;

  @ApiPropertyOptional({ description: '모델 ID' })
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiPropertyOptional({ description: 'API 키들' })
  @IsOptional()
  @IsObject()
  apiKeys?: Record<string, string>;

  @ApiPropertyOptional({ description: '프로젝트 지침' })
  @IsOptional()
  @IsString()
  guidelines?: string;

  @ApiPropertyOptional({ description: '사용자 ID (로그인 시)' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class UploadFileDto {
  @ApiProperty({ description: '프로젝트 ID' })
  @IsString()
  projectId: string;

  @ApiPropertyOptional({ description: '임베딩 비율 (20-100)' })
  @IsOptional()
  @IsNumber()
  embedPercentage?: number;

  @ApiPropertyOptional({ description: '사용자 ID (로그인 시)' })
  @IsOptional()
  @IsString()
  userId?: string;
}
