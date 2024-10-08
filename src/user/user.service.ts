import { ConflictException, Injectable } from '@nestjs/common';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { Role } from 'src/role/entities/role.entity';
import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    // Mencari role user
    const role = await this.roleRepository.findOneBy({ name: 'user' });

    // Membuat data user
    const user = this.userRepository.create({
      ...createUserDto,
      id_role: role.id,
      salt: v4(),
    });

    // Cek apakah username sudah ada
    const existingUsername = await this.userRepository.findOneBy({
      username: user.username,
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Cek apakah email sudah ada
    const existingEmail = await this.userRepository.findOneBy({
      email: user.email,
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Simpan data user
    await this.userRepository.save(user);

    return {
      role: role.name,
      username: user.username,
      email: user.email,
      salt: user.salt,
    };
    // Mencari role user
    const role = await this.roleRepository.findOneBy({ name: 'user' });

    // Membuat data user
    const user = this.userRepository.create({
      ...createUserDto,
      id_role: role.id,
      salt: v4(),
    });

    // Cek apakah username sudah ada
    const existingUsername = await this.userRepository.findOneBy({
      username: user.username,
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Cek apakah email sudah ada
    const existingEmail = await this.userRepository.findOneBy({
      email: user.email,
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Simpan data user
    await this.userRepository.save(user);

    return {
      role: role.name,
      username: user.username,
      email: user.email,
      salt: user.salt,
    };
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

  async findOneByUsername(username: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.username = :username', { username: username })
      .getOne();

    return {
      salt: user.salt,
      username: user.username,
      password: user.password,
      email: user.email,
      role: user.role.name,
    };
  }
}