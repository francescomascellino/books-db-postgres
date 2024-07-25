import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Postuser } from './entities/postuser.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Postbook } from '../postbook/entities/postbook.entity';
import { CreatePostuserDto } from './dto/create-postuser.dto';
// import { UpdatePostuserDto } from './dto/update-postuser.dto';

@Injectable()
export class PostuserService {
  constructor(
    @InjectRepository(Postuser)
    private postuserRepository: Repository<Postuser>,

    @InjectRepository(Postbook)
    private postbookRepository: Repository<Postbook>,
  ) {}

  async create(createPostuserDto: CreatePostuserDto): Promise<Postuser> {
    const salt = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(createPostuserDto.password, salt);

    const createdUser = this.postuserRepository.create({
      ...createPostuserDto,
      password: hashedPassword,
    });

    try {
      await this.postuserRepository.save(createdUser);
    } catch (error) {
      console.log(`Error: Failed to create the book.`);
      throw new InternalServerErrorException('Failed to create the book.');
    }

    console.log(`New User Created!`, createdUser);

    return createdUser;
  }

  findAll() {
    return `This action returns all postuser`;
  }

  findByUsername(username: string): Promise<Postuser | null> {
    console.log(`Find by Username. Username: ${username}`);
    return this.postuserRepository
      .createQueryBuilder('postuser') // Alias di Postuser
      .where('postuser.username = :username', { username }) // Utilizza parametri per prevenire SQL injection
      .getOneOrFail();
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
