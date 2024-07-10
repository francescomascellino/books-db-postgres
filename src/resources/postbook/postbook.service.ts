import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Postbook } from './entities/postbook.entity';
import { CreatePostbookDto } from '../postbook/dto/create-postbook.dto';
// import { UpdatePostbookDto } from './postbook/dto/create-postbook.dto';
@Injectable()
export class PostbookService {
  constructor(
    @InjectRepository(Postbook)
    private postbookRepository: Repository<Postbook>,
  ) {}

  findAll(): Promise<Postbook[]> {
    return this.postbookRepository.find();
  }

  async create(createPostbookDto: CreatePostbookDto): Promise<Postbook> {
    const newPostbook = this.postbookRepository.create(createPostbookDto);
    return this.postbookRepository.save(newPostbook);
  }

  findOne(id: number): Promise<Postbook> {
    return this.postbookRepository.findOne({ where: { id } });
  }

  /*   update(id: number): Promise<Postbook>; {
    return `Updates book`
  } */
}
