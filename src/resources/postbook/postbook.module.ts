import { Module } from '@nestjs/common';
import { PostbookService } from './postbook.service';
import { PostbookController } from './postbook.controller';

@Module({
  controllers: [PostbookController],
  providers: [PostbookService],
})
export class PostbookModule {}
