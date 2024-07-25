import { Test, TestingModule } from '@nestjs/testing';
import { PostauthController } from './postauth.controller';
import { PostauthService } from './postauth.service';

describe('PostauthController', () => {
  let controller: PostauthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostauthController],
      providers: [PostauthService],
    }).compile();

    controller = module.get<PostauthController>(PostauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
