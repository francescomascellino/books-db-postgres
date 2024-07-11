import { Test, TestingModule } from '@nestjs/testing';
import { PostuserPostbookController } from './postuser_postbook.controller';
import { PostuserPostbookService } from './postuser_postbook.service';

describe('PostuserPostbookController', () => {
  let controller: PostuserPostbookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostuserPostbookController],
      providers: [PostuserPostbookService],
    }).compile();

    controller = module.get<PostuserPostbookController>(PostuserPostbookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
