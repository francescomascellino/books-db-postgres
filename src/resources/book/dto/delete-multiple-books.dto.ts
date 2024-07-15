import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class DeleteMultipleBooksDto {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    example: [
      {
        bookIds: ['66605047a9a8d2847d5b85d6', '6669a48fbb5e7f44fed60cc3'],
      },
    ],
    description: 'Elenco dei libri da eliminare',
  })
  bookIds: string[];
}
