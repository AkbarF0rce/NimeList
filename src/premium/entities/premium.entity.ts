import { Transaction } from 'src/transaction/entities/transaction.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum badges {
  YEARLY_CHAMPION = 'yearly champion',
  SIX_MONTH_CHAMPION = 'six-month champion',
  ONE_MONTH_HERO = 'one-month hero',
  NO_BADGE = 'no badge',
}

@Entity()
export class Premium {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('int')
  price: number;

  @Column({ type: 'enum', enum: badges })
  badge: badges;

  @Column('decimal', { precision: 10, scale: 2 })
  duration: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.premium)
  transactions: Transaction[];
}
