import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RoleEnum } from 'src/resources/enum/role.enum';

export class CreatePostuserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty({
    example: 'Mario',
    description: "Nome dell'utente registrato",
  })
  name?: string;

  // @IsString()
  // @MinLength(3)
  // @MaxLength(50)
  // @ApiProperty({
  //   example: 'Rossi',
  //   description: "Cognome dell'utente",
  // })
  // surname?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  @ApiProperty({
    example: 'Admin',
    description: "Username dell'utente",
  })
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @IsNotEmpty()
  @IsStrongPassword()
  @ApiProperty({
    description: "Password dell'Utente",
  })
  password!: string;

  books_on_loan?: string[];

  @IsString()
  @IsEnum(RoleEnum)
  @ApiPropertyOptional({
    example: 'user',
    description: "Ruolo dell'utente",
    enum: RoleEnum,
    default: RoleEnum.USER,
  })
  role: RoleEnum = RoleEnum.USER;

  public constructor(opts?: Partial<CreatePostuserDto>) {
    Object.assign(this, opts);
  }
}
