import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostuserPostbookService } from './postuser_postbook.service';
import { PostuserPostbookController } from './postuser_postbook.controller';
import { PostuserPostbook } from './entities/postuser_postbook.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostuserPostbook])],
  controllers: [PostuserPostbookController],
  providers: [PostuserPostbookService],
})
export class PostuserPostbookModule {}
