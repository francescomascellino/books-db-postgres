import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PostbookService } from './postbook.service';
import { Postbook } from './entities/postbook.entity';
import { CreatePostbookDto } from '../postbook/dto/create-postbook.dto';
import { UpdatePostbookDto } from './dto/update-postbook.dto';
import { CreateMultiplePostbooksDto } from './dto/create-multiple-postbooks.dto';
import { DeleteMultiplePostbooksDto } from './dto/delete-multiple-books.dto';
import { PaginatedResultsDto } from './dto/paginated-results.dto';
import { Request } from 'express'; // Importiamo sempre Request da express
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { OrderEnum } from '../enum/order.enum';
import { UpdateMultiplePostbooksDto } from './dto/update-multiple-postbooks.dto';

@Controller('postbooks')
@ApiTags('Book (PostgreSQL)') // Identificativo sezione per Swagger
export class PostbookController {
  constructor(private readonly postbookService: PostbookService) {}

  // Possiamo importare JwtAuthGuard per proteggere le rotte
  // @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Elenca tutti i recird Postbook',
  })
  findAll(): Promise<Postbook[]> {
    console.log('Finding all Books');
    return this.postbookService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Crea un nuovo record "Postbook" nel DB PostgreSQL',
  })
  @ApiBody({
    type: CreatePostbookDto,
    description: 'Dati per la creazione del nuovo record',
  })
  create(@Body() createPostbookDto: CreatePostbookDto): Promise<Postbook> {
    console.log('Creating a new Book');
    return this.postbookService.create(createPostbookDto);
  }

  @Post('bulk/create')
  @ApiOperation({
    summary: 'Crea più documenti contemporaneamente',
  })
  @ApiBody({
    type: CreateMultiplePostbooksDto,
    description: 'Dati per la creazione dei record',
  })
  createMultiple(
    @Body() createMultiplePostbooksDto: CreateMultiplePostbooksDto,
  ): Promise<Postbook[]> {
    console.log('Creating multiple Books');
    return this.postbookService.createMultiple(createMultiplePostbooksDto);
  }

  @Post('bulk/newcreate')
  @ApiOperation({
    summary: 'Crea più documenti contemporaneamente controllando gli ISBN',
  })
  @ApiBody({
    type: CreateMultiplePostbooksDto,
    description: 'Dati per la creazione dei record',
  })
  newCreateMultipleBooks(
    @Body() createMultiplePostbooksDto: CreateMultiplePostbooksDto,
  ): Promise<{ newBooks: Postbook[]; errors: any[] }> {
    console.log('Creating multiple Books');
    return this.postbookService.newCreateMultipleBooks(
      createMultiplePostbooksDto,
    );
  }

  @Patch('bulk/update')
  @ApiOperation({
    summary: 'Aggiorna più record contemporaneamente',
  })
  @ApiBody({
    type: UpdateMultiplePostbooksDto,
    description: 'Dati per la modifica dei record',
  })
  async updateMultipleBooks(
    @Body() updateMultiplePostbooksDto: UpdateMultiplePostbooksDto,
  ) {
    console.log('Updating multiple Books');
    return this.postbookService.updateMultipleBooks(updateMultiplePostbooksDto);
  }

  @Post(':bookId/burrow/:userId')
  @ApiOperation({
    summary: 'Permette a un Utente di prendere in prestito un libro',
  })
  @ApiParam({
    name: 'userId',
    description: "ID dell'Utente che vuole prendere in prestitoil libro",
  })
  @ApiParam({
    name: 'bookId',
    description: 'ID del libro da prendere in prestito',
  })
  async borrowBook(
    @Param('bookId') bookId: number,
    @Param('userId') userId: number,
  ) {
    console.log(`Loaning Book with ID ${bookId} to User with ID ${userId}`);
    const result = await this.postbookService.borrowBook(bookId, userId);
    return result;
  }

  @Post(':bookId/return/:userId')
  @ApiOperation({
    summary: 'Permette a un Utente di restituire un libro preso in prestito',
  })
  @ApiParam({
    name: 'userId',
    description: "ID dell'Utente che vuole prendere restituire il libro",
  })
  @ApiParam({
    name: 'bookId',
    description: 'ID del libro da restituire',
  })
  async returnBook(
    @Param('bookId') bookId: number,
    @Param('userId') userId: number,
  ) {
    console.log(`Returning Book with ID ${bookId} from User with ID ${userId}`);
    const result = await this.postbookService.returnBook(bookId, userId);
    return result;
  }

  @Get('paginate')
  @Get()
  @ApiOperation({
    summary: 'Elenca tutti i record Postbook usando la paginazione',
  })
  @ApiQuery({
    name: 'page',
    description: 'La pagina della della lista dei risultati da visualizzare',
  })
  @ApiQuery({
    name: 'pageSize',
    description:
      'Il numero di elementi per pagina da visualizzare. Default: 10, Max: 50',
  })
  @ApiQuery({
    name: 'order',
    description:
      'Il tipo di ordinamento per titolo della paginazione. Può essere ascendente( ASC) o discendente (DESC)',
  })
  async paginateAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('order') order: OrderEnum = OrderEnum.ASC, //Default
    @Req() request: Request, // Inviamo re Request come parametro
  ): Promise<PaginatedResultsDto> {
    console.log(
      `Finding all Books with pagination. Page: ${page}, Page Size: ${pageSize}, Order: ${order}`,
    );

    if (pageSize > 50) {
      console.log(
        `Page Size is ${pageSize}, max Page Size allowed is 50. Page Size will be changed to 50 by default.`,
      );
    }

    return this.postbookService.paginateAll(page, pageSize, order, request);
  }

  @Get('paginate/available')
  @ApiOperation({
    summary: 'Elenca tutti i record Postbook disponibili usando la paginazione',
  })
  @ApiQuery({
    name: 'page',
    description: 'La pagina della della lista dei risultati da visualizzare',
  })
  @ApiQuery({
    name: 'pageSize',
    description:
      'Il numero di elementi per pagina da visualizzare. Default: 10, Max: 50',
  })
  @ApiQuery({
    name: 'order',
    description:
      'Il tipo di ordinamento per titolo della paginazione. Può essere ascendente( ASC) o discendente (DESC)',
  })
  async paginateAvailableBooks(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('order') order: OrderEnum = OrderEnum.ASC, //Default
    @Req() request: Request, // Inviamo re Request come parametro
  ): Promise<PaginatedResultsDto> {
    console.log(
      `Finding all avaialable Books with pagination. Page: ${page}, Page Size: ${pageSize}, Order: ${order}`,
    );

    if (pageSize > 50) {
      console.log(
        `Page Size is ${pageSize}, max Page Size allowed is 50. Page Size will be changed to 50 by default.`,
      );
    }

    return this.postbookService.paginateAvailableBooks(
      page,
      pageSize,
      order,
      request,
    );
  }

  @Get('paginate/trashed')
  @ApiOperation({
    summary:
      'Elenca tutti i record Postbook attualmente nel cestino usando la paginazione',
  })
  @ApiQuery({
    name: 'page',
    description: 'La pagina della della lista dei risultati da visualizzare',
  })
  @ApiQuery({
    name: 'pageSize',
    description:
      'Il numero di elementi per pagina da visualizzare. Default: 10, Max: 50',
  })
  @ApiQuery({
    name: 'order',
    description:
      'Il tipo di ordinamento per titolo della paginazione. Può essere ascendente( ASC) o discendente (DESC)',
  })
  async paginateTrashedBooks(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('order') order: OrderEnum = OrderEnum.ASC, //Default
    @Req() request: Request, // Inviamo re Request come parametro
  ): Promise<PaginatedResultsDto> {
    console.log(
      `Finding all Books in the Recycle Bin with pagination. Page: ${page}, Page Size: ${pageSize}, Order: ${order}`,
    );

    if (pageSize > 50) {
      console.log(
        `Page Size is ${pageSize}, max Page Size allowed is 50. Page Size will be changed to 50 by default.`,
      );
    }

    return this.postbookService.paginateTrashedBooks(
      page,
      pageSize,
      order,
      request,
    );
  }

  @Get('loans')
  @ApiOperation({
    summary: 'Elenca tutti i record Postbook attualmente in prestito',
  })
  async getloans() {
    console.log('Finding all loaned Books');
    return this.postbookService.getLoans();
  }

  @Get('available')
  @ApiOperation({
    summary: 'Elenca tutti i record Postbook attualmente disponibili',
  })
  availableBooks(): Promise<Postbook[]> {
    console.log('Finding all avaiable Books');
    return this.postbookService.availableBooks();
  }

  @Get('trashed')
  @Get('available')
  @ApiOperation({
    summary: 'Elenca tutti i record Postbook attualmente nel cestino',
  })
  trashedBooks(): Promise<Postbook[]> {
    console.log('Finding all Books in the Recycle Bin');
    return this.postbookService.trashedBooks();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ottiene un record dal Database tramite ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del record da recuperare',
    type: 'string',
  })
  findOne(@Param('id') id: string): Promise<Postbook> {
    console.log(`Finding Book with id ${id}`);
    return this.postbookService.findOne(Number(id));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Aggiorna un record dal Database tramite ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del record da aggiornare',
  })
  @ApiBody({
    type: UpdatePostbookDto,
    description: 'Dati per la modifica del record',
  })
  update(
    @Param('id') id: string,
    @Body() updatePostbookDto: UpdatePostbookDto,
  ): Promise<Postbook> {
    console.log(`Updating Book with id ${id}`);
    return this.postbookService.update(Number(id), updatePostbookDto);
  }

  @Patch('delete/:id')
  @ApiOperation({
    summary: 'Sposta un record nel cestino del Database tramite ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del record da cestinare',
  })
  async softDelete(@Param('id') id: string) {
    console.log(`Moving Book with id ${id} in the Recycle Bin`);
    return this.postbookService.softDelete(Number(id));
  }

  @Delete('delete/:id')
  @ApiOperation({
    summary:
      'Elimina definitivamente un record nel cestino del Database tramite ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del record da eliminare',
  })
  async delete(@Param('id') id: string) {
    console.log(`Deleting Book with id ${id}`);
    return this.postbookService.delete(Number(id));
  }

  @Patch('bulk/trash')
  @ApiOperation({
    summary: 'Sposta più record nel cestino del Database tramite ID',
  })
  @ApiBody({
    type: DeleteMultiplePostbooksDto,
    description: "Dati per l'eliminazione dei record",
  })
  async softDeleteMultiple(
    @Body() deleteMultiplePostbooksDto: DeleteMultiplePostbooksDto,
  ) {
    console.log('Soft deleting multiple books');
    return this.postbookService.softDeleteMultiple(
      deleteMultiplePostbooksDto.bookIds,
    );
  }

  @Patch('bulk/restore')
  @ApiOperation({
    summary:
      'Ripristina dal cestino del Database più record nel cestino del Database tramite ID',
  })
  @ApiBody({
    type: DeleteMultiplePostbooksDto,
    description: "Dati per l'eliminazione dei record",
  })
  async restoreMultiple(
    @Body() restoreMultiplePostbooksDto: DeleteMultiplePostbooksDto,
  ) {
    console.log('Restoring multiple books');
    return this.postbookService.restoreMultiple(
      restoreMultiplePostbooksDto.bookIds,
    );
  }

  @Delete('bulk/delete')
  @ApiOperation({
    summary:
      'Elimina definitivamente più record nel cestino del Database tramite ID',
  })
  @ApiBody({
    type: DeleteMultiplePostbooksDto,
    description: "Dati per l'eliminazione dei record",
  })
  async deleteMultipleBooks(
    @Body() deleteMultiplePostbooksDto: DeleteMultiplePostbooksDto,
  ) {
    console.log('Deleting multiple books');
    return this.postbookService.deleteMultipleBooks(
      deleteMultiplePostbooksDto.bookIds,
    );
  }

  @Patch('restore/:id')
  @ApiOperation({
    summary: 'Ripristina un record dal cestino del Database tramite ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del record da ripristinare',
  })
  async restore(@Param('id') id: string) {
    console.log(`Restoring Book with id ${id}`);
    return this.postbookService.restore(Number(id));
  }
}
