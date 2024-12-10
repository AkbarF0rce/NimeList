import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import './config/env.config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Middleware untuk melayani file statis dari image storage
  app.use('/images', express.static(join(process.env.IMAGE_STORAGE)));

  // Konfigurasi CORS untuk mengizinkan akses dari domain tertentu
  app.enableCors({
    origin: process.env.BASE_URL_FRONT_END,
    credentials: true,
  });

  // Menjalankan aplikasi di port 4321
  await app.listen(4321);
}
bootstrap();
