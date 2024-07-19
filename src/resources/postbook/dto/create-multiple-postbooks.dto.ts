import { Type } from 'class-transformer';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { CreatePostbookDto } from './create-postbook.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMultiplePostbooksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePostbookDto)
  @ApiProperty({
    type: [CreatePostbookDto],
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
  postbooks: CreatePostbookDto[];
}
