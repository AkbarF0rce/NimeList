import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';
import { Anime } from 'src/anime/entities/anime.entity';

@Entity()
export class PhotoAnime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  file_path: string;

  @Column("integer")
  id_anime: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Anime, (anime) => anime.photos, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'id_anime' })
  anime: Anime;
}
