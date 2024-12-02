import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/UserModule/user/dto/create-user.dto';
import { UserService } from 'src/UserModule/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
    private readonly configService: ConfigService,
  ) {}

  // Fungsi untuk validasi user
  async validateUser(email: string, password: string): Promise<any> {
    // Mencari user berdasarkan email
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compareSync(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    throw new BadRequestException('Invalid password');
  }

  // Fungsi untuk login
  async login(user: any) {
    const payload = {
      username: user.username,
      email: user.email,
      userId: user.id,
      role: user.role,
      name: user.name,
    };

    throw new HttpException(this.generateToken(payload), 200);
  }

  // Fungsi untuk generate token
  generateToken(user: any) {
    const payload = {
      userId: user.userId,
      username: user.username,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  // Fungsi untuk refresh token
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
      name: register.name,
    };
    return this.generateToken(payload);
  }
}
