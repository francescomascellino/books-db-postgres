import { Type } from 'class-transformer';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { CreatePostbookDto } from './create-postbook.dto';

export class CreateMultiplePostbooksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePostbookDto)
  postbooks: CreatePostbookDto[];
}
