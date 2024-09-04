import { LikeComment } from 'src/like_comment/entities/like_comment.entity';
import { Topic } from 'src/topic/entities/topic.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  id_topic: string;

  @Column('text')
  id_user: string;

  @Column('text')
  comment: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Topic, (topic) => topic.comments, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'id_topic' })
  topic: Topic;

  @OneToMany(() => LikeComment, (likeComment) => likeComment.comment)
  likes: LikeComment[];

  @ManyToOne(() => User, (user) => user.comments, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'id_user' })
  user: User;
}
