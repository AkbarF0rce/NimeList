import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UserModule } from 'src/UserModule/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PremiumGuard } from './guards/isPremium.guard';

@Module({
  imports: [
    PassportModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Impor ConfigModule untuk akses ConfigService
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Mengambil JWT_SECRET dari .env
        signOptions: { expiresIn: '20m' }, // Atur waktu kedaluwarsa token
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, PremiumGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
