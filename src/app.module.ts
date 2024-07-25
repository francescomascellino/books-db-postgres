import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './resources/book/book.module';
import { UserModule } from './resources/user/user.module';
import { AuthModule } from './resources/auth/auth.module';
import { PostbookModule } from './resources/postbook/postbook.module';
import { Postbook } from './resources/postbook/entities/postbook.entity';
import { PostuserModule } from './resources/postuser/postuser.module';
import { Postuser } from './resources/postuser/entities/postuser.entity';
import { PostuserPostbookModule } from './resources/postuser_postbook/postuser_postbook.module';
import { PostuserPostbook } from './resources/postuser_postbook/entities/postuser_postbook.entity';
import { PostauthModule } from './resources/postauth/postauth.module';

@Module({
  imports: [
    // Vecchia connessione
    /* MongooseModule.forRoot(
      'mongodb://mongouser:mongopassword@localhost:27017/test-db?authMechanism=SCRAM-SHA-1&authSource=admin'),
    */

    // Inizializza il modulo di configurazione e rende globali le variabili dei file di ambiente
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      // E' buona prassi importare ConfigModule anche se è globale per garantire sia disponibile nelle configurazioni asicrone
      imports: [ConfigModule],
      // useFactory è una funzione che accetta ConfigService come parametro e restituisce un oggetto di configurazione
      useFactory: async (configService: ConfigService) => ({
        // configService.get<string>('MONGODB_USER') ..ecc: utilizza ConfigService per leggere le variabili di ambiente definite nel file .env
        uri: `mongodb://${configService.get<string>('MONGODB_USER')}:${configService.get<string>('MONGODB_PASSWORD')}@${configService.get<string>('MONGODB_HOST')}:${configService.get<string>('MONGODB_PORT')}/${configService.get<string>('MONGODB_DATABASE')}?authMechanism=SCRAM-SHA-1&authSource=admin`,
      }),

      // Inietta ConfigService nella funzione useFactory
      inject: [ConfigService],
    }),

    // Configurazione PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: +configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [Postbook, Postuser, PostuserPostbook],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    BookModule,
    UserModule,
    AuthModule,
    PostbookModule, // Modulo entity book in PostgreSQL
    PostuserModule, // Modulo entity user in PostgreSQL
    PostuserPostbookModule, // Modulo entity user - book in PostgreSQL
    PostauthModule, // Modulo entity auth in PostgreSQL
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
