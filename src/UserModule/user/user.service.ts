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
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TopicService } from 'src/TopicModule/topic/topic.service';
import { ReviewService } from 'src/AnimeModule/review/review.service';
import { FavoriteAnimeService } from 'src/AnimeModule/favorite_anime/favorite_anime.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private readonly photoProfileService: PhotoProfileService,
    // private readonly topicService: TopicService,
    // private readonly reviewService: ReviewService,
    // private readonly favoriteAnimeService: FavoriteAnimeService,
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
      name: user.name,
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
      select: ['username', 'password', 'email', 'role', 'id', 'name'],
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
      name: user.name,
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

  async getProfile(name: string) {
    const data = await this.userRepository.findOne({
      where: { username: name },
      select: ['username', 'email', 'bio', 'badge', 'id', 'name'],
    });
    const photo = await this.photoProfileService.getPhoto(data.id);

    return {
      username: data.username,
      email: data.email,
      name: data.name,
      photo_profile: photo,
      bio: data.bio,
      badge: data.badge,
    };
  }

  async getProfileForEdit(name: string, user: any) {
    const data = await this.userRepository.findOne({
      where: { username: name },
      select: ['username', 'bio', 'id', 'name'],
    });

    if (user.userId !== data.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    const photo = await this.photoProfileService.getPhoto(data.id);

    return {
      id: data.id,
      username: data.username,
      photo_profile: photo,
      bio: data.bio,
      name: data.name,
    };
  }

  async updatePassword(id: string, password: string) {
    const get = await this.userRepository.findOne({
      where: { id: id },
      select: ['salt', 'password'],
    });

    if (!bcrypt.compare(password, get.password)) {
      return {
        status: 400,
        message: 'Password salah',
      };
    }

    await this.userRepository.update({ id: id }, { password: password });
  }

  async update(id: string, body: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      select: ['username'],
      where: { id: id },
    });

    const existingUsername = await this.userRepository.findOne({
      select: ['username'],
      where: { username: body.username },
    });

    if (user.username !== body.username && existingUsername) {
      throw new ConflictException('Username already exists');
    }

    await this.userRepository.update({ id: id }, body);
  }

  async updateProfile(
    id: string,
    body: UpdateUserDto,
    photo?: Express.Multer.File,
  ) {
    await this.update(id, body);

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
}
