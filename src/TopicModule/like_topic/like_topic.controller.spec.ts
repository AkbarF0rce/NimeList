import { Test, TestingModule } from '@nestjs/testing';
import { LikeTopicController } from './like_topic.controller';
import { LikeTopicService } from './like_topic.service';

describe('LikeTopicController', () => {
  let controller: LikeTopicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikeTopicController],
      providers: [LikeTopicService],
    }).compile();

    controller = module.get<LikeTopicController>(LikeTopicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
