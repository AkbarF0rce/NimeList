import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';  
import path, { join } from 'path';
import { AnimeModule } from './anime/anime.module';
import { GenreModule } from './genre/genre.module';
import { PhotoAnimeModule } from './photo_anime/photo_anime.module';
import { TopicModule } from './topic/topic.module';
import { PhotoTopicModule } from './photo_topic/photo_topic.module';
import { LikeTopicModule } from './like_topic/like_topic.module';
import { FavoriteAnimeModule } from './favorite_anime/favorite_anime.module';
import { CommentModule } from './comment/comment.module';
import { ReviewModule } from './review/review.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { LikeCommentModule } from './like_comment/like_comment.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { DislikeTopicModule } from './dislike_topic/dislike_topic.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
