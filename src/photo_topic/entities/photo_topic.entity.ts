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
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  file_path: string;

  @Column('integer')
  id_topic: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Topic, (topic) => topic.photos, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'id_topic' })
  topic: Topic;
}
