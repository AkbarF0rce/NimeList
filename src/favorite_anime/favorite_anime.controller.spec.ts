import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteAnimeController } from './favorite_anime.controller';
import { FavoriteAnimeService } from './favorite_anime.service';

describe('FavoriteAnimeController', () => {
  let controller: FavoriteAnimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteAnimeController],
      providers: [FavoriteAnimeService],
    }).compile();

    controller = module.get<FavoriteAnimeController>(FavoriteAnimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
