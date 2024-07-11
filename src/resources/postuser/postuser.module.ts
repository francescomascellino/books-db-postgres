import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostuserService } from './postuser.service';
import { PostuserController } from './postuser.controller';
import { Postuser } from './entities/postuser.entity';
import { PostbookModule } from '../postbook/postbook.module';
import { PostuserPostbook } from '../postuser_postbook/entities/postuser_postbook.entity';
import { Postbook } from '../postbook/entities/postbook.entity';
import { PostuserPostbookModule } from '../postuser_postbook/postuser_postbook.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Postbook, PostuserPostbook]),
    forwardRef(() => PostbookModule),
    forwardRef(() => PostuserPostbookModule),
  ],

  controllers: [PostuserController],
  providers: [PostuserService],
  exports: [TypeOrmModule.forFeature([Postuser])],
})
export class PostuserModule {}
