import { Controller, Get, Param, Delete, Body, Post } from '@nestjs/common';
import { PostuserService } from './postuser.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePostuserDto } from './dto/create-postuser.dto';
import { Postuser } from './entities/postuser.entity';
// import { CreatePostuserDto } from './dto/create-postuser.dto';
// import { UpdatePostuserDto } from './dto/update-postuser.dto';

@Controller('postuser')
@ApiTags('User (PostgreSQL)') // Identificativo sezione per Swagger
export class PostuserController {
  constructor(private readonly postuserService: PostuserService) {}

  @Post()
  @ApiOperation({
    summary: 'Crea un nuovo Utente nel DB PostgreSQL',
  })
  @ApiBody({
    type: CreatePostuserDto,
    description: 'Dati per la creazione del nuovo Utente',
  })
  create(@Body() createPostuserDto: CreatePostuserDto): Promise<Postuser> {
    console.log('Creating a new User');
    return this.postuserService.create(createPostuserDto);
  }

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
