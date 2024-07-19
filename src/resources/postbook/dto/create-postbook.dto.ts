import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  MinLength,
} from 'class-validator';

export class CreatePostbookDto {
  @IsString()
  @MinLength(2, { message: 'Title must have at least 2 characters.' })
  @IsNotEmpty({ message: 'Title can not be ampty.' })
  @ApiProperty({
    example: 'Il Signore degli Anelli',
    description: 'Il titolo del libro',
  })
  title: string;

  @IsString()
  @MinLength(3, { message: 'Author must have at least 2 characters.' })
  @IsNotEmpty({ message: 'Author can not be ampty.' })
  @ApiProperty({
    example: 'J.R.R. Tolkien',
    description: 'Autore del libro',
  })
  author: string;

  @IsString()
  @MinLength(13, { message: 'ISBN must have 13 characters.' })
  @IsNotEmpty({ message: 'ISBN can not be ampty.' })
  // @IsISBN()
  @ApiProperty({
    example: '9781234567890',
    description: 'ISBN del libro',
  })
  ISBN: string;

  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;

  @IsNumber()
  @IsOptional()
  loaned_to?: number;
}
