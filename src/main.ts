import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Middleware untuk menyajikan file statis
  app.use('/images', express.static(join(__dirname, '..', 'images')));

  app.enableCors({ origin: 'http://localhost:3000' });
  await app.listen(4321);
}
bootstrap();
