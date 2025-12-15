import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: '프로젝트 이름' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '프로젝트 카테고리' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '프로젝트 가이드라인 (지침)' })
  @IsOptional()
  @IsString()
  guidelines?: string;

  @ApiPropertyOptional({ description: '업데이 학습 수준 (0-100)', default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  uploadPercentage?: number;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ description: '프로젝트 이름' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '프로젝트 카테고리' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '프로젝트 가이드라인 (지침)' })
  @IsOptional()
  @IsString()
  guidelines?: string;

  @ApiPropertyOptional({ description: '업데이 학습 수준 (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  uploadPercentage?: number;

  @ApiPropertyOptional({ description: '확장 여부' })
  @IsOptional()
  @IsBoolean()
  isExpanded?: boolean;
}
