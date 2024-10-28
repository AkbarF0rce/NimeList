import { Test, TestingModule } from '@nestjs/testing';
import { PhotoAnimeService } from './photo_anime.service';

describe('PhotoAnimeService', () => {
  let service: PhotoAnimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhotoAnimeService],
    }).compile();

    service = module.get<PhotoAnimeService>(PhotoAnimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
