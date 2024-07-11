import { Injectable } from '@nestjs/common';
// import { CreatePostuserDto } from './dto/create-postuser.dto';
// import { UpdatePostuserDto } from './dto/update-postuser.dto';

@Injectable()
export class PostuserService {
  /* 
  create(createPostuserDto: CreatePostuserDto) {
    return 'This action adds a new postuser';
  }
  */

  findAll() {
    return `This action returns all postuser`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postuser`;
  }

  /* 
  update(id: number, updatePostuserDto: UpdatePostuserDto) {
    return `This action updates a #${id} postuser`;
  }
  */

  remove(id: number) {
    return `This action removes a #${id} postuser`;
  }
}
