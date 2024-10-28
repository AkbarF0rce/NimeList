import { Test, TestingModule } from '@nestjs/testing';
import { DislikeTopicService } from './dislike_topic.service';

describe('DislikeTopicService', () => {
  let service: DislikeTopicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DislikeTopicService],
    }).compile();

    service = module.get<DislikeTopicService>(DislikeTopicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
