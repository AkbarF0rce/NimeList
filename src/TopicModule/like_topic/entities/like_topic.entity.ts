import { Topic } from 'src/TopicModule/topic/entities/topic.entity';
import { User } from 'src/UserModule/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['id_topic', 'id_user'])
export class LikeTopic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  id_topic: string;

  @Column()
  id_user: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Topic, (topic) => topic.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_topic' })
  topic: Topic;

  @ManyToOne(() => User, (user) => user.likes_topic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user: User;
}
