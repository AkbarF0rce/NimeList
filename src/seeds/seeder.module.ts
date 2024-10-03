// src/seeds/seeder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleSeeder } from './role.seeder';
import { SeederService } from './seeder.service';
import { Role } from 'src/role/entities/role.entity';
import { RoleModule } from 'src/role/role.module';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserSeeder } from './user.seeder';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'nimelist',
      entities: [__dirname + '/../**/*.entity.{js,ts}'],
    }),
    TypeOrmModule.forFeature([Role, User]),
    RoleModule,
    UserModule,
    // Impor modul lain yang diperlukan oleh seeder
  ],
  providers: [RoleSeeder, SeederService, UserSeeder],
  exports: [SeederService],
})
export class SeederModule {}
