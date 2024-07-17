import { BadRequestException } from '@nestjs/common';
import { PaginationLinksDto } from '../postbook/dto/paginated-results.dto';
import { Request } from 'express';

export async function uniqueConstraintCheck(error: any, message: string) {
  if (error.code === '23505') {
    return new BadRequestException(message);
  }
}

/**
 * Crea i link di paginazione basati sul numero di pagina corrente, il numero totale di pagine e il numero di elementi per pagina.
 * @param page Numero della pagina corrente.
 * @param totalPages Numero totale di pagine.
 * @param pageSize Numero di elementi per pagina.
 * @param request Oggetto Request da cui estraremmo il Base URL per costruire i link di paginazione.
 * @returns Oggetto PaginationLinksDto contenente i link di navigazione.
 */
export function createPagLinks(
  page: number,
  totalPages: number,
  pageSize: number,
  // baseUrl: string,
  request: Request,
): PaginationLinksDto {
  // Manipoliamo l'oggetto request e assegniamo i dati interessati alla costante baseUrl
  // request.originalUrl.split('?') divide la stringa  in due parti, la prima parte è il path (/postbooks/paginat), la seconda è la query string (page=3&pageSize=10).
  // Di questo questo array ci serve il dato all'indice 0., quindi prendiamo request.originalUrl.split('?')[0]
  const baseUrl = `${request.protocol}://${request.get('host')}${request.originalUrl.split('?')[0]}`;
  console.log(`baseUrl: ${baseUrl}`);
  console.log(`originalUrl: ${request.originalUrl.split('?')[0]}`);
  return new PaginationLinksDto(page, totalPages, pageSize, baseUrl);
}
