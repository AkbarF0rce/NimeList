import { Transaction } from 'src/TransactionModule/transaction/entities/transaction.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum status_premium {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity()
export class Premium {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('int')
  price: number;

  @Column('enum', { enum: status_premium, default: status_premium.INACTIVE })
  status: status_premium;

  @Column('int')
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
