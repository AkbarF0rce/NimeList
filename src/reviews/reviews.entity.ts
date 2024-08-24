import { Anime } from "src/anime/entities/anime.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name: "review"})
export class Review {
    @PrimaryGeneratedColumn()
    id_review: number;

    @Column()
    rating: number;

    @Column('text')
    ulasan: string;

    @Column({name: "id_anime"})
    id_anime: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @ManyToOne(() => Anime, (anime) => anime.review, {onDelete: "CASCADE"})
    @JoinColumn({name: "id_anime"})
    anime: Anime;
}