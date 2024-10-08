import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { v4 } from 'uuid';
import { status_premium, User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // Method for registering new users
  async register(username: string, password: string, email: string, role = 'user') {
    // Check if the user already exists
    const existingUsers = await this.userService.getUsers();
    const userExists = existingUsers.some((user) => user.username === username || user.email === email);
    
    if (userExists) {
      throw new Error('User already exists');
    }
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the role exists
    const roleExists = await this.roleRepository.findOneBy({ name: role });
  
    // Prepare the CreateUserDto object
    const newUserDto = this.userRepository.create({
      username,
      password: hashedPassword,
      email,
      role: roleExists,
    })
  
    // Create the new user using UserService
    const newUser = await this.userService.create(newUserDto);
  
    // Buat payload JWT
    const payload = { username: newUser.username, sub: newUser.id, role: newUser.role };
    const token = this.jwtService.sign(payload);

    return { user: newUser, token };
  }
  

  // // Method for validating a user during login
  // async validateUser(username: string, pass: string): Promise<any> {
  //   const user = await this.findUserByUsername(username);
  //   console.log('User found:', user); // Log found user
  
  //   if (user) {
  //     const passwordMatch = await bcrypt.compare(pass, user.password);
  //     console.log('Password match:', passwordMatch); // Log password match result
  
  //     if (passwordMatch) {
  //       const { password, ...result } = user;
  //       return result;
  //     }
  //   }
    
  //   return null; // Return null if no user or password doesn't match
  // }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.findUserByUsername(username);
    
    if (!user) {
      console.log('User not found');
      return null;
    }
  
    if (await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    console.log('Password comparison failed');
    return null;
  }
  
  // Example of a method to find a user by username (should fetch from DB)
  private async findUserByUsername(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    
    // Return the user if found, otherwise return null
    return user || null;
  }
  // Method for signing JWT after successful login
  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  

}
