import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/AuthModule/user/dto/create-user.dto';
import { UserService } from 'src/AuthModule/user/user.service';
import { status } from 'src/TransactionModule/transaction/entities/transaction.entity';

@Injectable()
export class AuthService {
  private blacklistedTokens: Set<string> = new Set();
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService, // Uncomment this when you implement UsersService
  ) {}

  // This would be connected to your UsersService or database query
  async validateUser(username: string, password: string): Promise<any> {
    // Fetch user from your UsersService or database
    const user = await this.usersService.findOneByUsername(username); // Implement this method to fetch user

    if (user && (await bcrypt.compareSync(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Method for signing JWT
  async login(user: any) {
    const payload = {
      username: user.username,
      email: user.email,
      userId: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  generateAccessToken(
    userId: string,
    role: string,
    username: string,
    email: string,
  ) {
    const payload = { userId, username, role, email };
    return this.jwtService.sign(payload);
  }

  async validateRefreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret:
          'baec005e5d355ac15e6aba7a6d1fcd00316be94faf502b50638161a76046e86b600cdd950fd1b5420c6cfb2d3bf442f1a256ab40e5ae4e4f96aa60bef08c7eba',
      });
      return payload;
    } catch (error) {
      return null;
    }
  }

  // Method for signing JWT
  async register(user: CreateUserDto) {
    const register = await this.usersService.create(user);
    const payload = {
      username: register.username,
      userId: register.id,
      role: register.role,
      email: register.email,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(token: string) {
    const blacklisted = this.blacklistedTokens.add(token); // Tambahkan token ke daftar hitam
    if (!blacklisted) {
      return { message: 'Failed to logout', status: 500 };
    }
    return { message: 'Successfully logged out', status: 200 };
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
}
