import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateBookDto {
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
  @ApiProperty({
    example: '9781234567890',
    description: 'ISBN del libro',
  })
  public ISBN: string;

  @ApiProperty({
    example: {
      _id: '66605031a9a8d2847d5b85d5',
      name: 'Mario',
    },
    description: 'Utente a cui è stato prestato il libro',
  })
  public loaned_to?: string; // vogliamo che tutti i campi siano obbligatori alla creazione di un libro tranne loaned_to

  /* public constructor(opts: {
    title: string;
    author: string;
    ISBN: string;
    loaned_to: string;
  }) {
    this.title = opts.title;
    this.author = opts.author;
    this.ISBN = opts.ISBN;
    this.loaned_to = opts.loaned_to;
  } */
  public constructor(opts?: Partial<CreateBookDto>) {
    Object.assign(this, opts);
  }
}
