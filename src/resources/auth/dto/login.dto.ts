import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  @ApiProperty({
    example: 'Admin',
    description: "Username dell'utente registrato",
  })
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @IsNotEmpty()
  @ApiProperty({
    description: "Password dell'Utente registrato",
  })
  password: string;
}
