// src/seeds/role.seeder.ts
import { Injectable } from '@nestjs/common';
import { Seeder } from './seeder.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class RoleSeeder implements Seeder {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async run(): Promise<void> {
    const count = await this.roleRepository.count();
    if (count > 0) {
      console.log('RoleSeeder: Data sudah diisi.');
      return;
    }

    const roles = [{ name: 'admin' }, { name: 'user' }];

    await this.roleRepository.save(roles);
    console.log('RoleSeeder: Data berhasil diisi.');
  }
}
