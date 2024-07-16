import {
  Controller,
  Get,
  // Post,
  // Body,
  // Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostuserPostbookService } from './postuser_postbook.service';
import { ApiTags } from '@nestjs/swagger';
// import { CreatePostuserPostbookDto } from './dto/create-postuser_postbook.dto';
// import { UpdatePostuserPostbookDto } from './dto/update-postuser_postbook.dto';

@Controller('postuser-postbook')
@ApiTags('User - Book (PostgreSQL)')
export class PostuserPostbookController {
  constructor(
    private readonly postuserPostbookService: PostuserPostbookService,
  ) {}

  /* 
  @Post()
  create(@Body() createPostuserPostbookDto: CreatePostuserPostbookDto) {
    return this.postuserPostbookService.create(createPostuserPostbookDto);
  }
   */

  @Get()
  findAll() {
    return this.postuserPostbookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postuserPostbookService.findOne(+id);
  }

  /* 
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostuserPostbookDto: UpdatePostuserPostbookDto,
  ) {
    return this.postuserPostbookService.update(+id, updatePostuserPostbookDto);
  }
 */

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postuserPostbookService.remove(+id);
  }
}
