import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostbookService } from './postbook.service';
import { CreatePostbookDto } from './dto/create-postbook.dto';
import { UpdatePostbookDto } from './dto/update-postbook.dto';

@Controller('postbook')
export class PostbookController {
  constructor(private readonly postbookService: PostbookService) {}

  @Post()
  create(@Body() createPostbookDto: CreatePostbookDto) {
    return this.postbookService.create(createPostbookDto);
  }

  @Get()
  findAll() {
    return this.postbookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postbookService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostbookDto: UpdatePostbookDto) {
    return this.postbookService.update(+id, updatePostbookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postbookService.remove(+id);
  }
}
