import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';
import { Genre } from 'src/genre/entities/genre.entity';
import { PhotoAnime } from 'src/photo_anime/entities/photo_anime.entity';
import { Review } from 'src/reviews/reviews.entity';
import { Topic } from 'src/topic/entities/topic.entity';

@Entity()
export class Anime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 255 })
  title: string;

  @Column("text")
  synopsis: string;

  @Column("varchar", { length: 10 })
  release_date: string;

  @Column('text')
  photo_cover: string;

  @Column('text')
  trailer_link: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToMany(() => Genre, (genre) => genre.animes, { cascade: true })
  @JoinTable({ name: 'anime_genre' })
  genres: Genre[];

  @OneToMany(() => PhotoAnime, (photo) => photo.anime, { cascade: true })
  photos: PhotoAnime[];

  @OneToMany(() => Review, (review) => review.anime, { cascade: true })
  review: Review[];

  @OneToMany(() => Topic, (topic) => topic.anime, { cascade: true })
  topic: Topic;
}
