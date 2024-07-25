import { PartialType } from '@nestjs/swagger';
import { CreatePostauthDto } from './create-postauth.dto';

export class UpdatePostauthDto extends PartialType(CreatePostauthDto) {}
