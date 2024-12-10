// src/seeds/seeder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleSeeder } from './role.seeder';
import { SeederService } from './seeder.service';
import { Role } from 'src/UserModule/role/entities/role.entity';
import { RoleModule } from 'src/UserModule/role/role.module';
import { User } from 'src/UserModule/user/entities/user.entity';
import { UserModule } from 'src/UserModule/user/user.module';
import { UserSeeder } from './user.seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/../**/*.entity.{js,ts}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Role, User]),
    RoleModule,
    UserModule,
  ],
  providers: [RoleSeeder, SeederService, UserSeeder],
  exports: [SeederService],
})
export class SeederModule {}
