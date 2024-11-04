import { User } from 'src/UserModule/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class PhotoProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  id_user: string;

  @Column('text')
  path_photo: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => User, (user) => user.photo_profile)
  @JoinColumn({ name: 'id_user' })
  user: User;
}
