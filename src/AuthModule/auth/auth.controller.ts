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
  async refreshAccessToken(
    @Body('refreshToken') refreshToken: string,
    @Body('data_user')
    data_user: {
      userId: string;
      role: string;
      username: string;
      email: string;
    },
  ) {
    const payload: {
      userId: string;
      role: string;
      username: string;
      email: string;
    } = await this.authService.validateRefreshToken(refreshToken);

    const { userId, role, username, email } = data_user;

    if (!payload) {
      const newAccessToken = this.authService.generateAccessToken(
        userId,
        role,
        username,
        email,
      );

      return { accessToken: newAccessToken };
    }

    const newAccessToken = this.authService.generateAccessToken(
      payload.userId,
      payload.role,
      payload.username,
      payload.email,
    );
    return { accessToken: newAccessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body('token') token: string) {
    return this.authService.logout(token);
  }
}
