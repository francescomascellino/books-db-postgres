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
      },
      {
        title: 'Cronache del ghiaccio e del fuoco - Il Trono di Spade',
        author: 'George R.R. Martin',
        ISBN: '9788804644124',
      },
    ],
    description: 'Elenco dei libri da creare',
  })
  books: CreateBookDto[];
}
