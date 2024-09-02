import { Anime } from 'src/anime/entities/anime.entity';
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
export class FavoriteAnime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  id_anime: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Anime, (anime) => anime.favorite, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'id_anime' })
  anime: Anime;
}
