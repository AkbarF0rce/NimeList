import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import path, { join } from 'path';
import { AnimeModule } from './AnimeModule/anime/anime.module';
import { GenreModule } from './AnimeModule/genre/genre.module';
import { PhotoAnimeModule } from './AnimeModule/photo_anime/photo_anime.module';
import { TopicModule } from './TopicModule/topic/topic.module';
import { PhotoTopicModule } from './TopicModule/photo_topic/photo_topic.module';
import { LikeTopicModule } from './TopicModule/like_topic/like_topic.module';
import { FavoriteAnimeModule } from './AnimeModule/favorite_anime/favorite_anime.module';
import { CommentModule } from './TopicModule/comment/comment.module';
import { ReviewModule } from './AnimeModule/review/review.module';
import { UserModule } from './UserModule/user/user.module';
import { RoleModule } from './UserModule/role/role.module';
import { LikeCommentModule } from './TopicModule/like_comment/like_comment.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './AuthModule/auth/auth.module';
import { DislikeTopicModule } from './TopicModule/dislike_topic/dislike_topic.module';
import { PremiumModule } from './TransactionModule/premium/premium.module';
import { TransactionModule } from './TransactionModule/transaction/transaction.module';
import { PhotoProfileModule } from './UserModule/photo_profile/photo_profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Membuat ConfigModule global
      envFilePath: '.env', // Lokasi file .env
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [join(process.cwd(), 'dist/**/*.entity{.ts,.js}')],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ReviewModule,
    AnimeModule,
    GenreModule,
    PhotoAnimeModule,
    TopicModule,
    PhotoTopicModule,
    LikeTopicModule,
    FavoriteAnimeModule,
    CommentModule,
    ReviewModule,
    UserModule,
    RoleModule,
    LikeCommentModule,
    DashboardModule,
    AuthModule,
    DislikeTopicModule,
    TransactionModule,
    PremiumModule,
    PhotoProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
