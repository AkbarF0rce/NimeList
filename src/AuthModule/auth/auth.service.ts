import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/UserModule/user/dto/create-user.dto';
import { UserService } from 'src/UserModule/user/user.service';

@Injectable()
export class AuthService {
  private blacklistedTokens: Set<string> = new Set();
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService, // Uncomment this when you implement UsersService
    private readonly configService: ConfigService,
  ) {}

  // Fungsi untuk validasi user
  async validateUser(username: string, password: string): Promise<any> {
    // Mencari user berdasarkan username
    const user = await this.usersService.findOneByUsername(username);

    if (user && (await bcrypt.compareSync(password, user.password))) {
      const { password, ...result } = user;
      console.log(result);
      return result;
    }
    return null;
  }

  // Fungsi untuk login
  async login(user: any) {
    const payload = {
      username: user.username,
      email: user.email,
      userId: user.id,
      role: user.role,
      name: user.name
    };
    return this.generateToken(payload);
  }

  // Fungsi untuk generate token
  generateToken(user: any) {
    const payload = {
      userId: user.userId,
      username: user.username,
      role: user.role,
      email: user.email,
      name: user.name
    };

    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  async refreshToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
      ignoreExpiration: true,
    });

    return this.generateToken(payload);
  }

  // Fungsi untuk register
  async register(user: CreateUserDto) {
    const register = await this.usersService.create(user);
    const payload = {
      username: register.username,
      userId: register.id,
      role: register.role,
      email: register.email,
      name: register.name
    };
    return this.generateToken(payload);
  }

  async logout(token: string) {
    const blacklisted = this.blacklistedTokens.add(token); // Tambahkan token ke daftar hitam
    return { message: 'Successfully logged out', status: 200 };
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
}
