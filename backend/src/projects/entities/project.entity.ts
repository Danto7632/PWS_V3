import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Conversation } from '../../conversations/entities/conversation.entity';
import { ProjectFile } from '../../files/entities/project-file.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  guidelines: string;

  @Column({ default: 100 })
  uploadPercentage: number;

  @Column({ default: true })
  isExpanded: boolean;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.projects, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Conversation, (conversation) => conversation.project, {
    cascade: true,
  })
  conversations: Conversation[];

  @OneToMany(() => ProjectFile, (file) => file.project, {
    cascade: true,
  })
  files: ProjectFile[];
}
