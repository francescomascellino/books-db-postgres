import { PartialType } from '@nestjs/mapped-types';
import { CreatePostbookDto } from './create-postbook.dto';

export class UpdatePostbookDto extends PartialType(CreatePostbookDto) {}
