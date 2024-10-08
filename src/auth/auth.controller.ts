import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Route for user registration
  @Post('register')
  async register(
    @Body() body: { username: string; password: string; email: string },
  ) {
    try {
      const { username, password, email } = body;
      return this.authService.register(username, password, email);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Existing login route with LocalAuthGuard
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    console.log('Login attempt:', body); // Log the login attempt
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}
