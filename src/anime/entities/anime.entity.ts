import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { Genre } from 'src/genre/entities/genre.entity';
import { PhotoAnime } from 'src/photo_anime/entities/photo_anime.entity';
import { Topic } from 'src/topic/entities/topic.entity';
import { FavoriteAnime } from 'src/favorite_anime/entities/favorite_anime.entity';
import { Review } from 'src/review/entities/review.entity';

export enum Types {
  MOVIE = 'movie',
  SERIES = 'series',
}

@Entity()
export class Anime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('text')
  synopsis: string;

  @Column('varchar', { length: 10 })
  release_date: string;

  @Column('integer')
  episodes: number;

  @Column('text')
  photo_cover: string;

  @Column('text')
  trailer_link: string;

  @Column('enum', { enum: Types })
  type: Types;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToMany(() => Genre, (genre) => genre.animes, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'anime_genre' })
  genres: Genre[];

  @OneToMany(() => PhotoAnime, (photo) => photo.anime)
  photos: PhotoAnime[];

  @OneToMany(() => Review, (review) => review.anime)
  review: Review[];

  @OneToMany(() => Topic, (topic) => topic.anime)
  topic: Topic;

  @OneToMany(() => FavoriteAnime, (favorite) => favorite.anime)
  favorite: FavoriteAnime[];
}
