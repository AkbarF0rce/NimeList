import { Topic } from "src/topic/entities/topic.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('integer')
    id_topic: number;

    @Column('text')
    comment: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @ManyToOne(() => Topic, topic => topic.comments)
    @JoinColumn({ name: 'id_topic' })
    topic: Topic;
}