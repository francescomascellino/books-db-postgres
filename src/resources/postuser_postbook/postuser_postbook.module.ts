import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostuserPostbookService } from './postuser_postbook.service';
import { PostuserPostbookController } from './postuser_postbook.controller';
import { PostuserPostbook } from './entities/postuser_postbook.entity';
import { Postuser } from '../postuser/entities/postuser.entity';
import { Postbook } from '../postbook/entities/postbook.entity';
import { PostuserModule } from '../postuser/postuser.module';
import { PostbookModule } from '../postbook/postbook.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Postbook, Postuser, PostuserPostbook]),
    forwardRef(() => PostuserModule),
    forwardRef(() => PostbookModule),
  ],
  controllers: [PostuserPostbookController],
  providers: [PostuserPostbookService],
  exports: [TypeOrmModule.forFeature([PostuserPostbook])],
})
export class PostuserPostbookModule {}
