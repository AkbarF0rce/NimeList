import { Test, TestingModule } from '@nestjs/testing';
import { LikeTopicService } from './like_topic.service';

describe('LikeTopicService', () => {
  let service: LikeTopicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LikeTopicService],
    }).compile();

    service = module.get<LikeTopicService>(LikeTopicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
