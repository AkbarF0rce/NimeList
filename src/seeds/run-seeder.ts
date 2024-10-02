// src/seeds/run-seeder.ts
import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function runSeeder() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  const seeder = app.get(SeederService);
  await seeder.seed();
  await app.close();
}

runSeeder()
  .then(() => {
    console.log('Seeding selesai.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding gagal:', error);
    process.exit(1);
  });
