import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteAnimeService } from './favorite_anime.service';

describe('FavoriteAnimeService', () => {
  let service: FavoriteAnimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavoriteAnimeService],
    }).compile();

    service = module.get<FavoriteAnimeService>(FavoriteAnimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
