import { Comment } from 'src/TopicModule/comment/entities/comment.entity';
import { User } from 'src/AuthModule/user/entities/user.entity';
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
@Unique(['id_comment', 'id_user'])
export class LikeComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  id_comment: string;

  @Column()
  id_user: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_comment' })
  comment: Comment;

  @ManyToOne(() => User, (user) => user.likes_comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user: User;
}
