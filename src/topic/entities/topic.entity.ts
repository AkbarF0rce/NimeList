import { title } from "process";
import { Anime } from "src/anime/entities/anime.entity";
import { LikeTopic } from "src/like_topic/entities/like_topic.entity";
import { PhotoTopic } from "src/photo_topic/entities/photo_topic.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UUID } from "typeorm/driver/mongodb/bson.typings";

@Entity()
export class Topic {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", {length: 255})
    title: string;

    @Column('text')
    body: string;

    @Column('integer')
    id_anime: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @ManyToOne(() => Anime, (anime) => anime.topic, {onUpdate: "CASCADE"})
    @JoinColumn({name: "id_anime"})
    anime: Anime;

    @OneToMany(() => PhotoTopic, (photo) => photo.topic, {cascade: true})
    photos: PhotoTopic[];

    @OneToMany(() => LikeTopic, (like) => like.topic, {cascade: true})
    likes: LikeTopic[];
}
