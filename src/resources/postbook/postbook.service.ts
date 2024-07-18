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
import { CreateMultiplePostbooksDto } from './dto/create-multiple-postbooks.dto';
import {
  PaginatedResultsDto,
  PaginationLinksDto,
} from './dto/paginated-results.dto';
import { Request } from 'express'; // Importiamo sempre Request da express
import { OrderEnum } from '../enum/order.enum';
import { UpdateMultiplePostbooksDto } from './dto/update-multiple-postbooks.dto';
import { createPagLinks, handleISBNcheck } from '../helpers/PostgreSQLhelpers';

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

  async createMultiple(
    createMultiplePostbooksDto: CreateMultiplePostbooksDto,
  ): Promise<Postbook[]> {
    // Creiamo le istanze da salvare partendo dall'array createMultiplePostbooksDto.postbooks
    const newPostbooks = this.postbookRepository.create(
      createMultiplePostbooksDto.postbooks,
    );

    try {
      // Salviamo le istanze
      await this.postbookRepository.save(newPostbooks);
    } catch (error) {
      if (error) {
        console.log(`Error: ${error.message}`);
        throw new BadRequestException(error.message);
      }
      console.log(`Error: Failed to create the books.`);
      throw new InternalServerErrorException('Failed to create the books.');
    }

    console.log(`New Books Created!`, newPostbooks);
    return newPostbooks; // Ritorniamo i libri che abbiamo salvato come response
  }

  async findAll(): Promise<Postbook[]> {
    // return this.postbookRepository.find();
    return await this.postbookRepository.find({
      where: { is_deleted: false },
    });
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
        .where(
          'postuserPostbook.pbook_id IS NULL AND postbook.is_deleted IS FALSE',
        )
        .getMany()
    );
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

  async trashedBooks(): Promise<Postbook[]> {
    return this.postbookRepository
      .createQueryBuilder('postbook') // Alias di Postbook
      .where('postbook.is_deleted IS TRUE')
      .getMany();
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
        // Gestione dell'errore di vincolo univoco
        handleISBNcheck(error, updatePostbookDto);
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

  async updateMultipleBooks(
    updateMultiplePostbooksDto: UpdateMultiplePostbooksDto,
  ): Promise<{
    updatedBooks: Postbook[];
    errors: { id: number; error: string }[];
  }> {
    const updatedBooks = [];
    const errors = [];

    for (const updateBookData of updateMultiplePostbooksDto.postbooks) {
      // Estraiamo l'id dall'elemento updateBookData dell'array di libri da aggiornare postbooks del DTO updateMultiplePostbooksDto che stiamo attualmente ciclando
      const { id } = updateBookData;

      try {
        // Cerchiamo il Libro da aggiornare usando l'id estratto
        const bookToUpdate = await this.postbookRepository.findOne({
          where: { id, is_deleted: false },
        });

        if (!bookToUpdate) {
          console.log(`Book with id ${id} not found`);
          errors.push({
            id: null,
            error: `Book with id ${id} not found`,
          });
          continue;
        }

        console.log(`Found "${bookToUpdate.title}" with id ${id}`);

        // Se abbiamo trovato il libro bookToUpdate, copiamo i dati updateBookData del DTO in bookToUpdate
        // In questo modo adesso bookToUpdate contiene adesso i dati da aggiornare inviati dalla query
        Object.assign(bookToUpdate, updateBookData);

        try {
          // Salviamo il record aggiornato bookToUpdate nel DB
          await this.postbookRepository.save(bookToUpdate);
        } catch (error) {
          console.log(`Error: ${error.message}`);
          errors.push({
            id: bookToUpdate.id,
            error: `Error updating book ${bookToUpdate.title} with id ${id}: ${error.message}`,
          });
          continue;
        }

        console.log(
          `Book "${bookToUpdate.title}" updated at ${bookToUpdate.updated_at}`,
        );

        // Inseriamo il record appena salvato nell'array dei risultati updatedBooks
        updatedBooks.push(bookToUpdate);
      } catch (error) {
        console.error(`Error updating book with id ${id}: ${error.message}`);
        if (error instanceof QueryFailedError) {
          errors.push({
            id: null,
            error: `Failed to update book with id ${id} due to a database error.`,
          });
        } else {
          errors.push({
            id: null,
            error: `Error updating book with id ${id}: ${error.message}`,
          });
        }
      }
    }

    return { updatedBooks, errors };
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

    // Se il libro è già assegnato all'utente che lo richiede
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
      // Codice di PostgreSQL di violazione chiave unica
      if (error.code === '23505') {
        throw new BadRequestException(`Book ${book.title} already on loan`);
      }

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

  async softDeleteMultiple(bookIds: number[]): Promise<{
    trashedBooks: Postbook[];
    errors: { id: number; error: string }[];
  }> {
    const trashedBooks = [];
    const errors = [];

    for (const id of bookIds) {
      try {
        const book = await this.postbookRepository.findOne({
          where: { id, is_deleted: false },
        });

        if (!book) {
          console.log(`Book with ID ${id} not found or already deleted`);
          errors.push({
            id,
            error: `Book with ID ${id} not found or already deleted`,
          });
          continue;
        }

        console.log(`Found ${book.title}`);

        // Controlla se il libro è in prestito (ha una relazione con un utente e quindi si trova nella tabella puser_pbook)
        const userPostbook = await this.postuserPostbookRepository.findOne({
          where: { pbook_id: id },
        });

        if (userPostbook) {
          console.log(
            `Book with ID ${id} is currently rented and cannot be trashed`,
          );
          errors.push({
            id,
            error: `Book with ID ${id} is currently rented and cannot be trashed`,
          });
          continue;
        }

        book.is_deleted = true;

        await this.postbookRepository.save(book);
        console.log(
          `Book ${book.title} with ID ${id} soft deleted successfully`,
        );
        trashedBooks.push(book);
      } catch (error) {
        console.error(
          `Error soft deleting book with ID ${id}: ${error.message}`,
        );
        if (error instanceof QueryFailedError) {
          errors.push({
            id,
            error: 'Failed to soft delete the book due to a database error.',
          });
        } else {
          errors.push({
            id,
            error: `Error soft deleting book with ID ${id}: ${error.message}`,
          });
        }
      }
    }

    return { trashedBooks, errors };
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

  async restoreMultiple(bookIds: number[]): Promise<{
    restoredBooks: Postbook[];
    errors: { id: number; error: string }[];
  }> {
    const restoredBooks = [];
    const errors = [];

    for (const id of bookIds) {
      try {
        const book = await this.postbookRepository.findOne({
          where: { id, is_deleted: true },
        });

        if (!book) {
          console.log(`Book with ID ${id} not found or not in the Recycle Bin`);
          errors.push({
            id,
            error: `Book with ID ${id} not found or not in the Recycle Bin`,
          });
          continue;
        }

        console.log(`Found ${book.title}`);

        book.is_deleted = false;

        await this.postbookRepository.save(book);
        console.log(`Book ${book.title} with ID ${id} restored successfully`);
        restoredBooks.push(book);
      } catch (error) {
        console.error(`Error restoring book with ID ${id}: ${error.message}`);
        if (error instanceof QueryFailedError) {
          errors.push({
            id,
            error: 'Failed to restore the book due to a database error.',
          });
        } else {
          errors.push({
            id,
            error: `Error soft restoring book with ID ${id}: ${error.message}`,
          });
        }
      }
    }

    return { restoredBooks, errors };
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

  async deleteMultipleBooks(bookIds: number[]): Promise<{
    deletedBooks: Postbook[];
    errors: { id: number; error: string }[];
  }> {
    const deletedBooks = [];
    const errors = [];

    for (const id of bookIds) {
      try {
        const book = await this.postbookRepository.findOne({
          where: { id, is_deleted: true },
        });

        if (!book) {
          console.log(`Book with ID ${id} not found in the Recycle Bin`);
          errors.push({
            id,
            error: `Book with ID ${id} not found in the Recycle Bin`,
          });
          continue;
        }

        console.log(`Found ${book.title}`);

        await this.postbookRepository.remove(book);

        console.log(`Book ${book.title} with ID ${id} deleted successfully`);
        deletedBooks.push(book);
      } catch (error) {
        console.error(`Error deleting book with ID ${id}: ${error.message}`);
        if (error instanceof QueryFailedError) {
          errors.push({
            id,
            error: 'Failed to delete the book due to a database error.',
          });
        } else {
          errors.push({
            id,
            error: `Error deleting book with ID ${id}: ${error.message}`,
          });
        }
      }
    }

    return { deletedBooks, errors };
  }

  /**
   * Crea i link di paginazione basati sul numero di pagina corrente, il numero totale di pagine e il numero di elementi per pagina.
   * @param page Numero della pagina corrente.
   * @param totalPages Numero totale di pagine.
   * @param pageSize Numero di elementi per pagina.
   * @param request Oggetto Request da cui estraremmo il Base URL per costruire i link di paginazione.
   * @returns Oggetto PaginationLinksDto contenente i link di navigazione.
   */
  private createPaginationLinks(
    page: number,
    totalPages: number,
    pageSize: number,
    // baseUrl: string,
    request: Request,
  ): PaginationLinksDto {
    // Manipoliamo l'oggetto request e assegniamo i dati interessati alla costante baseUrl
    // request.originalUrl.split('?') divide la stringa  in due parti, la prima parte è il path (/postbooks/paginat), la seconda è la query string (page=3&pageSize=10).
    // Di questo questo array ci serve il dato all'indice 0., quindi prendiamo request.originalUrl.split('?')[0]
    const baseUrl = `${request.protocol}://${request.get('host')}${request.originalUrl.split('?')[0]}`;
    console.log(`baseUrl: ${baseUrl}`);
    console.log(`originalUrl: ${request.originalUrl.split('?')[0]}`);
    return new PaginationLinksDto(page, totalPages, pageSize, baseUrl);
  }

  /**
   * Restituisce una lista paginata di Postbooks disponibili.
   * @param page Numero della pagina corrente. Default: 1.
   * @param pageSize Numero di elementi per pagina. Default: 10.
   * @param request Oggetto Request da cui estraremmo il Base URL per costruire i link di paginazione.
   * @returns Oggetto PaginatedResults contenente i dati paginati.
   */
  async paginateAll(
    page: number = 1,
    pageSize: number = 10,
    order: OrderEnum = OrderEnum.ASC,
    request: Request,
  ): Promise<PaginatedResultsDto> {
    const [data, total] = await this.postbookRepository.findAndCount({
      // skip: Offset (paginated) where from entities should be taken.
      // Ovvvero a pagina 1 vengono saltati 0 elementi
      // a pagina 2 vengono saltati 10 elementi dato che sono già presenti a pag 1
      skip: page > 0 ? (page - 1) * pageSize : 0,
      take: pageSize,
      order: {
        title: order, // Ordiniamo per titolo
      },
    });

    const paginatedResults = new PaginatedResultsDto(
      data,
      total,
      page,
      pageSize,
      order,
    );
    const links = createPagLinks(
      page,
      paginatedResults.totalPages,
      pageSize,
      // `/postbooks/paginate`,
      request,
    );
    paginatedResults.links = links;

    return paginatedResults;
  }

  /**
   * Restituisce una lista paginata di Postbooks disponibili.
   * @param page Numero della pagina corrente. Default: 1.
   * @param pageSize Numero di elementi per pagina. Default: 10.
   * @param request Oggetto Request da cui estraremmo il Base URL per costruire i link di paginazione.
   * @returns Oggetto PaginatedResults contenente i dati paginati.
   */
  async paginateAvailableBooks(
    page: number = 1,
    pageSize: number = 10,
    order: OrderEnum = OrderEnum.ASC,
    request: Request,
  ): Promise<PaginatedResultsDto> {
    const [data, total] = await this.postbookRepository
      .createQueryBuilder('postbook') // Alias di Postbook
      // LEFT JOIN: postbook (sx) si unisce a postuserPostbook
      .leftJoin(
        PostuserPostbook,
        'postuserPostbook', // Alias di PostuserPostbook
        'postbook.id = postuserPostbook.pbook_id',
      )
      .where(
        'postuserPostbook.pbook_id IS NULL AND postbook.is_deleted IS FALSE',
      )
      .orderBy('postbook.title', order)
      // skip: Offset (paginated) where from entities should be taken.
      // Ovvvero a pagina 1 vengono saltati 0 elementi
      // a pagina 2 vengono saltati 10 elementi dato che sono già presenti a pag 1
      .skip(page > 0 ? (page - 1) * pageSize : 0)
      .take(pageSize)
      .getManyAndCount();

    const paginatedResults = new PaginatedResultsDto(
      data,
      total,
      page,
      pageSize,
    );
    const links = this.createPaginationLinks(
      page,
      paginatedResults.totalPages,
      pageSize,
      // `/postbooks/paginate/available`,
      request,
    );
    paginatedResults.links = links;

    return paginatedResults;
  }

  /**
   * Restituisce una lista paginata di Postbooks disponibili.
   * @param page Numero della pagina corrente. Default: 1.
   * @param pageSize Numero di elementi per pagina. Default: 10.
   * @param request Oggetto Request da cui estraremmo il Base URL per costruire i link di paginazione.
   * @returns Oggetto PaginatedResults contenente i dati paginati.
   */
  async paginateTrashedBooks(
    page: number = 1,
    pageSize: number = 10,
    order: OrderEnum = OrderEnum.ASC,
    request: Request,
  ): Promise<PaginatedResultsDto> {
    const [data, total] = await this.postbookRepository
      .createQueryBuilder('postbook') // Alias di Postbook
      // LEFT JOIN: postbook (sx) si unisce a postuserPostbook
      .where('postbook.is_deleted IS TRUE')
      .orderBy('postbook.title', order)
      // skip: Offset (paginated) where from entities should be taken.
      // Ovvvero a pagina 1 vengono saltati 0 elementi
      // a pagina 2 vengono saltati 10 elementi dato che sono già presenti a pag 1
      .skip(page > 0 ? (page - 1) * pageSize : 0)
      .take(pageSize)
      .getManyAndCount();

    const paginatedResults = new PaginatedResultsDto(
      data,
      total,
      page,
      pageSize,
    );
    const links = this.createPaginationLinks(
      page,
      paginatedResults.totalPages,
      pageSize,
      // `/postbooks/paginate/trashed`,
      request,
    );
    paginatedResults.links = links;

    return paginatedResults;
  }
}
