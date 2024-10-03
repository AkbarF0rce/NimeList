// src/seeds/seeder.service.ts
import { Injectable } from '@nestjs/common';
import { RoleSeeder } from './role.seeder';
import { UserSeeder } from './user.seeder';
// Import seeder lain jika ada

@Injectable()
export class SeederService {
  constructor(
    private readonly roleSeeder: RoleSeeder,
    private readonly userSeeder: UserSeeder,
    // Inject seeder lain jika ada
  ) {}

  async seed() {
    await this.runSeeder(
      'RoleSeeder',
      this.roleSeeder.run.bind(this.roleSeeder),
    );
    await this.runSeeder(
      'UserSeeder',
      this.userSeeder.run.bind(this.userSeeder),
    );
    // Tambahkan seeder lain di sini jika diperlukan
  }

  private async runSeeder(name: string, seederFunction: () => Promise<void>) {
    await seederFunction();

    console.log(`${name}: Seeder berhasil dijalankan dan ditandai.`);
  }
}
