import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Postbook } from '../entities/postbook.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationLinksDto {
  @IsString()
  @ApiProperty({
    example: 'http://localhost:3000/postbooks/paginate?page=1&pageSize=10',
    description: 'Link alla prima pagina',
  })
  first: string; // Link alla prima pagina

  @IsString()
  @ApiProperty({
    example: 'http://localhost:3000/postbooks/paginate?page=1&pageSize=10',
    description: 'Link alla pagina precedente',
  })
  prev: string | null; // Link alla pagina precedente

  @IsString()
  @ApiProperty({
    example: 'http://localhost:3000/postbooks/paginate?page=2&pageSize=10',
    description: 'Link alla pagina successiva',
  })
  next: string | null; // Link alla pagina successiva

  @IsString()
  @ApiProperty({
    example: 'http://localhost:3000/postbooks/paginate?page=3&pageSize=10',
    description: "Link all'ultima pagina",
  })
  last: string; // Link all'ultima pagina

  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Indica la presenza di una pagina precedente',
  })
  hasPreviousPage: boolean; // Indica la presenza di una pagina precedente

  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Indica la presenza di una pagina successiva',
  })
  hasNextPage: boolean; // Indica la presenza di una pagina successiva

  /**
   * Costruttore per PaginationLinksDto.
   * @param page Numero della pagina corrente.
   * @param totalPages Numero totale di pagine.
   * @param pageSize Numero di elementi per pagina.
   * @param baseUrl Base URL per costruire i link di paginazione.
   */
  constructor(
    page: number,
    totalPages: number,
    pageSize: number,
    baseUrl: string,
  ) {
    this.first = `${baseUrl}?page=1&pageSize=${pageSize}`;
    (this.prev =
      page > 1 ? `${baseUrl}?page=${page - 1}&pageSize=${pageSize}` : null),
      (this.next =
        page < totalPages
          ? `${baseUrl}?page=${page + 1}&pageSize=${pageSize}`
          : null);
    this.last = `${baseUrl}?page=${totalPages}&pageSize=${pageSize}`;
    this.hasPreviousPage = page > 1;
    this.hasNextPage = page < totalPages;
  }
}

export class PaginatedResultsDto {
  @ValidateNested({ each: true })
  @ApiProperty({
    type: [Postbook],
    example: [
      {
        title: 'Il Signore degli Anelli',
        author: 'J.R.R. Tolkien',
        ISBN: '978-0-618-15600-1',
        loaned_to: {
          _id: '66605031a9a8d2847d5b85d5',
          name: 'Mario',
        },
      },
    ],
    description: 'Elenco dei libri',
  })
  data: Postbook[];

  @ApiProperty({
    example: 22,
    description: 'Il numero totale di elementi trovati',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'La pagina corrente',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Numero di elementi per pagina',
  })
  pageSize: number;

  @ApiProperty({
    example: 3,
    description: 'Numero totale di pagine',
  })
  totalPages: number;

  @ApiProperty({
    description: 'Link di navigazione tra le pagine',
  })
  links: PaginationLinksDto;

  /**
   * Costruttore per PaginatedResultsDto.
   * @param data Array di elementi Postbook.
   * @param total Numero totale di elementi.
   * @param page Numero della pagina corrente.
   * @param pageSize Numero di elementi per pagina.
   * @param links Oggetto PaginationLinksDto contenente i link di navigazione.
   */
  constructor(
    data: Postbook[] = [],
    total: number = 0,
    page: number = 1,
    pageSize: number = 10,
    links: PaginationLinksDto = new PaginationLinksDto(
      1, // page
      1, // totalPages
      10, // pageSize
      '', // baseUrl
    ),
  ) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / pageSize);
    this.links = links;
  }
}
