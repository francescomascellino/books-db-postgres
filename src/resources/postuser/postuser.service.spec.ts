import { Test, TestingModule } from '@nestjs/testing';
import { PostuserService } from './postuser.service';

describe('PostuserService', () => {
  let service: PostuserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostuserService],
    }).compile();

    service = module.get<PostuserService>(PostuserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
