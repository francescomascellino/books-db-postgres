import { forwardRef, Module } from '@nestjs/common';
import { PostauthService } from './postauth.service';
import { PostauthController } from './postauth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PostJwtStrategy } from '../auth/strategies/postJwt.strategy';
import { PostuserModule } from '../postuser/postuser.module';

@Module({
  imports: [
    forwardRef(() => PostuserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  controllers: [PostauthController],
  providers: [PostauthService, PostJwtStrategy],
  exports: [PostauthService],
})
export class PostauthModule {}
