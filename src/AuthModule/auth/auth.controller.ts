import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from 'src/UserModule/user/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post('register')
  async signup(@Body() user: CreateUserDto) {
    return this.authService.register(user);
  }

  @Post('refresh-token')
  async refreshAccessToken(@Body('token') token: string) {
    return this.authService.refreshToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body('token') token: string) {
    return this.authService.logout(token);
  }

  @Post('generate-token-reset-password')
  async generateTokenResetPassword(@Body('email') email: string) {
    return this.authService.generateTokenResetPassword(email);
  }
}
