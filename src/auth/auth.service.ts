import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
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
      sub: user.salt,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Method for signing JWT
  async register(user: CreateUserDto) {
    const register = await this.usersService.create(user);
    const payload = {
      username: register.username,
      sub: register.salt,
      role: register.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      payload,
    };
  }
}
