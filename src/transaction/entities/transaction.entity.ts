import { Premium } from 'src/premium/entities/premium.entity';
import { User } from 'src/user/entities/user.entity';
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
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  payment_platform: string;

  @Column('text', { unique: true })
  order_id: string;

  @Column('text')
  id_user: string;

  @Column('text')
  id_premium: string;

  @Column('int')
  total: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @ManyToOne(() => Premium, (premium) => premium.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_premium' })
  premium: Premium;
}
