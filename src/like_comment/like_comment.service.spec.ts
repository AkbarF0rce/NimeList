import { Test, TestingModule } from '@nestjs/testing';
import { LikeCommentService } from './like_comment.service';

describe('LikeCommentService', () => {
  let service: LikeCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LikeCommentService],
    }).compile();

    service = module.get<LikeCommentService>(LikeCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
