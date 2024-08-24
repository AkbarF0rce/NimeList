import { Test, TestingModule } from '@nestjs/testing';
import { PhotoTopicService } from './photo_topic.service';

describe('PhotoTopicService', () => {
  let service: PhotoTopicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhotoTopicService],
    }).compile();

    service = module.get<PhotoTopicService>(PhotoTopicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
