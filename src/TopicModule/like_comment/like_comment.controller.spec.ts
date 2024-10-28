import { Test, TestingModule } from '@nestjs/testing';
import { LikeCommentController } from './like_comment.controller';
import { LikeCommentService } from './like_comment.service';

describe('LikeCommentController', () => {
  let controller: LikeCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikeCommentController],
      providers: [LikeCommentService],
    }).compile();

    controller = module.get<LikeCommentController>(LikeCommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
