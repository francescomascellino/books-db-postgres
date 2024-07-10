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
  @MinLength(2)
  @IsNotEmpty()
  title: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  author: string;

  @IsString()
  @MinLength(13)
  @IsNotEmpty()
  ISBN: string;

  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;

  @IsNumber()
  @IsOptional()
  loaned_to?: number;
}
