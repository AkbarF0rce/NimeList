import { Injectable } from '@nestjs/common';
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
  ) {}

  // Fungsi untuk validasi user
  async validateUser(username: string, password: string): Promise<any> {
    // Mencari user berdasarkan username
    const user = await this.usersService.findOneByUsername(username);

    if (user && (await bcrypt.compareSync(password, user.password))) {
      const { password, ...result } = user;
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
    };

    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  // Fungsi untuk register
  async register(user: CreateUserDto) {
    const register = await this.usersService.create(user);
    const payload = {
      username: register.username,
      userId: register.id,
      role: register.role,
      email: register.email,
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

  async generateResetToken(): Promise<string> {
    // Generate 6 digit random numeric token
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 angka
  }

  async hashToken(token: string): Promise<string> {
    // Hash the token for secure storage
    const saltRounds = 10;
    return bcrypt.hash(token, saltRounds);
  }

  async validateToken(token: string, hashedToken: string): Promise<boolean> {
    // Compare token input dengan hash yang disimpan
    return bcrypt.compare(token, hashedToken);
  }

  async generateTokenResetPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    const token = await this.generateResetToken();
    const hashedToken = await this.hashToken(token);

    await this.usersService.updateResetToken(user.id, hashedToken);

    return { message: 'Reset token sent to email' };
  }
}
