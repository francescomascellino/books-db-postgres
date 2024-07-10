import { Injectable, NotFoundException } from '@nestjs/common';
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
    console.log('Finding all Books');

    return this.postbookRepository.find();
  }

  async create(createPostbookDto: CreatePostbookDto): Promise<Postbook> {
    console.log('Creating a new Book');
    const newPostbook = this.postbookRepository.create(createPostbookDto);
    console.log(`New Book Created!`, newPostbook);
    return this.postbookRepository.save(newPostbook);
  }

  async findOne(id: number): Promise<Postbook> {
    console.log(`Finding Book with id ${id}`);

    const book = await this.postbookRepository.findOne({ where: { id } });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    console.log(`Book found: "${book.title}"`);

    return book;
  }

  /*   update(id: number): Promise<Postbook>; {
    return `Updates book`
  } */
}
