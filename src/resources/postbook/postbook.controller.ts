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
import { ApiTags } from '@nestjs/swagger';
import { OrderEnum } from '../enum/order.enum';
import { UpdateMultiplePostbooksDto } from './dto/update-multiple-postbooks.dto';

@Controller('postbooks')
@ApiTags('Book (PostgreSQL)') // Identificativo sezione per Swagger
export class PostbookController {
  constructor(private readonly postbookService: PostbookService) {}

  // Possiamo importare JwtAuthGuard per proteggere le rotte
  // @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<Postbook[]> {
    console.log('Finding all Books');
    return this.postbookService.findAll();
  }

  @Post()
  create(@Body() createPostbookDto: CreatePostbookDto): Promise<Postbook> {
    console.log('Creating a new Book');
    return this.postbookService.create(createPostbookDto);
  }

  @Post('bulk/create')
  createMultiple(
    @Body() createMultiplePostbooksDto: CreateMultiplePostbooksDto,
  ): Promise<Postbook[]> {
    console.log('Creating multiple Books');
    return this.postbookService.createMultiple(createMultiplePostbooksDto);
  }

  @Post('bulk/newcreate')
  newCreateMultipleBooks(
    @Body() createMultiplePostbooksDto: CreateMultiplePostbooksDto,
  ): Promise<{ newBooks: Postbook[]; errors: any[] }> {
    console.log('Creating multiple Books');
    return this.postbookService.newCreateMultipleBooks(
      createMultiplePostbooksDto,
    );
  }

  @Patch('bulk/update')
  async updateMultipleBooks(
    @Body() updateMultiplePostbooksDto: UpdateMultiplePostbooksDto,
  ) {
    console.log('Updating multiple Books');
    return this.postbookService.updateMultipleBooks(updateMultiplePostbooksDto);
  }

  @Post(':bookId/burrow/:userId')
  async borrowBook(
    @Param('bookId') bookId: number,
    @Param('userId') userId: number,
  ) {
    console.log(`Loaning Book with ID ${bookId} to User with ID ${userId}`);
    const result = await this.postbookService.borrowBook(bookId, userId);
    return result;
  }

  @Post(':bookId/return/:userId')
  async returnBook(
    @Param('bookId') bookId: number,
    @Param('userId') userId: number,
  ) {
    console.log(`Returning Book with ID ${bookId} from User with ID ${userId}`);
    const result = await this.postbookService.returnBook(bookId, userId);
    return result;
  }

  @Get('paginate')
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
  async getloans() {
    console.log('Finding all loaned Books');
    return this.postbookService.getLoans();
  }

  @Get('available')
  availableBooks(): Promise<Postbook[]> {
    console.log('Finding all avaiable Books');
    return this.postbookService.availableBooks();
  }

  @Get('trashed')
  trashedBooks(): Promise<Postbook[]> {
    console.log('Finding all Books in the Recycle Bin');
    return this.postbookService.trashedBooks();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Postbook> {
    console.log(`Finding Book with id ${id}`);
    return this.postbookService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostbookDto: UpdatePostbookDto,
  ): Promise<Postbook> {
    console.log(`Updating Book with id ${id}`);
    return this.postbookService.update(Number(id), updatePostbookDto);
  }

  @Patch('delete/:id')
  async softDelete(@Param('id') id: string) {
    console.log(`Moving Book with id ${id} in the Recycle Bin`);
    return this.postbookService.softDelete(Number(id));
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    console.log(`Deleting Book with id ${id}`);
    return this.postbookService.delete(Number(id));
  }

  @Patch('bulk/trash')
  async softDeleteMultiple(
    @Body() deleteMultiplePostbooksDto: DeleteMultiplePostbooksDto,
  ) {
    console.log('Soft deleting multiple books');
    return this.postbookService.softDeleteMultiple(
      deleteMultiplePostbooksDto.bookIds,
    );
  }

  @Patch('bulk/restore')
  async restoreMultiple(
    @Body() restoreMultiplePostbooksDto: DeleteMultiplePostbooksDto,
  ) {
    console.log('Restoring multiple books');
    return this.postbookService.restoreMultiple(
      restoreMultiplePostbooksDto.bookIds,
    );
  }

  @Delete('bulk/delete')
  async deleteMultipleBooks(
    @Body() deleteMultiplePostbooksDto: DeleteMultiplePostbooksDto,
  ) {
    console.log('Deleting multiple books');
    return this.postbookService.deleteMultipleBooks(
      deleteMultiplePostbooksDto.bookIds,
    );
  }

  @Patch('restore/:id')
  async restore(@Param('id') id: string) {
    console.log(`Restoring Book with id ${id}`);
    return this.postbookService.restore(Number(id));
  }
}
