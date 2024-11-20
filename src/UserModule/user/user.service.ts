import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { badges, status_premium, User } from './entities/user.entity';
import { ILike, LessThan, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { Role } from 'src/UserModule/role/entities/role.entity';
import { PhotoProfileService } from '../photo_profile/photo_profile.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private readonly photoProfileService: PhotoProfileService,
    private readonly jwtService: JwtService,
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
      id: user.id,
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

  async findOneByUsername(username: string) {
    const user = await this.userRepository.findOne({
      select: ['salt', 'username', 'password', 'email', 'role', 'id'],
      where: { username: username },
      relations: ['role'],
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
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
    await this.userRepository.update(
      {
        status_premium: status_premium.ACTIVE,
        end_premium: LessThan(new Date()),
      },
      {
        status_premium: status_premium.INACTIVE,
        badge: badges.NIMELIST_CITIZENS,
        start_premium: null,
        end_premium: null,
      },
    );
  }

  async getProfile(id: string) {
    const data = await this.userRepository.findOne({
      where: { id: id },
      select: ['id', 'username', 'email', 'bio', 'badge'],
    });
    const photo = await this.photoProfileService.getPhoto(id);

    return {
      id: data.id,
      username: data.username,
      email: data.email,
      photo_profile: photo,
      bio: data.bio,
      badge: data.badge,
    };
  }

  async updateProfile(
    id: string,
    body: UpdateUserDto,
    photo?: Express.Multer.File,
  ) {
    await this.userRepository.update({ id: id }, body);

    if (photo) {
      await this.photoProfileService.create(id, photo);
    }

    return {
      status: 200,
      message: 'Updated successfully',
    };
  }

  async getCheckPremium(id: string) {
    const user = await this.userRepository.findOne({
      where: { id: id, status_premium: status_premium.ACTIVE },
    });

    if (!user) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    return {
      status: 200,
      message: 'User found',
    };
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      select: ['salt', 'username', 'password', 'email', 'role', 'id'],
      where: { email: email },
      relations: ['role'],
    });

    return user;
  }

  async updateResetToken(id: string, token: string) {
    await this.userRepository.update(id, { reset_token: token });
  }
}
