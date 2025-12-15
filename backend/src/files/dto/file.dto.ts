import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({ description: '파일 이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '파일 타입' })
  @IsString()
  type: string;

  @ApiProperty({ description: '파일 크기' })
  @IsNumber()
  size: number;

  @ApiProperty({ description: '프로젝트 ID' })
  @IsString()
  projectId: string;

  @ApiPropertyOptional({ description: '임베딩 파일 ID' })
  @IsOptional()
  @IsString()
  embeddingFileId?: string;
}
