import { Test, TestingModule } from '@nestjs/testing';
import { PostuserPostbookService } from './postuser_postbook.service';

describe('PostuserPostbookService', () => {
  let service: PostuserPostbookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostuserPostbookService],
    }).compile();

    service = module.get<PostuserPostbookService>(PostuserPostbookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
