import { Test, TestingModule } from '@nestjs/testing';
import { PhotoTopicController } from './photo_topic.controller';
import { PhotoTopicService } from './photo_topic.service';

describe('PhotoTopicController', () => {
  let controller: PhotoTopicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotoTopicController],
      providers: [PhotoTopicService],
    }).compile();

    controller = module.get<PhotoTopicController>(PhotoTopicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
