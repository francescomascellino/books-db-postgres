import { PartialType } from '@nestjs/mapped-types';
import { CreatePostbookDto } from './create-postbook.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class UpdatePostbookDto extends PartialType(CreatePostbookDto) {
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
}
