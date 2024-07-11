import { PartialType } from '@nestjs/mapped-types';
import { CreatePostuserDto } from './create-postuser.dto';

export class UpdatePostuserDto extends PartialType(CreatePostuserDto) {}
