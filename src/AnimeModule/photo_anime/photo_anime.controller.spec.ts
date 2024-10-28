import { Test, TestingModule } from '@nestjs/testing';
import { PhotoAnimeController } from './photo_anime.controller';
import { PhotoAnimeService } from './photo_anime.service';

describe('PhotoAnimeController', () => {
  let controller: PhotoAnimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotoAnimeController],
      providers: [PhotoAnimeService],
    }).compile();

    controller = module.get<PhotoAnimeController>(PhotoAnimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
