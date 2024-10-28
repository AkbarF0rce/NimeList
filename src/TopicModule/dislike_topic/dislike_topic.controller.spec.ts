import { Test, TestingModule } from '@nestjs/testing';
import { DislikeTopicController } from './dislike_topic.controller';
import { DislikeTopicService } from './dislike_topic.service';

describe('DislikeTopicController', () => {
  let controller: DislikeTopicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DislikeTopicController],
      providers: [DislikeTopicService],
    }).compile();

    controller = module.get<DislikeTopicController>(DislikeTopicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
