import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Menyajikan file statis dari folder 'images'
  app.useStaticAssets(join(__dirname, '..', 'images'));

  await app.listen(4321);
}
bootstrap();
