import { Test, TestingModule } from '@nestjs/testing';
import { PhotoProfileService } from './photo_profile.service';

describe('PhotoProfileService', () => {
  let service: PhotoProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhotoProfileService],
    }).compile();

    service = module.get<PhotoProfileService>(PhotoProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
