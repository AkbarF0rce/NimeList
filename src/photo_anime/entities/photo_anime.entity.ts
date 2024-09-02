import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';
import { Anime } from 'src/anime/entities/anime.entity';

@Entity()
export class PhotoAnime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  file_path: string;

  @Column("text")
  id_anime: string;

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
