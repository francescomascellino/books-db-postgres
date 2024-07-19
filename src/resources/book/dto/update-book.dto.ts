import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  @ApiProperty({
    example: 'Il Signore degli Anelli',
    description: 'Il titolo del libro',
  })
  public title: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @ApiProperty({
    example: 'J.R.R. Tolkien',
    description: 'Autore del libro',
  })
  public author: string;

  @IsString()
  @MinLength(13)
  @IsNotEmpty()
  // @IsISBN()
  @ApiProperty({
    example: '9781234567890',
    description: 'ISBN del libro',
  })
  public ISBN: string;
}
