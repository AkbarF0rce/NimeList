import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/UserModule/user/user.service';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
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
