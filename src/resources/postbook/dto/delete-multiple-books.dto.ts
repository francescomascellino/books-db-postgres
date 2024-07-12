import { IsArray, ArrayMinSize, IsInt } from 'class-validator';

export class DeleteMultiplePostbooksDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  bookIds: number[];
}
