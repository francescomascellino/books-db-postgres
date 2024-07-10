import { Injectable } from '@nestjs/common';
import { CreatePostbookDto } from './dto/create-postbook.dto';
import { UpdatePostbookDto } from './dto/update-postbook.dto';

@Injectable()
export class PostbookService {
  create(createPostbookDto: CreatePostbookDto) {
    return 'This action adds a new postbook';
  }

  findAll() {
    return `This action returns all postbook`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postbook`;
  }

  update(id: number, updatePostbookDto: UpdatePostbookDto) {
    return `This action updates a #${id} postbook`;
  }

  remove(id: number) {
    return `This action removes a #${id} postbook`;
  }
}
