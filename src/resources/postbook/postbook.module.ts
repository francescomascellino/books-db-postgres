import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostbookService } from './postbook.service';
import { PostbookController } from './postbook.controller';
import { Postbook } from './entities/postbook.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Postbook])],
  controllers: [PostbookController],
  providers: [PostbookService],
})
export class PostbookModule {}
