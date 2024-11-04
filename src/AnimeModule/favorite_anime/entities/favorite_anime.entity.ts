import { Anime } from 'src/AnimeModule/anime/entities/anime.entity';
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
@Unique(['id_anime', 'id_user'])
export class FavoriteAnime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  id_anime: string;

  @Column('text')
  id_user: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Anime, (anime) => anime.favorite, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_anime' })
  anime: Anime;

  @ManyToOne(() => User, (user) => user.favorite_anime, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user: User;
}
