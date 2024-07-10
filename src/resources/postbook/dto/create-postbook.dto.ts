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
  title: string;

  @IsString()
  @MinLength(3, { message: 'Author must have at least 2 characters.' })
  @IsNotEmpty({ message: 'Author can not be ampty.' })
  author: string;

  @IsString()
  @MinLength(13, { message: 'ISBN must have 13 characters.' })
  @IsNotEmpty({ message: 'ISBN can not be ampty.' })
  ISBN: string;

  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;

  @IsNumber()
  @IsOptional()
  loaned_to?: number;
}
