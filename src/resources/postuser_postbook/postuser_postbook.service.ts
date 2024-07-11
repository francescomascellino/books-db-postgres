import { Injectable } from '@nestjs/common';
import { CreatePostuserPostbookDto } from './dto/create-postuser_postbook.dto';
import { UpdatePostuserPostbookDto } from './dto/update-postuser_postbook.dto';

@Injectable()
export class PostuserPostbookService {
  create(createPostuserPostbookDto: CreatePostuserPostbookDto) {
    return 'This action adds a new postuserPostbook';
  }

  findAll() {
    return `This action returns all postuserPostbook`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postuserPostbook`;
  }

  update(id: number, updatePostuserPostbookDto: UpdatePostuserPostbookDto) {
    return `This action updates a #${id} postuserPostbook`;
  }

  remove(id: number) {
    return `This action removes a #${id} postuserPostbook`;
  }
}
