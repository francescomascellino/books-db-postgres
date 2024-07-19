import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Prop } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsStrongPassword,
  IsEnum,
} from 'class-validator';
import { RoleEnum } from 'src/resources/enum/role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty({
    example: 'Mario',
    description: "Nome dell'utente registrato",
  })
  name?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty({
    example: 'Rossi',
    description: "Cognome dell'utente",
  })
  surname?: string;

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

  @IsString()
  @IsEnum(RoleEnum)
  @ApiPropertyOptional({
    example: 'user',
    description: "Ruolo dell'utente",
  })
  @Prop({ enum: Object.values(RoleEnum), default: RoleEnum.USER })
  role: string;
}
