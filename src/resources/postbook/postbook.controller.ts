import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PostbookService } from './postbook.service';
import { Postbook } from './entities/postbook.entity';
import { CreatePostbookDto } from '../postbook/dto/create-postbook.dto';
import { UpdatePostbookDto } from './dto/update-postbook.dto';

@Controller('postbooks')
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

  @Post(':bookId/burrow/:userId')
  async borrowBook(
    @Param('bookId') bookId: number,
    @Param('userId') userId: number,
  ) {
    const result = await this.postbookService.borrowBook(bookId, userId);
    return result;
  }

  @Post(':bookId/return/:userId')
  async returnBook(
    @Param('bookId') bookId: number,
    @Param('userId') userId: number,
  ) {
    const result = await this.postbookService.returnBook(bookId, userId);
    return result;
  }

  @Get('loans')
  async getloans() {
    return this.postbookService.getLoans();
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

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    console.log(`Deleting Book with id ${id}`);
    return this.postbookService.delete(Number(id));
  }

  @Patch('delete/:id')
  async softDelete(@Param('id') id: string) {
    console.log(`Moving Book with id ${id} in the Recycle Bin`);
    return this.postbookService.softDelete(Number(id));
  }

  @Patch('restore/:id')
  async restore(@Param('id') id: string) {
    console.log(`Restoring Book with id ${id}`);
    return this.postbookService.restore(Number(id));
  }
}
