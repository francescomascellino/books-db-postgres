import { Type } from 'class-transformer';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostbookDto } from './create-postbook.dto';
import { ApiProperty } from '@nestjs/swagger';

// Avremo bisogno dell'attributo ID
class UpdatePostbookWithIdDto extends PartialType(CreatePostbookDto) {
  @ApiProperty({
    type: [Number],
    example: 1,
    description: 'ID del Libro da aggiornare',
  })
  id: number;
}
export class UpdateMultiplePostbooksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdatePostbookWithIdDto)
  @ApiProperty({
    type: [CreatePostbookDto],
    example: [
      {
        id: 1,
        title: 'Harry Potter e la Pietra Filosofale',
        author: 'J.K. Rowling',
        ISBN: '9788877827021',
      },
      {
        id: 2,
        title: 'Cronache del ghiaccio e del fuoco - Il Trono di Spade',
        author: 'George R.R. Martin',
        ISBN: '9788804644124',
      },
    ],
    description: 'Elenco dei libri da aggiornare',
  })
  postbooks: UpdatePostbookWithIdDto[];
}
