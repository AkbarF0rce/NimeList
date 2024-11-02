// admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1]; // Ambil token dari header Authorization

    if (!token) {
      throw new ForbiddenException('Access token is required');
    }

    try {
      const decodedToken = this.jwtService.verify(token); // Verifikasi token
      const userRole = decodedToken.role; // Ambil role dari token

      if (userRole !== 'admin') {
        throw new ForbiddenException('Only admin can access this route');
      }

      return true; // Jika role admin, izinkan akses
    } catch (error) {
      throw new ForbiddenException('Invalid token');
    }
  }
}
