import {
  BadRequestException,
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
import { Transaction } from 'src/TransactionModule/transaction/entities/transaction.entity';
import { Review } from 'src/AnimeModule/review/entities/review.entity';
import { FavoriteAnime } from 'src/AnimeModule/favorite_anime/entities/favorite_anime.entity';
import { Comment } from 'src/TopicModule/comment/entities/comment.entity';
import { Topic } from 'src/TopicModule/topic/entities/topic.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(FavoriteAnime)
    private favoriteAnimeRepository: Repository<FavoriteAnime>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    private readonly photoProfileService: PhotoProfileService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    // Mencari role user
    const role = await this.roleRepository.findOneBy({ name: 'user' });

    // Membuat data user
    const user = this.userRepository.create({
      ...createUserDto,
      name: createUserDto.username,
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
    const save = await this.userRepository.save(user);

    if (!save) {
      throw new BadRequestException('User not created');
    }

    return {
      role: role.name,
      username: user.username,
      email: user.email,
      salt: user.salt,
      id: user.id,
      name: user.name,
    };
  }

  // Mendapatkan semua user untuk admin
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

  // Mendapatkan user berdasarkan email
  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({
      select: ['username', 'password', 'email', 'role', 'id', 'name'],
      where: { email: email },
      relations: ['role'],
    });

    if (!user) {
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

  // Mendapatkan user berdasarkan id
  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      select: ['username', 'email'],
    });

    return {
      username: user.username,
      email: user.email,
    };
  }

  // Fungsi untuk cek masa premium
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

  // Fungsi mendapatkan data user berdasarkan username untuk profile
  async getProfile(username: string) {
    const data = await this.userRepository.findOne({
      where: { username: username },
      select: ['username', 'bio', 'badge', 'id', 'name'],
    });
    const photo = await this.photoProfileService.getPhoto(data.id);

    return {
      username: data.username,
      name: data.name,
      photo_profile: photo,
      bio: data.bio,
      badge: data.badge,
    };
  }

  // Fungsi update user
  async updateUser(id: string, body: UpdateUserDto) {
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

    const update = await this.userRepository.update({ id: id }, body);

    if (!update) {
      throw new BadRequestException('data not updated');
    }

    return;
  }

  // Fungsi update profile
  async updateProfile(
    id: string,
    body: UpdateUserDto,
    photo: Express.Multer.File,
  ) {
    await this.updateUser(id, body);

    if (photo) {
      await this.photoProfileService.create(id, photo);
    }

    throw new HttpException('data updated', 200);
  }

  // Fungsi delete user
  async deleteUser(id: string, password: string) {
    const get = await this.userRepository.findOne({
      where: { id: id },
      select: ['password', 'id'],
    });

    if (get.id !== id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    if (!bcrypt.compare(password, get.password)) {
      throw new BadRequestException('wrong password');
    }

    const deleted = await this.userRepository.delete({ id: id });

    if (!deleted) {
      throw new BadRequestException('data not deleted');
    }

    throw new HttpException('data deleted', 200);
  }

  // Fungsi mendapatkan detail user untuk admin
  async getUserDetail(username: string) {
    const user = await this.userRepository.findOne({
      where: { username: username },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        bio: true,
        badge: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const photo = await this.photoProfileService.getPhoto(user.id);
    const totalReview = await this.reviewRepository.count({
      where: { id_user: user.id },
    });
    const totalFav = await this.favoriteAnimeRepository.count({
      where: { id_user: user.id },
    });
    const totalTopic = await this.topicRepository.count({
      where: { id_user: user.id },
    });
    const totalComment = await this.commentRepository.count({
      where: { id_user: user.id },
    });
    const totalTransaction = await this.transactionRepository.count({
      where: { id_user: user.id },
    });

    return {
      ...user,
      photo_profile: photo,
      review_created: totalReview || 0,
      favorite_anime: totalFav || 0,
      topic_created: totalTopic || 0,
      comment_created: totalComment || 0,
      transaction_created: totalTransaction || 0,
    };
  }

  // Fungsi cek user premium
  async checkPremium(id: string) {
    const user = await this.userRepository.findOne({
      where: { id: id, status_premium: status_premium.ACTIVE },
    });

    if (user === null) {
      throw new BadRequestException('User not premium');
    }

    return true;
  }
}
