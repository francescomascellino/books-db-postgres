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

  async findAll(): Promise<Postbook[]> {
    // return this.postbookRepository.find();
    return await this.postbookRepository.find({
      where: { is_deleted: false },
    });
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
    const book = await this.postbookRepository.findOne({
      where: { id, is_deleted: false },
    });

    if (!book) {
      console.log(`Book with ID ${id} not found`);
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    console.log(`Book found: ${book.title}`);

    return book;
  }

  async update(
    id: number,
    updatePostbookDto: UpdatePostbookDto,
  ): Promise<Postbook> {
    // Cerchiamo il Libro da aggiornare
    const recordToUpdate = await this.postbookRepository.findOne({
      where: { id, is_deleted: false },
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

  async delete(id: number) {
    // Cerchiamo il Libro da eliminare
    const book = await this.postbookRepository.findOne({
      // Eliminiamo solo i libri nel "cestino"
      where: { id, is_deleted: true },
    });

    if (!book) {
      console.log(`Book with ID ${id} not found or not in the Recycle Bin`);
      throw new NotFoundException(
        `Book with ID ${id} not found or not in the Recycle Bin`,
      );
    }

    console.log(`Found ${book.title}`);

    try {
      // Elimina il libro dal database
      await this.postbookRepository.remove(book);

      console.log(`Book ${book.title} with ID ${id} deleted successfully`);

      return {
        message: `Book ${book.title} with ID ${id} deleted successfully`,
      };
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

  async softDelete(id: number): Promise<{ message: string }> {
    const book = await this.postbookRepository.findOne({
      where: { id, is_deleted: false },
    });

    if (!book) {
      console.log(`Book with ID ${id} not found or already deleted`);

      throw new NotFoundException(
        `Book with ID ${id} not found or already deleted`,
      );
    }

    console.log(`Found ${book.title}`);

    // Aggiorniamo il campo is_deleted su true
    book.is_deleted = true;

    try {
      // salviamo il libro
      await this.postbookRepository.save(book);

      console.log(`Book ${book.title} with ID ${id} soft deleted successfully`);

      return {
        message: `Book ${book.title} with ID ${id} soft deleted successfully`,
      };
    } catch (error) {
      console.error(`Error soft deleting book with ID ${id}: ${error.message}`);

      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Failed to soft delete the book due to a database error.',
        );
      }

      throw new InternalServerErrorException('Failed to soft delete the book.');
    }
  }

  async restore(id: number): Promise<{ message: string }> {
    const book = await this.postbookRepository.findOne({
      // Possiamo ripristinare solo i libri nel "cestino"
      where: { id, is_deleted: true },
    });

    if (!book) {
      console.log(`Book with ID ${id} not found or not in the Recycle Bin`);

      throw new NotFoundException(
        `Book with ID ${id} not found or not in the Recycle Bin`,
      );
    }

    console.log(`Found ${book.title}`);

    // Aggiorniamo il campo is_deleted su true
    book.is_deleted = false;

    try {
      // salviamo il libro
      await this.postbookRepository.save(book);

      console.log(`Book ${book.title} with ID ${id} restored successfully`);

      return {
        message: `Book ${book.title} with ID ${id} restored successfully`,
      };
    } catch (error) {
      console.error(
        `Error soft restoring book with ID ${id}: ${error.message}`,
      );

      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Failed to restore the book due to a database error.',
        );
      }

      throw new InternalServerErrorException('Failed to soft delete the book.');
    }
  }
}
