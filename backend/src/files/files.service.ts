import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectFile } from './entities/project-file.entity';
import { CreateFileDto } from './dto/file.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(ProjectFile)
    private readonly fileRepository: Repository<ProjectFile>,
  ) {}

  async findByProject(projectId: string): Promise<ProjectFile[]> {
    return this.fileRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(createFileDto: CreateFileDto): Promise<ProjectFile> {
    const file = this.fileRepository.create(createFileDto);
    return this.fileRepository.save(file);
  }

  async createMany(files: CreateFileDto[]): Promise<ProjectFile[]> {
    const fileEntities = files.map((dto) => this.fileRepository.create(dto));
    return this.fileRepository.save(fileEntities);
  }

  async remove(id: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`파일을 찾을 수 없습니다: ${id}`);
    }
    await this.fileRepository.remove(file);
  }

  async removeByProject(projectId: string): Promise<void> {
    await this.fileRepository.delete({ projectId });
  }
}
