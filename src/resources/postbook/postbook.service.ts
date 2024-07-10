import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Postbook } from './entities/postbook.entity';
import { CreatePostbookDto } from '../postbook/dto/create-postbook.dto';
import { UpdatePostbookDto } from './dto/update-postbook.dto';
import { QueryFailedError, Repository } from 'typeorm';
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

    try {
      await this.postbookRepository.save(newPostbook);
    } catch (error) {
      if (error) {
        console.log(`Error: ${error.message}`);
        throw new BadRequestException(error.message);
      }
      console.log(`Error: Failed to create the book.`);
      throw new InternalServerErrorException('Failed to create the book.');
    }

    console.log(`New Book Created!`, newPostbook);

    return newPostbook;
  }

  async findOne(id: number): Promise<Postbook> {
    const book = await this.postbookRepository.findOne({ where: { id } });

    if (!book) {
      console.log(`Book with ID ${id} not found`);
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    console.log(`Book found: "${book.title}"`);

    return book;
  }

  async update(
    id: number,
    updatePostbookDto: UpdatePostbookDto,
  ): Promise<Postbook> {
    // Cerchiamo il Libro da aggiornare
    const recordToUpdate = await this.postbookRepository.findOne({
      where: { id },
    });

    if (!recordToUpdate) {
      console.log(`Book with ID ${id} not found`);
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    console.log(`Found "${recordToUpdate.title}"`);

    // Copiamo i dati del DTO in recordToUpdate
    Object.assign(recordToUpdate, updatePostbookDto);

    try {
      // Salviamo il record
      await this.postbookRepository.save(recordToUpdate);
    } catch (error) {
      if (error) {
        console.log(`Error: ${error.message}`);
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to update the book.');
    }

    console.log(
      `Book "${recordToUpdate.title}" updated at ${recordToUpdate.updated_at}`,
    );

    return recordToUpdate;
  }

  async delete(id: number): Promise<void> {
    // Cerchiamo il Libro da eliminare
    const book = await this.postbookRepository.findOne({
      where: { id },
    });

    if (!book) {
      console.log(`Book with ID ${id} not found`);
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    console.log(`Found "${book.title}"`);

    try {
      // Elimina il libro dal database
      await this.postbookRepository.remove(book);
      console.log(`Book "${book.title}" with ID ${id} deleted successfully`);
    } catch (error) {
      if (error) {
        console.log(`Error deleting book with ID ${id}: ${error.message}`);
        throw new BadRequestException(
          `Error deleting book with ID ${id}: ${error.message}`,
        );
      }

      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Failed to delete the book due to a database error.',
        );
      }

      throw new InternalServerErrorException('Failed to delete the book.');
    }
  }
}
