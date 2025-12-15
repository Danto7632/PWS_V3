import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { Project } from './entities/project.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '모든 프로젝트 조회 (로그인시 본인 프로젝트만)' })
  @ApiResponse({ status: 200, description: '프로젝트 목록 반환' })
  @ApiBearerAuth()
  async findAll(@Request() req): Promise<Project[]> {
    const userId = req.user?.id;
    return this.projectsService.findAll(userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '특정 프로젝트 조회' })
  @ApiResponse({ status: 200, description: '프로젝트 정보 반환' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없음' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string, @Request() req): Promise<Project> {
    const userId = req.user?.id;
    return this.projectsService.findOne(id, userId);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: '새 프로젝트 생성' })
  @ApiResponse({ status: 201, description: '프로젝트 생성됨' })
  @ApiBearerAuth()
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req): Promise<Project> {
    const userId = req.user?.id;
    return this.projectsService.create(createProjectDto, userId);
  }

  @Put(':id')
  @Public()
  @ApiOperation({ summary: '프로젝트 수정' })
  @ApiResponse({ status: 200, description: '프로젝트 수정됨' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없음' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ): Promise<Project> {
    const userId = req.user?.id;
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '프로젝트 삭제' })
  @ApiResponse({ status: 204, description: '프로젝트 삭제됨' })
  @ApiResponse({ status: 404, description: '프로젝트를 찾을 수 없음' })
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    const userId = req.user?.id;
    return this.projectsService.remove(id, userId);
  }

  @Post('migrate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '비회원 프로젝트를 회원 계정으로 이전' })
  @ApiResponse({ status: 200, description: '프로젝트 이전 완료' })
  @ApiBearerAuth()
  async migrateToUser(@Body() body: { projectIds: string[] }, @Request() req): Promise<{ message: string }> {
    await this.projectsService.migrateToUser(body.projectIds, req.user.id);
    return { message: '프로젝트가 성공적으로 이전되었습니다.' };
  }
}
