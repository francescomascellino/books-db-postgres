import { Test, TestingModule } from '@nestjs/testing';
import { PostbookController } from './postbook.controller';
import { PostbookService } from './postbook.service';

describe('PostbookController', () => {
  let controller: PostbookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostbookController],
      providers: [PostbookService],
    }).compile();

    controller = module.get<PostbookController>(PostbookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
