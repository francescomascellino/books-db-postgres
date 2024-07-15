import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBookDto } from './create-book.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMultipleBooksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBookDto)
  @ApiProperty({
    type: [CreateBookDto],
    example: [
      {
        title: 'Il Signore degli Anelli',
        author: 'J.R.R. Tolkien',
        ISBN: '978-0-618-15600-1',
        loaned_to: {
          _id: '66605031a9a8d2847d5b85d5',
          name: 'Mario',
        },
      },
    ],
    description: 'Elenco dei libri da creare',
  })
  books: CreateBookDto[];
}
