import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostbookService } from './postbook.service';
import { PostbookController } from './postbook.controller';
import { Postbook } from './entities/postbook.entity';
import { Postuser } from '../postuser/entities/postuser.entity';
import { PostuserModule } from '../postuser/postuser.module';
import { PostuserPostbook } from '../postuser_postbook/entities/postuser_postbook.entity';
import { PostuserPostbookModule } from '../postuser_postbook/postuser_postbook.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Postbook, Postuser, PostuserPostbook]),
    forwardRef(() => PostuserModule),
    forwardRef(() => PostuserPostbookModule),
  ],
  controllers: [PostbookController],
  providers: [PostbookService],
  exports: [TypeOrmModule.forFeature([Postbook, Postuser])],
})
export class PostbookModule {}
