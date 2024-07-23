import { PartialType } from '@nestjs/mapped-types';
import { CreatePostuserPostbookDto } from './create-postuser_postbook.dto';

export class UpdatePostuserPostbookDto extends PartialType(
  CreatePostuserPostbookDto,
) {}
