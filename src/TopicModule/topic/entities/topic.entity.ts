import { title } from 'process';
import { Anime } from 'src/AnimeModule/anime/entities/anime.entity';
import { Comment } from 'src/TopicModule/comment/entities/comment.entity';
import { LikeTopic } from 'src/TopicModule/like_topic/entities/like_topic.entity';
import { PhotoTopic } from 'src/TopicModule/photo_topic/entities/photo_topic.entity';
import { User } from 'src/UserModule/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('text')
  body: string;

  @Column('text')
  id_anime: string;

  @Column('text')
  id_user: string;

  @Column('text', { unique: true })
  slug: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Anime, (anime) => anime.topic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_anime' })
  anime: Anime;

  @ManyToOne(() => User, (user) => user.topics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @OneToMany(() => PhotoTopic, (photo) => photo.topic)
  photos: PhotoTopic[];

  @OneToMany(() => LikeTopic, (like) => like.topic)
  likes: LikeTopic[];

  @OneToMany(() => Comment, (comment) => comment.topic)
  comments: Comment[];
}
