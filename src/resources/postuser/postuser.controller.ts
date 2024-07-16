import { Controller, Get, Param, Delete } from '@nestjs/common';
import { PostuserService } from './postuser.service';
import { ApiTags } from '@nestjs/swagger';
// import { CreatePostuserDto } from './dto/create-postuser.dto';
// import { UpdatePostuserDto } from './dto/update-postuser.dto';

@Controller('postuser')
@ApiTags('User (PostgreSQL)')
export class PostuserController {
  constructor(private readonly postuserService: PostuserService) {}
  /* 
  @Post()
  create(@Body() createPostuserDto: CreatePostuserDto) {
    return this.postuserService.create(createPostuserDto);
  }
 */
  @Get()
  findAll() {
    return this.postuserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postuserService.findOne(+id);
  }
  /* 
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostuserDto: UpdatePostuserDto) {
    return this.postuserService.update(+id, updatePostuserDto);
  }
 */

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postuserService.remove(+id);
  }
}
