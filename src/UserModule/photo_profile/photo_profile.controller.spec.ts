import { Test, TestingModule } from '@nestjs/testing';
import { PhotoProfileController } from './photo_profile.controller';
import { PhotoProfileService } from './photo_profile.service';

describe('PhotoProfileController', () => {
  let controller: PhotoProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotoProfileController],
      providers: [PhotoProfileService],
    }).compile();

    controller = module.get<PhotoProfileController>(PhotoProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
