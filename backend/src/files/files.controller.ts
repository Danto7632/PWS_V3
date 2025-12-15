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
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/file.dto';
import { ProjectFile } from './entities/project-file.entity';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: '프로젝트의 파일 목록 조회' })
  @ApiResponse({ status: 200, description: '파일 목록 반환' })
  async findByProject(
    @Param('projectId') projectId: string,
  ): Promise<ProjectFile[]> {
    return this.filesService.findByProject(projectId);
  }

  @Post()
  @ApiOperation({ summary: '파일 메타데이터 저장' })
  @ApiResponse({ status: 201, description: '파일 메타데이터 저장됨' })
  async create(@Body() createFileDto: CreateFileDto): Promise<ProjectFile> {
    return this.filesService.create(createFileDto);
  }

  @Post('batch')
  @ApiOperation({ summary: '여러 파일 메타데이터 일괄 저장' })
  @ApiResponse({ status: 201, description: '파일 메타데이터들 저장됨' })
  async createMany(@Body() createFileDtos: CreateFileDto[]): Promise<ProjectFile[]> {
    return this.filesService.createMany(createFileDtos);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '파일 메타데이터 삭제' })
  @ApiResponse({ status: 204, description: '파일 메타데이터 삭제됨' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.filesService.remove(id);
  }
}
