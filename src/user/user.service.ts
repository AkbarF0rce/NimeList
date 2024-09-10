import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const post = await this.userRepository.create(createUserDto);
    post.salt = v4();
    return await this.userRepository.save(post);
  }

  async getUsers() {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.name = :roleName', { roleName: 'user' })
      .getMany();

    return user.map((user) => ({
      salt: user.salt,
      username: user.username,
      status_premium: user.status_premium,
      badge: user.badge,
      start_premium: user.start_premium,
      end_premium: user.end_premium,
      email: user.email,
    }));
  }
}
