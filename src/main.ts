import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import * as dotenv from 'dotenv';

dotenv.config(); // Memuat file .env ke dalam process.env

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Middleware untuk melayani file statis dari image storage
  app.use('/images', express.static(join(process.env.IMAGE_STORAGE)));

  // Konfigurasi CORS untuk mengizinkan akses dari domain tertentu
  app.enableCors({
    origin: process.env.BASE_URL_FRONT_END,
    credentials: true,
  });

  // Menjalankan aplikasi berdasarkan port di .env
  await app.listen(process.env.PORT_RUNNING);
}
bootstrap();
