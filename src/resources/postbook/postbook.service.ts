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
import { Postuser } from '../postuser/entities/postuser.entity';
import { PostuserPostbook } from '../postuser_postbook/entities/postuser_postbook.entity';
@Injectable()
export class PostbookService {
  constructor(
    @InjectRepository(Postbook)
    private postbookRepository: Repository<Postbook>,

    @InjectRepository(Postuser)
    private postuserRepository: Repository<Postuser>,

    @InjectRepository(PostuserPostbook)
    private postuserPostbookRepository: Repository<PostuserPostbook>,
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

  async borrowBook(bookId: number, userId: number) {
    // Cerca il libro dal repository dei libri
    const book = await this.postbookRepository.findOne({
      where: { id: bookId, is_deleted: false },
    });

    if (!book) {
      console.log(`Book with ID ${bookId} not found`);
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    // Cerca l'utente dal repository degli utenti
    const user = await this.postuserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      console.log(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verifica se esiste già un record con la stessa combinazione di utente e libro
    const existingRecord = await this.postuserPostbookRepository.findOne({
      where: {
        puser: { id: userId },
        pbook: { id: bookId },
      },
    });

    if (existingRecord) {
      console.log(
        `Book with ID ${bookId} is already assigned to user with ID ${userId}`,
      );

      throw new BadRequestException(
        `Book with ID ${bookId} is already assigned to user with ID ${userId}`,
        // Nella realtà invieremo un messaggio che non espone l'id dell'utente
      );
    }

    // Crea la relazione PostuserPostbook
    const newPostuserPostbook = new PostuserPostbook();
    newPostuserPostbook.puser = user;
    newPostuserPostbook.pbook = book;

    try {
      // Salva la nuova relazione nel repository PostuserPostbook
      await this.postuserPostbookRepository.save(newPostuserPostbook);
      console.log(`Book "${book.title}" assigned to user "${user.username}"`);

      return {
        message: `Book ${newPostuserPostbook.pbook.title} succeffully assigned to User ${newPostuserPostbook.puser.username}`,
      };
    } catch (error) {
      console.error(`Error assigning book to user: ${error.message}`);
      throw new InternalServerErrorException('Failed to assign book to user');
    }
  }

  async returnBook(
    bookId: number,
    userId: number,
  ): Promise<{ message: string }> {
    // Cerca il libro dal repository dei libri
    const book = await this.postbookRepository.findOne({
      where: { id: bookId, is_deleted: false },
    });

    if (!book) {
      console.log(`Book with ID ${bookId} not found`);
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    // Cerca l'utente dal repository degli utenti
    const user = await this.postuserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      console.log(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Cerca la relazione PostuserPostbook esistente
    const existingRecord = await this.postuserPostbookRepository.findOne({
      where: {
        puser: { id: userId },
        pbook: { id: bookId },
      },
    });

    if (!existingRecord) {
      console.log(
        `No loan record found for book ID ${bookId} and user ID ${userId}`,
      );
      throw new NotFoundException(
        `No loan record found for book ID ${bookId} and user ID ${userId}`,
      );
    }

    try {
      // Rimuove la relazione esistente dal repository PostuserPostbook
      await this.postuserPostbookRepository.remove(existingRecord);
      console.log(`Book "${book.title}" returned by user "${user.username}"`);

      return {
        message: `Book ${book.title} successfully returned by User ${user.username}`,
      };
    } catch (error) {
      console.error(`Error returning book from user: ${error.message}`);
      throw new InternalServerErrorException('Failed to return book from user');
    }
  }

  async getLoans(): Promise<
    { username: string; name: string; books: string[] }[]
  > {
    const loans = await this.postuserPostbookRepository.find({
      relations: ['pbook', 'puser'],
    });

    // Definiamo un oggetto che terrà traccia dei libri per ogni utente:
    /* 
      { 
        Admin: {  username: 'Admin', 
                  name: 'Admin', 
                  books: [ 'TEST BOOK' ] 
                },

        User2: {  username: 'User2', 
                  name: 'User2', 
                  books: [ 'TEST BOOK 2' ] 
                }
                }
     */
    const loansMapped: {
      [username: string]: { username: string; name: string; books: string[] };
    } = {};

    loans.forEach((loan) => {
      // Recuperiamo il nome utente dal loan
      const username = loan.puser.username;

      // Controlliamo se nel nostro oggetto l'utente che stiamo mappando non è presente
      if (!loansMapped[username]) {
        // Se non è presente, lo aggiungiamo popolando i campi necessari
        loansMapped[username] = {
          username: loan.puser.username,
          name: loan.puser.name,
          // books sarà un array di titoli
          books: [],
        };
      }

      // In loans mapped, aggiungiamo all'indice dell'utente mappato nel loan atttuale il titolo del libro.
      loansMapped[username].books.push(loan.pbook.title);
    });

    /* 
    Siccome i risultati mappati avranno questo aspetto:
    loans mapped {
      Admin: {
        username: 'Admin',
        name: 'Admin',
        books: [ 'TEST BOOK', 'Il nome della rosa' ]
      }
    }
    e a noi interessa convertirli in un formato più adatto come un array di oggetti
    [
      {
          "username": "Admin",
          "name": "Admin",
          "books": [
              "TEST BOOK",
              "Il nome della rosa"
          ]
      }
    ]

    Convertiamo l'oggetto mappato in un array di risultati:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
    */
    const result = Object.values(loansMapped);

    return result;
  }

  async availableBooks(): Promise<Postbook[]> {
    return (
      this.postbookRepository
        .createQueryBuilder('postbook') // Alias di Postbook
        // LEFT JOIN: postbook (sx) si unisce a postuserPostbook
        .leftJoin(
          PostuserPostbook,
          'postuserPostbook', // Alias di PostuserPostbook
          'postbook.id = postuserPostbook.pbook_id',
        )
        .where('postuserPostbook.pbook_id IS NULL')
        .getMany()
    );
  }
}
