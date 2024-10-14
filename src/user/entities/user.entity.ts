import { Role } from 'src/role/entities/role.entity';
import {
  BeforeInsert,
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
import * as bcrypt from 'bcrypt';
import { LikeComment } from 'src/like_comment/entities/like_comment.entity';
import { Topic } from 'src/topic/entities/topic.entity';
import { LikeTopic } from 'src/like_topic/entities/like_topic.entity';
import { FavoriteAnime } from 'src/favorite_anime/entities/favorite_anime.entity';
import { Review } from 'src/review/entities/review.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';

export enum status_premium {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum badges {
  YEARLY_CHAMPION = 'yearly champion',
  SIX_MONTH_CHAMPION = 'six-month champion',
  ONE_MONTH_HERO = 'one-month hero',
  NO_BADGE = 'no badge',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  id_role: string;

  @Column('varchar', { length: 255, unique: true })
  username: string;

  @Column('text', { unique: true })
  password: string;

  @Column('varchar', { length: 255, unique: true })
  email: string;

  @Column('uuid')
  salt: string;

  @Column('text', { nullable: true, default: null })
  bio: string;

  @Column('enum', { enum: status_premium, default: status_premium.INACTIVE })
  status_premium: status_premium;

  @Column('enum', { enum: badges, default: badges.NO_BADGE })
  badge: badges;

  @Column('timestamp', { nullable: true, default: null })
  start_premium: Date;

  @Column('timestamp', { nullable: true, default: null })
  end_premium: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'id_role' })
  role: Role;

  @OneToMany(() => LikeComment, (like_comment) => like_comment.user)
  likes_comment: LikeComment[];

  @OneToMany(() => Topic, (topic) => topic.user)
  topics: Topic[];

  @OneToMany(() => LikeTopic, (like_topic) => like_topic.user)
  likes_topic: LikeTopic[];

  @OneToMany(() => FavoriteAnime, (favorite_anime) => favorite_anime.user)
  favorite_anime: FavoriteAnime[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
