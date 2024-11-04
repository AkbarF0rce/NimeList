import { Premium } from 'src/TransactionModule/premium/entities/premium.entity';
import { User } from 'src/UserModule/user/entities/user.entity';
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

export enum status {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

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

  @Column('enum', { enum: status, default: status.PENDING })
  status: status;

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
