// src/seeds/seeder.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleSeeder } from './role.seeder';
// Import seeder lain jika ada

@Injectable()
export class SeederService {
  constructor(
    private readonly roleSeeder: RoleSeeder,
    // Inject seeder lain jika ada
  ) {}

  async seed() {
    await this.runSeeder(
      'RoleSeeder',
      this.roleSeeder.run.bind(this.roleSeeder),
    );
    // Tambahkan seeder lain di sini jika diperlukan
  }

  private async runSeeder(name: string, seederFunction: () => Promise<void>) {
    await seederFunction();

    console.log(`${name}: Seeder berhasil dijalankan dan ditandai.`);
  }
}
