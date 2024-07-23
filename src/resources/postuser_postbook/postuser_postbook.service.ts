import { Injectable } from '@nestjs/common';
import { PostuserPostbook } from './entities/postuser_postbook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { CreatePostuserPostbookDto } from './dto/create-postuser_postbook.dto';
// import { UpdatePostuserPostbookDto } from './dto/update-postuser_postbook.dto';

@Injectable()
export class PostuserPostbookService {
  constructor(
    @InjectRepository(PostuserPostbook)
    private postuserPostbookRepository: Repository<PostuserPostbook>,
  ) {}
  /* 
  create(createPostuserPostbookDto: CreatePostuserPostbookDto) {
    return 'This action adds a new postuserPostbook';
  }
   */

  async findAll() {
    // return `This action returns all postuserPostbook`;
    return await this.postuserPostbookRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} postuserPostbook`;
  }

  /* 
  update(id: number, updatePostuserPostbookDto: UpdatePostuserPostbookDto) {
    return `This action updates a #${id} postuserPostbook`;
  }
 */

  remove(id: number) {
    return `This action removes a #${id} postuserPostbook`;
  }
}
