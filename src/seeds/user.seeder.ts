// src/seeds/user.seeder.ts
import { Injectable } from '@nestjs/common';
import { Seeder } from './seeder.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { status_premium, User } from 'src/AuthModule/user/entities/user.entity';
import { Role } from 'src/AuthModule/role/entities/role.entity';
import { v4 } from 'uuid';

@Injectable()
export class UserSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async run(): Promise<void> {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('UserSeeder: Akun admin sudah ada.');
      return;
    }

    // Cari peran 'Admin'
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
    });
    if (!adminRole) {
      console.log(
        'UserSeeder: Peran Admin tidak ditemukan. Pastikan RoleSeeder sudah dijalankan.',
      );
      return;
    }

    const adminUser = this.userRepository.create({
      username: 'Barr77',
      email: adminEmail,
      password: 'admin#1234',
      role: adminRole,
      status_premium: status_premium.ACTIVE,
      salt: v4(),
    });

    await this.userRepository.save(adminUser);
    console.log('UserSeeder: Akun admin berhasil dibuat.');
  }
}
