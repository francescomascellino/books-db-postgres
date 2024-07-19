import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsInt } from 'class-validator';

export class DeleteMultiplePostbooksDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @ApiProperty({
    type: [Number],
    example: [
      {
        bookIds: [1, 10],
      },
    ],
    description: 'Elenco dei libri da eliminare',
  })
  bookIds: number[];
}
