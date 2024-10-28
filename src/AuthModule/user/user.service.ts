import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { badges, status_premium, User } from './entities/user.entity';
import { ILike, LessThan, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { Role } from 'src/AuthModule/role/entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    const existingUsername = await this.userRepository.findOne({
      select: ['username'],
      where: { username: user.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Cek apakah email sudah ada
    const existingEmail = await this.userRepository.findOne({
      select: ['email'],
      where: { email: user.email },
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

  async getUsers(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: status_premium,
  ) {
    const [data, total] = await this.userRepository.findAndCount({
      where: {
        username: ILike(`%${search}%`),
        role: { name: 'user' },
        status_premium: status,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { username: 'ASC' },
    });

    return {
      data,
      total,
    };
  }

  async getUserPay() {
    const users = await this.userRepository.find({
      select: ['id', 'username'],
      where: { role: { name: 'user' } },
    });

    return users;
  }

  async findOneByUsername(username: string) {
    const user = await this.userRepository.findOne({
      select: ['salt', 'username', 'password', 'email', 'role', 'id'],
      where: { username: username },
      relations: ['role'],
    });

    return {
      salt: user.salt,
      username: user.username,
      password: user.password,
      email: user.email,
      role: user.role.name,
    };
  }

  async findById(id: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.id = :id', { id: id })
      .getOne();
    return {
      username: user.username,
      email: user.email,
    };
  }

  async refreshUsers() {
    const users = await this.userRepository.find({
      select: ['status_premium', 'end_premium', 'badge'],
      where: {
        status_premium: status_premium.ACTIVE,
        end_premium: LessThan(new Date()),
      },
    });

    // Update status premium
    for (const user of users) {
      user.status_premium = status_premium.INACTIVE;
      user.badge = badges.NIMELIST_CITIZENS;
      await this.userRepository.save(user);
    }
  }
}
