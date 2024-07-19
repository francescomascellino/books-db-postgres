import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { CreateMultipleBooksDto } from './dto/create-multiple-books.dto';
import { DeleteMultipleBooksDto } from './dto/delete-multiple-books.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UpdateMultipleBooksDto } from './dto/update-multiple-books.dto';
import { BookDocument } from './schemas/book.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginateResult } from 'mongoose';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('book')
@ApiTags('Book (MongoDB)') // Identificativo sezione per Swagger
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Creea un nuovo documento mongo "Book"' })
  @ApiBody({
    type: CreateBookDto,
    description: 'Dati per la creazione del nuovo record',
  })
  // @ApiQuery({
  //   type: CreateBookDto,
  //   description: 'Dati per la creazione del nuovo record',
  // })
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @UseGuards(JwtAuthGuard)
  /*   @Get()
  async findAll(): Promise<BookDocument[]> {
    return this.bookService.findAll();
  } */
  @Get()
  @ApiOperation({
    summary: 'Elenca tutti i documenti Book usando la paginazione',
  })
  @ApiQuery({
    name: 'page',
    description: 'La pagina della della lista dei risultati da visualizzare',
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Il numero di elementi per pagina da visualizzare',
  })
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<PaginateResult<BookDocument>> {
    const pageNumber = page ? Number(page) : 1;
    const pageSizeNumber = pageSize ? Number(pageSize) : 10;
    return this.bookService.findAll(pageNumber, pageSizeNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get('loaned')
  @ApiOperation({
    summary: 'Elenca tutti i documenti Book attualmente in prestito',
  })
  getLoanedBooks(): Promise<BookDocument[]> {
    return this.bookService.loanedBooks();
  }

  @UseGuards(JwtAuthGuard)
  @Get('available')
  @ApiOperation({
    summary: 'Elenca tutti i documenti Book attualmente in disponibili',
  })
  async getAvailableBooks(): Promise<BookDocument[]> {
    return this.bookService.availableBooks();
  }

  @UseGuards(JwtAuthGuard)
  @Get('delete')
  @ApiOperation({
    summary:
      'Elenca tutti i documenti attualmente nel cestino usando la paginazione',
  })
  @ApiQuery({
    name: 'page',
    description: 'La pagina della della lista dei risultati da visualizzare',
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Il numero di elementi per pagina da visualizzare',
  })
  async getSoftDeleted(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<PaginateResult<BookDocument>> {
    const pageNumber = page ? Number(page) : 1;
    const pageSizeNumber = pageSize ? Number(pageSize) : 10;
    return this.bookService.getSoftDeleted(pageNumber, pageSizeNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Ottiene un record dal Database tramite ID',
  })
  @ApiQuery({
    name: 'id',
    description: 'ID del record da recuperare',
  })
  findOne(@Param('id') id: string): Promise<BookDocument> {
    return this.bookService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Aggiorna un record dal Database tramite ID',
  })
  @ApiQuery({
    name: 'id',
    description: 'ID del record da aggiornare',
  })
  @ApiBody({
    type: UpdateBookDto,
    description: 'Dati per la modifica del record',
  })
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<BookDocument> {
    return this.bookService.update(id, updateBookDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bulk/create')
  @ApiOperation({
    summary: 'Crea più documenti contemporaneamente',
  })
  @ApiBody({
    type: CreateMultipleBooksDto,
    description: 'Dati per la creazione dei record',
  })
  createMultiple(
    @Body() createMultipleBooksDto: CreateMultipleBooksDto,
  ): Promise<{ createdBooks: BookDocument[]; errors: any[] }> {
    return this.bookService.createMultipleBooks(createMultipleBooksDto.books);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('bulk/update')
  @ApiOperation({
    summary: 'Aggiorna più documenti contemporaneamente',
  })
  @ApiBody({
    type: UpdateMultipleBooksDto,
    description: 'Dati per la modifica dei record',
  })
  updateMultiple(
    @Body() updateMultipleBooksDto: UpdateMultipleBooksDto,
  ): Promise<{ updatedBooks: BookDocument[]; errors: any[] }> {
    return this.bookService.updateMultipleBooks(updateMultipleBooksDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/delete/:id')
  @ApiOperation({
    summary: 'Recupera un record nel cestino del Database tramite ID',
  })
  @ApiQuery({
    name: 'id',
    description: 'ID del record da recuperare',
  })
  findOneSoftDeleted(@Param('id') id: string): Promise<BookDocument> {
    return this.bookService.findOneSoftDeleted(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  @ApiOperation({
    summary:
      'Elimina definitivamente un record nel cestino del Database tramite ID',
  })
  @ApiQuery({
    name: 'id',
    description: 'ID del record da eliminare',
  })
  remove(@Param('id') id: string): Promise<BookDocument> {
    return this.bookService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('delete/:id')
  @ApiOperation({
    summary: 'Sposta un record nel cestino del Database tramite ID',
  })
  @ApiQuery({
    name: 'id',
    description: 'ID del record da cestinare',
  })
  softDelete(@Param('id') id: string): Promise<BookDocument> {
    return this.bookService.softDelete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('restore/:id')
  @ApiOperation({
    summary: 'Ripristina un record dal cestino del Database tramite ID',
  })
  @ApiQuery({
    name: 'id',
    description: 'ID del record da ripristinare',
  })
  restore(@Param('id') id: string): Promise<BookDocument> {
    return this.bookService.restore(id);
  }

  /**
   * Rimuove più libri dal database.
   * Questo metodo è protetto da autenticazione JWT.
   *
   * @param deleteMultipleBooksDto Un DTO che contiene un array di ID di libri da eliminare.
   * @returns Una promessa che risolve un oggetto contenente due array:
   *          - `deletedBooks`: libri eliminati con successo
   *          - `errors`: errori riscontrati durante l'eliminazione dei libri
   */
  @UseGuards(JwtAuthGuard)
  @Delete('bulk/delete')
  @ApiOperation({
    summary:
      'Elimina definitivamente più record nel cestino del Database tramite ID',
  })
  @ApiQuery({
    name: 'id',
    description: 'ID dei record da eliminare',
  })
  removeMultiple(
    @Body() deleteMultipleBooksDto: DeleteMultipleBooksDto,
  ): Promise<{ deletedBooks: BookDocument[]; errors: any[] }> {
    return this.bookService.removeMultipleBooks(deleteMultipleBooksDto.bookIds);
  }
}
