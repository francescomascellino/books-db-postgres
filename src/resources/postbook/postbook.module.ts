import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostbookService } from './postbook.service';
import { PostbookController } from './postbook.controller';
import { Postbook } from './entities/postbook.entity';
import { PostuserPostbook } from '../postuser_postbook/entities/postuser_postbook.entity';
import { PostuserPostbookModule } from '../postuser_postbook/postuser_postbook.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Postbook, PostuserPostbook]),
    forwardRef(() => PostuserPostbookModule),
  ],
  controllers: [PostbookController],
  providers: [PostbookService],
  exports: [TypeOrmModule.forFeature([Postbook])],
})
export class PostbookModule {}
