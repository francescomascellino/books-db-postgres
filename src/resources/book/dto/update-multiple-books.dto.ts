import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { Type } from 'class-transformer';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Per aggiornare libri multipli abbiamo bisogno venga fornito anche l'ID di ogni libro
class UpdateBookWithIdDto extends PartialType(CreateBookDto) {
  @ApiProperty({
    type: [String],
    example: '66605047a9a8d2847d5b85d6',
    description: 'ID del Libro da aggiornare',
  })
  id: string;
}
export class UpdateMultipleBooksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBookDto)
  @ApiProperty({
    type: [CreateBookDto],
    example: [
      {
        id: '6668479e1e78c11602d5032c',
        title: 'Harry Potter e la Pietra Filosofale',
        author: 'J.K. Rowling',
        ISBN: '9788877827021',
      },
      {
        id: '66684885528bd3737f6938f2',
        title: 'Cronache del ghiaccio e del fuoco - Il Trono di Spade',
        author: 'George R.R. Martin',
        ISBN: '9788804644124',
      },
    ],
    description: 'Elenco dei libri da aggiornare',
  })
  updates: UpdateBookWithIdDto[];
}
