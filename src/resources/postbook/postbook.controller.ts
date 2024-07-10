import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PostbookService } from './postbook.service';
import { Postbook } from './entities/postbook.entity';
import { CreatePostbookDto } from '../postbook/dto/create-postbook.dto';
// import { UpdatePostbookDto } from './postbook/dto/create-postbook.dto';

@Controller('postbooks')
export class PostbookController {
  constructor(private readonly postbookService: PostbookService) {}

  @Get()
  findAll(): Promise<Postbook[]> {
    return this.postbookService.findAll();
  }

  @Post()
  create(@Body() createPostbookDto: CreatePostbookDto): Promise<Postbook> {
    return this.postbookService.create(createPostbookDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Postbook> {
    return this.postbookService.findOne(+id);
  }

  /*   @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostbookDto: UpdatePostbookDto,
  ) {
    return this.postbookService.update(+id, updatePostbookDto);
  } */

  /*   @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postbookService.remove(+id);
  } */
}
