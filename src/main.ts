import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  // Middleware untuk melayani file statis dari folder "images"
  app.use('/images', express.static(join(__dirname, '..', 'images')));

  // Konfigurasi CORS untuk mengizinkan akses dari domain tertentu
  app.enableCors({
    origin: configService.get<string>('BASE_URL_FRONT_END'),
    credentials: true,
  });

  // Menjalankan aplikasi di port 4321
  await app.listen(4321);
}
bootstrap();
