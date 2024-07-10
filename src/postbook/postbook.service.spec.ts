import { Test, TestingModule } from '@nestjs/testing';
import { PostbookService } from './postbook.service';

describe('PostbookService', () => {
  let service: PostbookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostbookService],
    }).compile();

    service = module.get<PostbookService>(PostbookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
