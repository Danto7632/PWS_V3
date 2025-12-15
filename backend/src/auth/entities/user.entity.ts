import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  refreshToken: string;

  // 사용자 설정
  @Column({ type: 'simple-json', nullable: true })
  apiKeys: {
    gpt: string;
    gemini: string;
    claude: string;
    perplexity: string;
    ollama: string;
  };

  @Column({ type: 'simple-json', nullable: true })
  enabledModels: string[];

  @Column({ nullable: true })
  selectedModel: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];
}
