import { Test, TestingModule } from '@nestjs/testing';
import { PostuserController } from './postuser.controller';
import { PostuserService } from './postuser.service';

describe('PostuserController', () => {
  let controller: PostuserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostuserController],
      providers: [PostuserService],
    }).compile();

    controller = module.get<PostuserController>(PostuserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
