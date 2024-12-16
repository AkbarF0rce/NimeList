import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/UserModule/user/user.service';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // Check status premium dari userId yang ada di payload
      return await this.userService.checkPremium(payload.userId);
    } catch (error) {
      throw error instanceof BadRequestException
        ? error
        : new UnauthorizedException('Token tidak valid.');
    }
  }
}
