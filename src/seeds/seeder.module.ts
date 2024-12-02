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
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Role, User]),
    RoleModule,
    UserModule,
  ],
  providers: [RoleSeeder, SeederService, UserSeeder],
  exports: [SeederService],
})
export class SeederModule {}
