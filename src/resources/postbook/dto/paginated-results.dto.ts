import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Postbook } from '../entities/postbook.entity';
import { OrderEnum } from 'src/resources/enum/order.enum';
import { Type } from 'class-transformer';

export class PaginationLinksDto {
  @IsString()
  readonly first: string; // Link alla prima pagina

  @IsString()
  readonly prev: string | null; // Link alla pagina precedente

  @IsString()
  readonly next: string | null; // Link alla pagina successiva

  @IsString()
  readonly last: string; // Link all'ultima pagina

  @IsBoolean()
  readonly hasPreviousPage: boolean; // Indica la presenza di una pagina precedente

  @IsBoolean()
  readonly hasNextPage: boolean; // Indica la presenza di una pagina successiva

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
  readonly data: Postbook[];

  @Type(() => Number)
  @IsInt()
  readonly total: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly pageSize: number;

  @Type(() => Number)
  @IsInt()
  readonly totalPages: number;

  @IsEnum(OrderEnum)
  @IsOptional()
  readonly order: OrderEnum;

  links: PaginationLinksDto;

  /**
   * Costruttore per PaginatedResultsDto.
   * @param data Array di elementi Postbook.
   * @param total Numero totale di elementi.
   * @param page Numero della pagina corrente.
   * @param pageSize Numero di elementi per pagina.
   * @param order L'ordine con cui vengono elencati gli elementi.
   * @param links Oggetto PaginationLinksDto contenente i link di navigazione.
   */
  constructor(
    data: Postbook[] = [],
    total: number = 0,
    page: number = 1,
    pageSize: number = 10,
    order: OrderEnum = OrderEnum.ASC,
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
    this.pageSize = pageSize > 50 ? 50 : 10;
    this.totalPages = Math.ceil(total / pageSize);
    this.order = order;
    this.links = links;
  }
}
