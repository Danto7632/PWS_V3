import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(userId?: string): Promise<Project[]> {
    const whereCondition = userId ? { userId } : { userId: IsNull() };
    
    return this.projectRepository.find({
      where: whereCondition,
      relations: ['conversations', 'files'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['conversations', 'conversations.messages', 'files'],
    });

    if (!project) {
      throw new NotFoundException(`프로젝트를 찾을 수 없습니다: ${id}`);
    }

    // 로그인한 사용자의 프로젝트만 접근 가능
    if (userId && project.userId && project.userId !== userId) {
      throw new ForbiddenException('이 프로젝트에 접근할 권한이 없습니다.');
    }

    return project;
  }

  async create(createProjectDto: CreateProjectDto, userId?: string): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      isExpanded: true,
      userId: userId || null,
    });
    return this.projectRepository.save(project);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId?: string): Promise<Project> {
    const project = await this.findOne(id, userId);
    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const project = await this.findOne(id, userId);
    await this.projectRepository.remove(project);
  }

  // 비회원 프로젝트를 회원 프로젝트로 이전
  async migrateToUser(projectIds: string[], userId: string): Promise<void> {
    await this.projectRepository
      .createQueryBuilder()
      .update(Project)
      .set({ userId })
      .where('id IN (:...ids)', { ids: projectIds })
      .andWhere('userId IS NULL')
      .execute();
  }
}
