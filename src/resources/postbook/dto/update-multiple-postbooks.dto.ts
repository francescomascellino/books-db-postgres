import { Type } from 'class-transformer';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostbookDto } from './create-postbook.dto';

// Avremo bisogno dell'attributo ID
class UpdatePostbookWithIdDto extends PartialType(CreatePostbookDto) {
  id: number;
}
export class UpdateMultiplePostbooksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdatePostbookWithIdDto)
  postbooks: UpdatePostbookWithIdDto[];
}
