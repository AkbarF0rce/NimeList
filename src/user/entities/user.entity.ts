import { Role } from 'src/role/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum status_premium {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum badges {
  YEARLY_CHAMPION = 'yearly champion',
  SIX_MONTH_CHAMPION = 'six-month champion',
  ONE_MONTH_HERO = 'one-month hero',
  NO_BADGE = 'no badge',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  id_role: string;

  @Column('uuid')
  salt: string;

  @Column('text')
  bio: string;

  @Column('varchar', { length: 255, unique: true })
  username: string;

  @Column('varchar', { length: 255 })
  password: string;

  @Column('enum', { enum: status_premium, default: status_premium.INACTIVE })
  status_premium: status_premium;

  @Column('enum', { enum: badges, default: badges.NO_BADGE })
  badge: badges;

  @Column('timestamp', { nullable: true, default: null })
  start_premium: Date;

  @Column('timestamp', { nullable: true, default: null })
  end_premium: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'id_role' })
  role: Role;
}
