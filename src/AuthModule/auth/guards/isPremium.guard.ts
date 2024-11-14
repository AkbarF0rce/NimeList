import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
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
      const premium = await this.userService.getCheckPremium(payload.userId);

      if (premium.status !== 200) {
        throw new ForbiddenException(
          'Akses ini hanya tersedia untuk pengguna berlangganan.',
        );
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token tidak valid.');
    }
  }
}
