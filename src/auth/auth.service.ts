import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// Import your UsersService or appropriate repository here
// import { UsersService } from 'path-to-users-service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    // private readonly usersService: UsersService, // Uncomment this when you implement UsersService
  ) {}

  // This would be connected to your UsersService or database query
  async validateUser(username: string, pass: string): Promise<any> {
    // Fetch user from your UsersService or database
    const user = await this.findUserByUsername(username); // Implement this method to fetch user

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Method for signing JWT
  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Example of a method to find a user by username
  private async findUserByUsername(username: string) {
    // Implement your logic to fetch the user from the database
    // This is a placeholder example, replace it with actual DB call
    const user = {
      id: 1,
      username: 'testuser',
      password: await bcrypt.hash('password', 10), // This should not be in the find method
      role: 'user',
    };
    return username === user.username ? user : null;
  }
}
