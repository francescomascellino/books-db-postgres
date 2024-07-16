import { ValidateNested } from 'class-validator';
import { Postbook } from '../entities/postbook.entity';

export class PaginationLinksDto {
  first: string;
  prev: string | null;
  next: string | null;
  last: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;

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
    /*     first: string,
    prev: string | null,
    next: string | null,
    last: string, */
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
  data: Postbook[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
      //'', // first
      //null, // prev
      //null, // next
      //'', // last
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
