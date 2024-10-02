import { Topic } from 'src/topic/entities/topic.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PhotoTopic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  file_path: string;

  @Column('text')
  id_topic: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Topic, (topic) => topic.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_topic' })
  topic: Topic;
}
