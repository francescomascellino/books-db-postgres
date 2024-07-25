import { Test, TestingModule } from '@nestjs/testing';
import { PostauthService } from './postauth.service';

describe('PostauthService', () => {
  let service: PostauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostauthService],
    }).compile();

    service = module.get<PostauthService>(PostauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
