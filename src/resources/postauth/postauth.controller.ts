import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  // Get, Post, Body, Patch, Param, Delete
} from '@nestjs/common';
import { PostauthService } from './postauth.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../postauth/dto/login.dto';
// import { CreatePostauthDto } from './dto/create-postauth.dto';
// import { UpdatePostauthDto } from './dto/update-postauth.dto';

@Controller('postauth')
@ApiTags('Auth (PstgreSQL)')
export class PostauthController {
  constructor(private readonly postauthService: PostauthService) {}

  @Post('login')
  @ApiOperation({
    summary:
      'Permette a un Utente registrato di effettuare il login e ottenere un JWT',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Dati per il login',
  })
  async login(@Body() loginDto: LoginDto) {
    // Controlla se le credenziali di accesso dell'utente sono valide
    const user = await this.postauthService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    // Se le credenziali sono valide, genera il token di accesso JWT e lo restituisce
    if (!user) {
      throw new UnauthorizedException();
    }

    // Se le credenziali non sono valide, genera un'eccezione di autorizzazione
    return this.postauthService.login(user);
  }

  /*   @Post()
  create(@Body() createPostauthDto: CreatePostauthDto) {
    return this.postauthService.create(createPostauthDto);
  }

  @Get()
  findAll() {
    return this.postauthService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postauthService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostauthDto: UpdatePostauthDto) {
    return this.postauthService.update(+id, updatePostauthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postauthService.remove(+id);
  } */
}
