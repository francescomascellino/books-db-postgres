import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostuserService } from './postuser.service';
import { PostuserController } from './postuser.controller';
import { Postuser } from './entities/postuser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Postuser])],
  controllers: [PostuserController],
  providers: [PostuserService],
})
export class PostuserModule {}
