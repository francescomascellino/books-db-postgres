import { PartialType } from '@nestjs/mapped-types';
import { CreatePostbookDto } from './create-postbook.dto';

export class UpdatebostbookDto extends PartialType(CreatePostbookDto) {}
