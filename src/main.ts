import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Middleware untuk menyajikan file statis
  app.use('/images', express.static(join(__dirname, '..', 'images')));

  // Menggunakan global ValidationPipe untuk validasi DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Menghapus properti yang tidak diizinkan
      forbidNonWhitelisted: true, // Menolak request yang mengandung properti yang tidak diizinkan
      transform: true, // Mengubah payload ke tipe DTO secara otomatis
      exceptionFactory: (errors) => {
        const messages = errors.map((error) =>
          Object.values(error.constraints).join(', '),
        );
        return new BadRequestException(messages);
      },
    }),
  );

  app.enableCors({ origin: 'http://localhost:3000' });
  await app.listen(4321);
}
bootstrap();
