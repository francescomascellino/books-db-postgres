<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Setup
```bash
$ npm i -g @nestjs/cli # se non hai ancora installato Nest
$ nest new [project-name]
```
## Creare Resources
```bash
npm g resources/book
```
Genera i files delle risorse (moduli, servizi, controller) per il modello "Book" in ***src/resources/book/***

Creare il file schema in ***src/resources/book/schemas/book.schema.ts***

## Installare le dipendenze per l'itegrazione con MongoDB
```bash
npm i @nestjs/mongoose mongoose
```

Importare MongooseModule in AppModule
***src/app.module.ts***
```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; //Importare MongooseModule in AppModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './resources/book/book.module';
import { UserModule } from './resources/user/user.module';

@Module({
  imports: [

      // Definire la stringa connessione al DB
      MongooseModule.forRoot(
      'mongodb://mongouser:mongopassword@localhost:27017/test-db?authMechanism=SCRAM-SHA-1&authSource=admin'
      ),

      BookModule,
      UserModule,
    ],
    controllers: [AppController],
    providers: [AppService],
  })
export class AppModule {}
```
## Definire lo Schema
***src/resources/book/schemas/book.schema.ts***
```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BookDocument = HydratedDocument<Book>;

@Schema()
export class Book {
  @Prop({ required: true, maxlength: 50, minlength: 3, type: String })
  public title!: string;

  @Prop({ required: true, maxlength: 50, minlength: 3, type: String })
  public author!: string;

  @Prop({ required: true, maxlength: 50, minlength: 3, type: String })
  public ISBN!: string;

  @Prop({ type: [String], maxlength: 50, minlength: 3 })
  public loaned_to!: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
```
***HydratedDocument<Book>*** rappresenta un documento Book di Mongoose completamente funzionale, che include sia le proprietà del modello Book che i metodi e le funzionalità di Mongoose per l'interazione con il database.
https://docs.nestjs.com/techniques/mongodb

## Importare MongooseModule
L'import dello Schema e della classe Book viene utilizzato per definire uno schema Mongoose per l'entità Book all'interno dell'applicazione.
In questo caso lo scope dell'importazione di Book sarà solo interno a BookModule.
Dobbiamo esportarlo e importarlo per renderlo disponibile altrove

***src/resources/book/book.module.ts***
```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // Importiamo MongooseModule
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { Book, BookSchema } from './schemas/book.schema'; // Importiamo lo Schema

@Module({
  // Importa il modulo MongooseModule e definisce uno schema per l'entità Book, utilizzando il nome e lo schema forniti.
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
  ],

  controllers: [BookController],
  providers: [BookService],

  // Se volessimo esportare MongooseModule di Book per renderlo disponibile altrove.
  // exports: [MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }])],
})
export class BookModule {}
```

Importando BookModule in un altro modulo avremo disponibli le esportazioni dichiarate:
```ts
// ESEMPIO
import { Module } from '@nestjs/common';
import { BookModule } from './book.module';

@Module({
  imports: [
    BookModule, // Importa BookMule, che include il MongooseModule
    // Ecc
  ],
  // Ecc
})
export class EsempioModule {}
```

## DTO
Un DTO è un Data Transfer Object utilizzato per trasferire dati tra servizi o risorse. 
Un DTO è un oggetto che definisce come i dati verranno inviati sulla rete.

***src/resources/book/dto/create-book.dto.ts***
Definisce la classe che verrà utilizzata quando creeremo un nuovo oggetto book da inviare come documento al db
```ts
export class CreateBookDto {
  public title: string;

  public author: string;

  public ISBN: string;

  public loaned_to?: string; // vogliamo che tutti i campi siano obbligatori alla creazione di un libro tranne loaned_to

  public constructor(opts: {
    title: string;
    author: string;
    ISBN: string;
    loaned_to: string;
  }) {
    this.title = opts.title;
    this.author = opts.author;
    this.ISBN = opts.ISBN;
    this.loaned_to = opts.loaned_to;
  }
}
```
***src/resources/book/dto/update-book.dto.ts***
Definisce la classe che verrà utilizzata quando aggiorneremo un nuovo oggetto book da inviare come documento al db 
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';

export class UpdateBookDto extends PartialType(CreateBookDto) {}
```
***PartialType(CreateBookDto)*** è una funzione di NestJS che viene utilizzata per creare un tipo parziale a partire da un DTO esistente.
Questo significa che il nuovo tipo conterrà tutti i campi del DTO originale, ma ognuno di essi sarà reso opzionale.
https://github.com/francescomascellino/nest-basics?tab=readme-ov-file#dto

## Definire i metodi del servizio:

***src/resources/book/book.service.ts***
```ts
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookDocument } from './schemas/book.schema';

@Injectable()
export class BookService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  async create(createBookDto: CreateBookDto) {
    console.log(`Create new Book`);

    const newBook = new this.bookModel(createBookDto);

    return await newBook.save();
  }

  // Specifichiamo che la promise che si aspettiamo è di tipo BookDocument (HydratedDocument<Book>)
  async findAll(): Promise<BookDocument[]> {
    console.log('Find all Books');

    const books = await this.bookModel.find().exec();

    return books;
  }

  async findOne(id: string): Promise<BookDocument> {
    console.log(`Find One. Book ID: ${id}`);

    const book = await this.bookModel.findById(id).exec();

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    console.log(`Found "${book.title}"`);

    return book;
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<BookDocument> {
    console.log(`Update One. Book ID: ${id}`);

    // Cerca il libro da aggiornare nel database
    const bookToUpdate = await this.bookModel.findById(id).exec();

    if (!bookToUpdate) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // Verifica se l'ISBN nel DTO è diverso da quello attuale e se è già utilizzato da un altro libro
    if (updateBookDto.ISBN && updateBookDto.ISBN !== bookToUpdate.ISBN) {
      const existingBook = await this.bookModel
        .findOne({ ISBN: updateBookDto.ISBN })
        .exec();

      if (existingBook._id.toString() !== id) {
        throw new BadRequestException(
          `ISBN ${updateBookDto.ISBN} already in use by another Book`,
        );
      }
    }

    const book = await this.bookModel
      .findByIdAndUpdate(id, updateBookDto, { new: true })
      .exec();

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async loanedBooks(): Promise<BookDocument[]> {
    console.log(`Find all loaned Books`);

    const loanedBooks = await this.bookModel
      .find({ loaned_to: { $ne: [] } })
      .exec();

    return loanedBooks;
  }

  async availableBooks(): Promise<BookDocument[]> {
    return this.bookModel.find({ loaned_to: { $size: 0 } }).exec();
  }
}
```

## Definire le rotte nel controller

***src/resources/book/book.controller.ts***
```ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookDocument } from './schemas/book.schema';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()

  // Ci aspettiamo un oggetto CreateBookDto nel corpo della richiesta
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()

  // Ci aspettiamo un array di documenti BookDocument come Promise
  async findAll(): Promise<BookDocument[]> {
    return this.bookService.findAll();
  }

  // Gli endpoint personalizzati vanno definiti prima di quelli che richiedono un id per evitare conflitti
  @Get('loaned')
  getLoanedBooks(): Promise<BookDocument[]> {
    return this.bookService.loanedBooks();
  }

  @Get('available')
  async getAvailableBooks(): Promise<BookDocument[]> {
    return this.bookService.availableBooks();
  }

  @Get(':id')

  // Restituisce una Promise che contiene un documento BookDocument corrispondente all'ID fornito.
  findOne(@Param('id') id: string): Promise<BookDocument> {
    return this.bookService.findOne(id);
  }

  // Aggiorna un documento BookDocument con l'ID fornito come parametro
  @Patch(':id')
  
  // Utilizza i dati forniti nell'oggetto UpdateBookDto nel corpo della richiesta.
  update(
    @Param('id') id: string,

    // Ci aspettiamo un oggetto UpdateBookDto nel corpo della richiesta
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<BookDocument> {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<BookDocument> {
    return this.bookService.remove(id);
  }
}
```

## @nestjs/config e process.env

Installare le dipendenze necessarie:
```bash
npm install @nestjs/config
npm install dotenv // Solitamente è già installato
```
Creare un file .env
```js
MONGODB_USER=[username]
MONGODB_PASSWORD=[password]
MONGODB_HOST=localhost
MONGODB_PORT=[port]
MONGODB_DATABASE=[db name]
```

Modificare AppModule

***src/app.module.ts***
```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importare ConfigModule e ConfigService
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './resources/book/book.module';
import { UserModule } from './resources/user/user.module';

@Module({
  imports: [

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

    BookModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Query con riferimento a campi popolati usando altri modelli

In questo caso vogliamo che quando effettuiamo la query per ottenere i libri in affitto, riceviamo nella response anche il nome dell'utente oltre al suo ID.

Come primo passaggio dobbiamo esportare il MongooseModule di User per renderlo disponibile

***src//resources/user/user.module***
```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],

  controllers: [UserController],
  providers: [UserService],
  exports: [

    // Esporta il MoongoseModule di User per renderlo disponibile
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class UserModule {}
```
Importiamo in BookModule il nostro UserModule (che ora esporta il Modello e lo Schema di User)

***src/resources/book/book.module.ts***
```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { Book, BookSchema } from './schemas/book.schema';

// Importiamo UserModule
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),

    // Importa il modulo di user per averlo a disposizione
    UserModule,
  ],

  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
```
Successivamente aggiungiamo i dovuti riferimenti nello schema di Book.

***src/resources/book/schemas/book.schema.ts***
```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// Importiamo il nostro modello
import { User } from 'src/resources/user/schemas/user.schema';

export type BookDocument = HydratedDocument<Book>;

@Schema()
export class Book {

  // Altre Prop

  // User.name è una proprietà del modello User che contiene il nome del modello.
  // ref: User.name dice a Mongoose che il campo a cui è applicato fa riferimento al modello User
  @Prop({ type: Types.ObjectId, ref: User.name })
  loaned_to: Types.ObjectId;
}

export const BookSchema = SchemaFactory.createForClass(Book);
```

Dopodichè nel BookService importiamo il modello di User che abbiamo a disposizione poiché è stato importato nel nostro BookModule e definiamo il metodo
```ts
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookDocument } from './schemas/book.schema';

// Importiamo il modello di User e il suo Schema
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,

    // Iniettiamo il modello user che abbiamo reso disponibile in UserModule e importato in BookModule
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Altre CRUD e Query

  async loanedBooks(): Promise<BookDocument[]> {
    console.log(`Find all loaned Books`);

    const loanedBooks = await this.bookModel
      // Cerca i campo loaned_to not equal a [] (array vuoto)
      .find({ loaned_to: { $ne: [] } })

      // Popola il campo loaned_to con il campo name trovato nel documento a cui fa riferimento l'id (loaned_to è un type: Types.ObjectId, ref: User.name).
      // .populate('loaned_to', 'name')
      .populate({
        path: 'loaned_to',
        select: 'name',
        model: 'User',
      })
      .exec();

    return loanedBooks;
  }
}
```

In questo modo la response all'endpoint ***http://localhost:[port]/book/loaned***
dovrebbe essere:
```json
[
    {
        "_id": "66605047a9a8d2847d5b85d6",
        "ISBN": "9781234567890",
        "title": "Il Signore degli Anelli",
        "author": "J.R.R. Tolkien",
        "loaned_to": {
            "_id": "66605031a9a8d2847d5b85d5",
            "name": "Mario Rossi"
        }
    }
]
```

## Evitare le dipendenze circolari

Quando due modelli si richiamano a vicenda si possono incontrare problemi di dipendenza circolare.
E' possibile evitarli riferendosi al modello usando una stringa nello schema:

***src/resources/book/schemas/user.schema.ts***
```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, maxlength: 50, minlength: 3, type: String })
  name: string;

  
  // Usiamo la stringa 'Book' per fare riferimento al modello
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }] })
  // books_on_loan è un array di tipo Types.ObjectId di Books
  books_on_loan: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
```

e importando il modulo usando forwardRef().

forwardRef() è una funzione fornita da NestJS che risolve il problema della dipendenza ciclica nei moduli.

Quando due moduli dipendono l'uno dall'altro, ad esempio, se il BookModule dipende dal UserModule e viceversa, ci sarà un errore di dipendenza ciclica.

Invece di importare direttamente il UserModule all'interno del BookModule, utilizzando forwardRef() importeremo UserModule in modo "ritardato", permettendo a NestJS di gestire correttamente le dipendenze cicliche.

***src//resources/user/user.module***
```ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { BookModule } from '../book/book.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // Importa il modulo di user per averlo a disposizione
    forwardRef(() => BookModule), // Usa forwardref
  ],

  controllers: [UserController],
  providers: [UserService],
  exports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class UserModule {}
```

Sucessivamente possiamo definire nel servizio il metodo, specificando i dettagli da popolare usando il modello importato:

***src/resources/user/user.service.ts***
```ts
async findAll(): Promise<UserDocument[]> {
    console.log('Find all Users');

    const books = await this.bookModel.find().exec();

    console.log(books);

    const users = await this.userModel
      .find()
      // Definiamo o dettagli da usare per popolare il campo
      .populate({
        path: 'books_on_loan',
        select: ['title', 'ISBN'],
        model: 'Book',
      })
      .exec();

    return users;
  }
```

PS: non abbiamo bisogno di iniettare il modello importato se non usato:

***src/resources/user/user.service.ts***
```ts
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,

    // Inietta il modello Book che abbiamo reso disponibile in UserModule e importato in BookModule
    // @InjectModel(Book.name) private bookModel: Model<BookDocument>,
  ) {}
```
la nostra response dovrebbe esere:
```json
[
    {
        "_id": "66605031a9a8d2847d5b85d5",
        "name": "Mario Rossi",
        "books_on_loan": [
            {
                "_id": "66605047a9a8d2847d5b85d6",
                "ISBN": "9781234567890",
                "title": "Il Signore degli Anelli"
            }
        ]
    }
]
```

# JWT e Validation

# 1. Installazione dei pacchetti necessari
Apri il terminale e installa i pacchetti necessari:
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
npm install --save-dev @types/passport-jwt @types/bcryptjs
```
Creiamo le risorse API senza CRUD
```bash
nest g resource resources/auth
```
# 2. Configurazione dell'autenticazione JWT
## 2.1 Creare i DTOs
Creiamo i DTOs per l'autenticazione:

***src/resources/auth/dto/login.dto.ts:***
```ts
export class LoginDto {
  username: string;
  password: string;
}
```

## 2.2 Creare il modulo Auth

***src/resources/auth/auth.module.ts:***
```ts
import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Senza ConfigService e variabili ambientali
    /* 
    JwtModule.register({
      secret: 'SECRET',
      signOptions: {
        expiresIn: '1h',
      },
    }),
     */

    // Con ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```
## 2.3 Creare il servizio Auth

Esportiamo UserService da ***src/resources/user/user.module.ts:***
```ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { BookModule } from '../book/book.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => BookModule),
  ],

  controllers: [UserController],
  providers: [UserService],
  exports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserService, // Esportiamo UserService
  ],
})
export class UserModule {}
```

Creiamo il servizio Auth

***src/resources/auth/auth.service.ts:***
```ts
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service'; // Importiamo UserService
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserDocument | null> {
    const user = await this.userService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: any) {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    const newUser = await this.userService.create({
      ...user,
      password: hashedPassword,
    });
    return newUser;
  }
}
```
## 2.4 Creare la strategia JWT

***src/resources/auth/strategies/jwt.strategy.ts:***
```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      // indica di estrarre il token dal campo dell'intestazione Authorization nel formato "Bearer <token>".
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // I token con una data di scadenza scaduta verranno rifiutati.
      ignoreExpiration: false,

      // La chiave segreta utilizzata per firmare e verificare i token JWT. Viene recuperata dal ConfigService
      secretOrKey: configService.get<string>('SECRET_KEY'),

      // Senza ConfigService
      // secretOrKey: 'yourSecretKey',
    });
  }

  async validate(payload: any) {
    // l metodo validate(payload: any) viene chiamato per convalidare il payload del token JWT. 
    // Questo metodo riceve il payload del token come argomento e restituisce un oggetto che rappresenta l'utente autenticato. 
    // Nel caso di questo esempio, restituisce un oggetto contenente l'ID dell'utente (userId) (payload.sub = payload.subject) e il nome utente (username) estratti dal payload del token.
    return { userId: payload.sub, username: payload.username };
  }
}
```
## 2.5 Creare il controller Auth

***src/resources/auth/auth.controller.ts:***
```ts
import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
```
# 3. Aggiornamento del modulo User
## 3.1 Aggiungere il campo password nel modello User

***src/resources/user/schemas/user.schema.ts:***
```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, maxlength: 50, minlength: 3, type: String })
  name: string;

  @Prop({ required: true, maxlength: 50, minlength: 3, type: String })
  surname: string;

  @Prop({ required: true, maxlength: 50, minlength: 3, type: String })
  username: string;

  @Prop({ required: true, maxlength: 100, minlength: 8, type: String })
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }] })
  books_on_loan: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
```
## 3.2 Aggiungere un metodo per trovare l'utente per username

***src/resources/user/user.service.ts:***
```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    console.log('Find all Users');

    const users = await this.userModel
      .find()
      .populate({
        path: 'books_on_loan',
        select: ['title', 'ISBN'],
        model: 'Book',
      })
      .exec();

    return users;
  }

  async findOne(id: string): Promise<UserDocument> {
    console.log(`Find One. User ID: ${id}`);

    const user = await this.userModel
      .findById(id)
      .populate({
        path: 'books_on_loan',
        select: ['title', 'ISBN'],
        model: 'Book',
      })
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    console.log(`Found "${user.name}"`);

    return user;
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    console.log(`Find by Username. Username: ${username}`);
    return this.userModel.findOne({ username }).exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    console.log(`Update One. User ID:${id}`);

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);
      updateUserDto.password = hashedPassword;
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
```
## 3.3 Creare il DTO per la creazione dell'utente e Validazione

Installiamo le dipendenze di validazione
```bash
npm install class-validator class-transformer
```

Modifichiamo il DTO per la creazione dell'Utente
***src/resources/user/dto/create-user.dto.ts:***
```ts
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  surname?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @IsNotEmpty()
  password!: string;

  books_on_loan?: string[];

  public constructor(opts?: Partial<CreateUserDto>) {
    Object.assign(this, opts);
  }
}
```

Abilitiamo la validazione globale
***src/main.ts:***
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      // I payload sono oggetti JS. Abilitiamo la trasformazione automatica globale per tipicizzare questi oggetti in base alla loro classe DTO
      transform: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
```

# 4. Aggiungere la protezione con JWT
## 4.1 Proteggere i route con il guardiano JWT

Creiamo il file ***src/resources/auth/guards/jwt-auth.guard.ts:***
```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```
## 4.2 Usare il guardiano JWT nei controller
Esempio di protezione del controller User:

***src/resources/user/user.controller.ts:***
```ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard) // Usiamo il Guardiano
  @Get()
  findAll(): Promise<UserDocument[]> {
    return this.userService.findAll();
  }

  // Altri metodi
}
```
# 5. Aggiornamento del modulo principale
Infine, aggiorna il modulo principale per includere AuthModule e UserModule.

***src/app.module.ts:***
```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './resources/book/book.module';
import { UserModule } from './resources/user/user.module';
import { AuthModule } from './resources/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get<string>('MONGODB_USER')}:${configService.get<string>('MONGODB_PASSWORD')}@${configService.get<string>('MONGODB_HOST')}:${configService.get<string>('MONGODB_PORT')}/${configService.get<string>('MONGODB_DATABASE')}?authMechanism=SCRAM-SHA-1&authSource=admin`,
      }),
      inject: [ConfigService],
    }),

    BookModule,
    UserModule,
    AuthModule, // Importiamo AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
# 6. Testare l'autenticazione
Per testare l'autenticazione, puoi utilizzare un client REST come Postman. Segui questi passaggi:

1. Registrare un nuovo utente:

**POST http://localhost:3000/user** (CREATE USER)

Body (JSON):
```json
{
  "username": "testuser",
  "password": "testpassword",
  "name": "Test User"
}
```
2. Ottenere un token JWT:

**POST http://localhost:3000/auth/login** (LOGIN)

Body (JSON):
```json
{
  "username": "testuser",
  "password": "testpassword"
}
```
3. Accedere a un endpoint protetto:

**GET http://localhost:3000/user** (GET All Users)

Header:
```makefile
Authorization: Bearer <your-jwt-token>
```

# Extra

## Soft Delete

Metodo per eliminare temporeaneamente

***src/resources/book/book.service.ts***
```ts
async softDelete(id: string): Promise<BookDocument> {
  // Trova il libro nel database
  const book = await this.bookModel.findById(id);

  // Verifica se il libro esiste
  if (!book) {
    throw new NotFoundException(`Book with ID ${id} not found`);
  }

  // Controlla se il libro è in prestito
  if (book.loaned_to) {
    throw new ConflictException(`Book with ID ${id} is currently on loan`);
  }

  // Soft delete del libro impostando is_deleted su true
  book.is_deleted = true;
  return await book.save();
}
```

***src/resources/book/book.controller.ts***
```ts
@UseGuards(JwtAuthGuard)
@Patch('delete/:id')
softDelete(@Param('id') id: string): Promise<BookDocument> {
  return this.bookService.softDelete(id);
}
```

## Restore

Per ripristinare elementi cancellati temporaneamente

***src/resources/book/book.service.ts***
```ts
async restore(id: string): Promise<BookDocument> {
  console.log(`Restore. Book ID: ${id}`);
  const book = await this.bookModel.findByIdAndUpdate(
    id,
    { is_deleted: false },
    { new: true },
  );
  if (!book) {
    throw new NotFoundException(`Book with ID ${id} not found`);
  }
  return book;
}
```

***src/resources/book/book.controller.ts***
```ts
@UseGuards(JwtAuthGuard)
@Patch('restore/:id')
restore(@Param('id') id: string): Promise<BookDocument> {
  return this.bookService.restore(id);
}
```

## Ottenere gli elementi nel cestino (Soft Deleted)

***src/resources/book/book.service.ts***
```ts
async getSoftDeleted(): Promise<BookDocument[]> {
  console.log('Find all Soft Deleted Books');

  const books = await this.bookModel
    .find({ is_deleted: true }) // Recupera solo gli elementi is_deleted
    .populate({
      path: 'loaned_to',
      select: 'name',
      model: 'User',
    })
    .exec();

  return books;
}
```

***src/resources/book/book.controller.ts***
```ts
// POSIZIONARE PRIMA DI GET BY ID
@UseGuards(JwtAuthGuard)
@Get('delete')
async getSoftDeleted(): Promise<BookDocument[]> {
  return this.bookService.getSoftDeleted();
}

@UseGuards(JwtAuthGuard)
@Get(':id')
findOne(@Param('id') id: string): Promise<BookDocument> {
  return this.bookService.findOne(id);
}
```
## Evitare che vengano mostrati elementi Softt Deleted

***src/resources/book/book.service.ts***
```ts
import { Model } from 'mongoose';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookDocument } from './schemas/book.schema';
import { UpdateMultipleBooksDto } from './dto/update-multiple-books.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,

  ) {}

  async findAll(): Promise<BookDocument[]> {
    console.log('Find all Books');

    const books = await this.bookModel
      .find({
        // Recupera solo i documenti in cui is_deleted ancora non esiste o è 'false'
        $or: [{ is_deleted: { $exists: false } }, { is_deleted: false }],
      })
      .populate({
        path: 'loaned_to',
        select: 'name',
        model: 'User',
      })
      .exec();

    return books;
  }

  async findOne(id: string): Promise<BookDocument> {
    console.log(`Find One. Book ID: ${id}`);

    const book = await this.bookModel
      .findById(id)
      // Recupera solo i documenti in cui is_deleted ancora non esiste o è 'false'
      .or([{ is_deleted: { $exists: false } }, { is_deleted: false }])
      .populate({
        path: 'loaned_to',
        select: 'name',
        model: 'User',
      })
      .exec();

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    console.log(`Found "${book.title}"`);

    return book;
  }

  async availableBooks(): Promise<BookDocument[]> {
    return this.bookModel
      .find({
        // Recupera solo i documenti in cui is_deleted ancora non esiste o è 'false'
        $or: [{ loaned_to: null }, { loaned_to: { $size: 0 } }],
      })
      .exec();
  }
}
```

## Eliminare più documenti contemporaneamente

***src/resources/book/dto/delete-multiple-books.dto.ts***
```ts
import { IsArray, IsString } from 'class-validator';

export class DeleteMultipleBooksDto {
  @IsArray()
  @IsString({ each: true })
  bookIds: string[];
}
```

***src/resources/book/book.service.ts***
```ts
/**
 * Rimuove più libri dal database.
 * Controlla se i libri esistono e se sono attualmente in prestito.
 *
 * @param bookIds Un array di ID di libri da eliminare.
 * @returns Una promessa che risolve un oggetto contenente due array:
 *          - `deletedBooks`: libri eliminati con successo
 *          - `errors`: errori riscontrati durante l'eliminazione dei libri
 */
async removeMultipleBooks(
  bookIds: string[],
): Promise<{ deletedBooks: BookDocument[]; errors: any[] }> {
  console.log(`Delete Multiple Books`);

  const deletedBooks = [];
  const errors = [];

  for (const bookId of bookIds) {
    try {
      const book = await this.bookModel.findById(bookId);

      if (!book) {
        errors.push({ bookId, error: `Book with ID ${bookId} not found` });
        continue;
      }

      if (book.loaned_to) {
        errors.push({
          bookId,
          error: `Book with ID ${bookId} is currently on loan`,
        });
        continue;
      }

      // Elimina fisicamente il libro dal database
      // await this.bookModel.findByIdAndDelete(bookId);

      // oppure:
      // Soft delete del libro
      book.is_deleted = true;

      deletedBooks.push(book);
    } catch (error) {
      errors.push({ bookId, error: error.message });
    }
  }

  console.log('Deleted Books:', deletedBooks);
  console.log('Errors:', errors);

  return { deletedBooks, errors };
}
```
***src/resources/book/book.controller.ts***
```ts
/**
 * Rimuove più libri dal database.
 * Questo metodo è protetto da autenticazione JWT.
 *
 * @param deleteMultipleBooksDto Un DTO che contiene un array di ID di libri da eliminare.
 * @returns Una promessa che risolve un oggetto contenente due array:
 *          - `deletedBooks`: libri eliminati con successo
 *          - `errors`: errori riscontrati durante l'eliminazione dei libri
 */
@UseGuards(JwtAuthGuard)
@Delete('bulk/delete')
removeMultiple(
  @Body() deleteMultipleBooksDto: DeleteMultipleBooksDto,
): Promise<{ deletedBooks: BookDocument[]; errors: any[] }> {
  return this.bookService.removeMultipleBooks(deleteMultipleBooksDto.bookIds);
}
```

Esempio body della request:
```json
{
    "bookIds": ["66605047a9a8d2847d5b85d6", "6669a48fbb5e7f44fed60cc3"]
}
```

## Creare più elementi contemporaneamente

***src/resources/book/dto/create-multiple-books.dto.ts***
```ts
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBookDto } from './create-book.dto';

export class CreateMultipleBooksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBookDto)
  books: CreateBookDto[];
}
```

***src/resources/book/book.service.ts***
```ts
/**
 * Verifica se un libro con un dato ISBN esiste nel database.
 * @param ISBN - Il codice ISBN del libro da verificare.
 * @returns Una promessa che restituisce true se il libro esiste, altrimenti false.
 */
private async checkISBN(ISBN: string): Promise<boolean> {
  const existingBook = await this.bookModel.findOne({ ISBN }).exec();
  // Restituisce true se esiste un libro con lo stesso ISBN, altrimenti false
  return !!existingBook;
}

/**
 * Crea più libri nel database.
 * @param createBookDtos - Un array di dati dei libri da creare.
 * @returns Una promessa che restituisce un array di documenti dei libri creati.
 */
async createMultipleBooks(
  createBookDtos: CreateBookDto[],
): Promise<{ createdBooks: BookDocument[]; errors: any[] }> {
  console.log('Create multiple Books');

  const createdBooks = [];
  const errors = [];

  try {
    for (const bookDto of createBookDtos) {
      // Verifica se un libro con lo stesso ISBN esiste già nel database
      if (await this.checkISBN(bookDto.ISBN)) {
        // Genera un messaggio di avviso
        console.log(
          `Book with ISBN ${bookDto.ISBN} already exists. Skipping...`,
        );
        messages.push({
          ISBN: `${bookDto.ISBN}`,
          message: `Book with ISBN ${bookDto.ISBN} already exists.`,
        });
        // Passa al prossimo libro
        continue;
      }

      const newBook = new this.bookModel(bookDto);
      const createdBook = await newBook.save();
      createdBooks.push(createdBook);
    }
  } catch (error) {
    console.error('Error creating books:', error);
    throw error;
  }

  return { createdBooks, errors };
}

// checkISBN() ci permette anche di migliorare metodi come update():
async update(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<BookDocument> {
    console.log(`Update One. Book ID: ${id}`);

    // Verifica se l'ISBN esiste già per un altro libro
    // Cerca se nel DB esiste un libro con lo stesso ISBN
    if (updateBookDto.ISBN && (await this.checkISBN(updateBookDto.ISBN))) {
      const existingBook = await this.bookModel
        .findOne({ ISBN: updateBookDto.ISBN })
        .exec();

      // Se l'id del libro esisente nel DB è diverso dall'id libro da aggiornare chestiamo ciclando, vuol dire che stiamo cercando di aggiornare l'ISBN del libro con un ISBN assegnato ad un altro libro esistente!
      if (existingBook._id.toString() !== id) {
        throw new BadRequestException(
          `ISBN ${updateBookDto.ISBN} already in use by another Book`,
        );
      }
    }

    const book = await this.bookModel
      .findByIdAndUpdate(id, updateBookDto, { new: true })
      .exec();

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }
```

***src/resources/book/book.controller.ts***
```ts
@UseGuards(JwtAuthGuard)
@Post('bulk/create')
createMultiple(
  @Body() createMultipleBooksDto: CreateMultipleBooksDto,
): Promise<{ createdBooks: BookDocument[]; errors: any[] }> {
  return this.bookService.createMultipleBooks(createMultipleBooksDto.books);
}
```

Esempio body della request:
```json
{
  "books": [
    {
      "title": "Harry Potter e la Pietra Filosofale",
      "author": "J.K. Rowling",
      "ISBN": "9788877827021"
    },
    {
      "title": "Cronache del ghiaccio e del fuoco - Il Trono di Spade",
      "author": "George R.R. Martin",
      "ISBN": "9788804644124"
    },
    {
      "title": "1984",
      "author": "George Orwell",
      "ISBN": "9788817106405"
    },
    {
      "title": "Il Grande Gatsby",
      "author": "F. Scott Fitzgerald",
      "ISBN": "9788845290909"
    },
    {
      "title": "Orgoglio e Pregiudizio",
      "author": "Jane Austen",
      "ISBN": "9788807900228"
    }
  ]
}
```

## Modificare più elementi contemporaneamente

***src/resources/book/dto/update-multiple-books.dto.ts***
```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { Type } from 'class-transformer';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';

// Per aggiornare libri multipli abbiamo bisogno venga fornito anche l'ID di ogni libro
class UpdateBookWithIdDto extends PartialType(CreateBookDto) {
  id: string;
}
export class UpdateMultipleBooksDto extends PartialType(CreateBookDto) {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBookDto)
  updates: UpdateBookWithIdDto[];
}
```

***src/resources/book/book.service.ts***
```ts
/**
 * Aggiorna più libri con dati specifici per ciascun libro.
 *
 * @param updateDtos Un array di oggetti che contiene l'ID del libro e i dati da aggiornare.
 * @returns Un array di documenti dei libri aggiornati.
 * @throws NotFoundException Se un libro non viene trovato.
 */
async updateMultipleBooks(
  updateDtos: UpdateMultipleBooksDto,
): Promise<{ updatedBooks: BookDocument[]; errors: any[] }> {
  console.log(`Update Multiple Books`);

  const updatedBooks = [];
  const errors = [];

  // Itera su ogni oggetto nell'array updates
  /* 
  Riassunto decontruction + spread
  updateDtos.updates è un array di oggetti:
  {
    "id": "6668479e1e78c11602d5032c",
    "title": "Harry Potter e la Pietra Filosofale",
    "author": "J.K. Rowling",
    "ISBN": "9788877827021"
  }
  for (const { id, ...updateData } of updateDtos.updates) significa che per ogni oggetto nell'array updateDtos.updates viene estratta la proprietà id e assegnata alla variabile id.
  Tutte le altre proprietà dell'oggetto (come title, author, ISBN, ecc.) vengono "espanse" in un nuovo oggetto e assegnate alla variabile updateData.
  Durante l'iterazione dell'esempio succede:
  { id, ...updateData }
  id diventa "6668479e1e78c11602d5032c"
  updateData diventa:
  {
    "title": "Harry Potter e la Pietra Filosofale",
    "author": "J.K. Rowling",
    "ISBN": "9788877827021"
  }
  */
  for (const { id, ...updateData } of updateDtos.updates) {
    console.log(`Updating book with ID: ${id}`, updateData);

    try {
      // Verifica se l'ISBN esiste già per un altro libro
      // Cerca se nel DB esiste un libro con lo stesso ISBN
      if (updateData.ISBN && (await this.checkISBN(updateData.ISBN))) {
        // Assegna a una variabile existingBook il libro trovato nel DB con lo stesso ISBN
        const existingBook = await this.bookModel
          .findOne({ ISBN: updateData.ISBN })
          .exec();
        // Se l'id del libro esisente nel DB è diverso dall'id libro da aggiornare chestiamo ciclando, vuol dire che stiamo cercando di aggiornare l'ISBN del libro con un ISBN assegnato ad un altro libro esistente!
        if (existingBook._id.toString() !== id) {
          errors.push({
            id,
            error: `ISBN ${updateData.ISBN} is already in use by another book`,
          });
          continue;
        }
      }

      // Trova e aggiorna il libro nel database
      const updatedBook = await this.bookModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();

      // Se il libro non viene trovato, invia un'eccezione
      if (!updatedBook) {
        // throw new NotFoundException(`Book with ID ${id} not found`);
        errors.push({ id, error: `Book with ID ${id} not found` });
        continue;
      }

      // Aggiunge il libro aggiornato all'array updatedBooks
      updatedBooks.push(updatedBook);
    } catch (error) {
      errors.push({ id, error: error.message });
    }
  }

  // Restituisce l'array di libri aggiornati
  console.log(`Updated Books:`, updatedBooks);
  console.log('Errors:', errors);

  return { updatedBooks, errors };
}
```

***src/resources/book/book.controller.ts***
```ts
@UseGuards(JwtAuthGuard)
@Patch('bulk/update')
updateMultiple(
  @Body() updateMultipleBooksDto: UpdateMultipleBooksDto,
): Promise<{ updatedBooks: BookDocument[]; errors: any[] }> {
  return this.bookService.updateMultipleBooks(updateMultipleBooksDto);
}
```

Esempio body della request:
```json
{
  "books": [
    {
      "title": "Harry Potter e la Pietra Filosofale",
      "author": "J.K. Rowling",
      "ISBN": "9788877827021"
    },
    {
      "title": "Cronache del ghiaccio e del fuoco - Il Trono di Spade",
      "author": "George R.R. Martin",
      "ISBN": "9788804644124"
    },
    {
      "title": "1984",
      "author": "George Orwell",
      "ISBN": "9788817106405"
    },
    {
      "title": "Il Grande Gatsby",
      "author": "F. Scott Fitzgerald",
      "ISBN": "9788845290909"
    },
    {
      "title": "Orgoglio e Pregiudizio",
      "author": "Jane Austen",
      "ISBN": "9788807900228"
    }
  ]
}
```

## Prendere in prestito un libro

***src/resources/user/user.service.ts***
```ts
/**
 * Trova un utente per ID.
 * @param userId L'ID dell'utente da trovare.
 * @returns Il documento dell'utente.
 * @throws NotFoundException Se l'utente non viene trovato.
 */
private async findUserById(userId: string): Promise<UserDocument> {
  // Converte userId in ObjectId
  const userObjectId = new Types.ObjectId(userId);
  // Trova l'utente nel database tramite il suo ObjectId
  const user = await this.userModel.findById(userObjectId).exec();
  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }
  return user;
}

/**
 * Trova un libro per ID.
 * @param bookId L'ID del libro da trovare.
 * @returns Il documento del libro.
 * @throws NotFoundException Se il libro non viene trovato.
 */
private async findBookById(bookId: string): Promise<BookDocument> {
  // Converte bookId in ObjectId
  const bookObjectId = new Types.ObjectId(bookId);
  // Trova il libro nel database tramite il suo ObjectId
  const book = await this.bookModel.findById(bookObjectId).exec();
  if (!book) {
    throw new NotFoundException(`Book with ID ${bookId} not found`);
  }
  return book;
}

/**
 * Controlla se un utente ha preso in prestito un determinato libro.
 * @param user L'utente da controllare.
 * @param bookId L'ID del libro.
 * @returns true se l'utente ha preso in prestito il libro, altrimenti false.
 */
private userHasBorrowedBook(user: UserDocument, bookId: string): boolean {
  const bookObjectId = new Types.ObjectId(bookId);
  // Controlla se l'array books_on_loan contiene l'ObjectId del libro
  return user.books_on_loan.some((id) =>
    new Types.ObjectId(id).equals(bookObjectId),
  );
}

/**
 * Permette a un utente di prendere in prestito un libro.
 * Controlla se l'utente e il libro esistono, se il libro è già in prestito
 * e se l'utente ha già preso in prestito lo stesso libro.
 *
 * @param userId L'ID dell'utente che vuole prendere in prestito il libro
 * @param bookId L'ID del libro che si vuole prendere in prestito
 * @returns Il documento aggiornato dell'utente dopo aver preso in prestito il libro
 * @throws NotFoundException Se l'utente o il libro non vengono trovati
 * @throws ConflictException Se il libro è già in prestito o se l'utente ha già preso in prestito lo stesso libro
 */
async borrowBook(userId: string, bookId: string): Promise<UserDocument> {
  // Trova l'utente e il libro nel database tramite i loro ObjectId
  const user = await this.findUserById(userId);
  const book = await this.findBookById(bookId);

  // Controlla se il libro è stato eliminato
  if (book.is_deleted) {
    throw new NotFoundException(
      `Book with ID ${bookId} has been deleted. Can not loan book from Recycle Bin`,
    );
  }

  // Controlla se il libro è già in prestito dall'utente
  if (this.userHasBorrowedBook(user, bookId)) {
    throw new ConflictException(
      `User already borrowed the book with ID ${bookId}`,
    );
  }

  // Controlla se il libro è già stato preso in prestito da un altro utente
  if (book.loaned_to) {
    throw new ConflictException(`Book with ID ${bookId} is already on loan`);
  }

  // Assegna l'utente al libro
  book.loaned_to = user._id;
  // Assegna il libro all'utente
  user.books_on_loan.push(book._id);

  // Salva le modifiche al database
  await book.save();
  return await user.save();
}
```

***src/resources/user/user.controller.ts***
```ts
/**
 * Gestisce la richiesta per prendere in prestito un libro da parte di un utente.
 *
 * @param userId L'ID dell'utente che vuole prendere in prestito il libro.
 * @param bookId L'ID del libro che si vuole prendere in prestito.
 * @returns Il documento dell'utente aggiornato.
 */
@Post(':userId/borrow/:bookId')
async borrowBook(
  @Param('userId') userId: string,
  @Param('bookId') bookId: string,
): Promise<UserDocument> {
  return this.userService.borrowBook(userId, bookId);
}
```

## Ritornare un libro preso in prestito 
***src/resources/user/user.service.ts***
```ts
/**
 * Permette a un utente di restituire un libro preso in prestito.
 * Controlla se l'utente e il libro esistono, se l'utente ha preso in prestito il libro
 * e se il libro è attualmente preso in prestito dall'utente.
 *
 * @param userId L'ID dell'utente che vuole restituire il libro
 * @param bookId L'ID del libro che si vuole restituire
 * @returns Il documento aggiornato dell'utente dopo aver restituito il libro
 * @throws NotFoundException Se l'utente o il libro non vengono trovati
 * @throws ConflictException Se l'utente non ha preso in prestito il libro o se il libro non è attualmente preso in prestito dall'utente
 */
async returnBook(userId: string, bookId: string): Promise<UserDocument> {
  // Trova l'utente e il libro nel database tramite i loro ObjectId
  const user = await this.findUserById(userId);
  const book = await this.findBookById(bookId);

  // Verifica se l'utente ha preso in prestito il libro
  if (!this.userHasBorrowedBook(user, bookId)) {
    // Lancia un'eccezione se l'utente non ha preso in prestito il libro
    throw new ConflictException(
      `User did not borrow the book with ID ${bookId}`,
    );
  }

  // Rimuove il libro dalla lista dei libri presi in prestito dall'utente
  user.books_on_loan = user.books_on_loan.filter(
    (id) => !new Types.ObjectId(id).equals(book._id),
  );
  book.loaned_to = null;

  // Salva le modifiche al database
  await book.save();
  return await user.save();
}
```

***src/resources/user/user.controller.ts***
```ts
/**
 * Gestisce la richiesta per restituire un libro preso in prestito da parte di un utente.
 *
 * @param userId L'ID dell'utente che vuole restituire il libro.
 * @param bookId L'ID del libro che si vuole restituire.
 * @returns Il documento dell'utente aggiornato.
 */
@Post(':userId/return/:bookId')
async returnBook(
  @Param('userId') userId: string,
  @Param('bookId') bookId: string,
): Promise<UserDocument> {
  return this.userService.returnBook(userId, bookId);
}
```

## Paginazione

Installare il plugin di paginazione
```bash
npm install mongoose-paginate-v2
```

Modificare lo Schema
```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// Importiamo il plugin di paginazione
import * as mongoosePaginate from 'mongoose-paginate-v2';

export type BookDocument = HydratedDocument<Book>;

@Schema()
export class Book {
  @Prop({ required: true, minlength: 2, type: String })
  public title!: string;

  @Prop({ required: true, maxlength: 50, minlength: 3, type: String })
  public author!: string;

  @Prop({ required: true, maxlength: 13, minlength: 13, type: String })
  public ISBN!: string;

  @Prop({ default: false })
  public is_deleted: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  loaned_to: Types.ObjectId | null;
}

export const BookSchema = SchemaFactory.createForClass(Book);

// Applichiamo il plugin allo schema
BookSchema.plugin(mongoosePaginate);
```

Modifichiamoil servizio
```ts
import {
  // Importiamo i moduli di paginazione
  PaginateModel,
  PaginateResult,
} from 'mongoose';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookDocument } from './schemas/book.schema';
import { UpdateMultipleBooksDto } from './dto/update-multiple-books.dto';

@Injectable()
export class BookService {
  constructor(
    // Modifichiamo l'iniezione del modello
    @InjectModel(Book.name) private bookModel: PaginateModel<BookDocument>,
  ) {}

  async findAll(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginateResult<BookDocument>> {
    console.log(`Find all Books - Page: ${page}, PageSize: ${pageSize}`);

    const options = {
      page: page,
      limit: pageSize,
      populate: {
        path: 'loaned_to',
        select: 'name',
        model: 'User',
      },
      query: {
        $or: [{ is_deleted: { $exists: false } }, { is_deleted: false }],
      },
    };

    const books = await this.bookModel.paginate({}, options);

    return books;
  }
}
```

Modifichiamo il controller
```ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query, // Importiamo il decoratore Query
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { CreateMultipleBooksDto } from './dto/create-multiple-books.dto';
import { DeleteMultipleBooksDto } from './dto/delete-multiple-books.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UpdateMultipleBooksDto } from './dto/update-multiple-books.dto';
import { BookDocument } from './schemas/book.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginateResult } from 'mongoose'; // Importiamo il modulo di paginazione

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<PaginateResult<BookDocument>> {
    const pageNumber = page ? Number(page) : 1;
    const pageSizeNumber = pageSize ? Number(pageSize) : 10;
    return this.bookService.findAll(pageNumber, pageSizeNumber);
  }
}
```

## PostGres
Basic tutorial:
https://medium.com/simform-engineering/nestjs-and-postgresql-a-crud-tutorial-32aa78778752

Installare pacchetty TypeORM se non installati e POstgreSQL
```bash
npm install @nestjs/typeorm typeorm pg
```

Creare il DB (in questo caso library)
```bash
psql -U postgres -c "CREATE DATABASE library;"
```

Aggiungere al file .env i dati di configurazione del DB
```ts
POSTGRES_USER=[USERNAME]
POSTGRES_PASSWORD={PASSWORD}
POSTGRES_HOST=[HOST]
POSTGRES_PORT=[PORT]
POSTGRES_DB=[DB NAME]
```

Creiamo le risorse per l'enità libro resplicata in PostgreSQL
```bash
nest g resource resources/postbook
```

Aggiungiamo la configurazione del database Postgres in app.module

***src/app.module.ts***
```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostbookModule } from './postbook/postbook.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './resources/book/book.module';
import { UserModule } from './resources/user/user.module';
import { AuthModule } from './resources/auth/auth.module';

@Module({
  imports: [

    // Inizializza il modulo di configurazione e rende globali le variabili dei file di ambiente
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      // [...] Configurazione MongoDB
    }),

    // Configurazione PostgreSQL
    TypeOrmModule.forRootAsync({
      // E' buona prassi importare ConfigModule anche se è globale per garantire sia disponibile nelle configurazioni asicrone
      imports: [ConfigModule],
      // useFactory è una funzione che accetta ConfigService come parametro e restituisce un oggetto di configurazione
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: +configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [__dirname + '/**/*.entity{.ts}'],
        synchronize: true,
      }),

      // Inietta ConfigService nella funzione useFactory
      inject: [ConfigService],
    }),

    BookModule,
    UserModule,
    AuthModule,
    PostbookModule, // importa il modulo  della entity book ricreata in PostgreSQL
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Definiamo l'entità postbook
***src\resources\postbook\entities\postbook.entity.ts***
```ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pbook') // Questo sarà il nome dellatabella che verrà generata
export class Postbook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column({ length: 50 })
  author: string;

  @Column({ length: 13, unique: true })
  ISBN: string;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ nullable: true })
  loaned_to: number | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Esempio di colonna timestamp con valore di default corrente
  created_at: Date;
}
```

Importiamo l'entità nel modulo postbook
***src\resources\postbook\postbook.module.ts***
```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostbookService } from './postbook.service';
import { PostbookController } from './postbook.controller';
import { Postbook } from './entities/postbook.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Postbook])], // Importiamo l'entità
  controllers: [PostbookController],
  providers: [PostbookService],
})
export class PostbookModule {}
```

Definiamo il DTO di creazione del postbook
Inseriamo anche i messaggi di controllo della validazione.
***src\resources\postbook\dto\create-postbook.dto.ts***
```ts
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  MinLength,
} from 'class-validator';

export class CreatePostbookDto {
  @IsString()
  @MinLength(2, { message: 'Title must have at least 2 characters.' })
  @IsNotEmpty({ message: 'Title can not be ampty.' })
  title: string;

  @IsString()
  @MinLength(3, { message: 'Author must have at least 2 characters.' })
  @IsNotEmpty({ message: 'Author can not be ampty.' })
  author: string;

  @IsString()
  @MinLength(13, { message: 'ISBN must have 13 characters.' })
  @IsNotEmpty({ message: 'ISBN can not be ampty.' })
  ISBN: string;

  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;

  @IsNumber()
  @IsOptional()
  loaned_to?: number;
}
```
Creiamo i primi metodi nel servizio
***src\resources\postbook\postbook.service.ts***
```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Postbook } from './entities/postbook.entity';
import { CreatePostbookDto } from '../postbook/dto/create-postbook.dto';

@Injectable()
export class PostbookService {
  constructor(
    @InjectRepository(Postbook)
    private postbookRepository: Repository<Postbook>,
  ) {}

  findAll(): Promise<Postbook[]> {
    return this.postbookRepository.find();
  }

  async create(createPostbookDto: CreatePostbookDto): Promise<Postbook> {
    const newPostbook = this.postbookRepository.create(createPostbookDto);
    return this.postbookRepository.save(newPostbook);
  }

  async findOne(id: number): Promise<Postbook> {
    console.log(`Finding Book with id ${id}`);

    const book = await this.postbookRepository.findOne({ where: { id } });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    console.log(`Book found: "${book.title}"`);

    return book;
  }
}
```

Implementiamoli nel controller

***src\resources\postbook\postbook.controller.ts***
```ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PostbookService } from './postbook.service';
import { Postbook } from './entities/postbook.entity';
import { CreatePostbookDto } from '../postbook/dto/create-postbook.dto';

@Controller('postbooks')
export class PostbookController {
  constructor(private readonly postbookService: PostbookService) {}

  // Potremmo importare JwtAuthGuard per proteggere le rotte
  // @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<Postbook[]> {
    return this.postbookService.findAll();
  }

  @Post()
  create(@Body() createPostbookDto: CreatePostbookDto): Promise<Postbook> {
    return this.postbookService.create(createPostbookDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Postbook> {
    return this.postbookService.findOne(+id);
  }
}
```

Effettutiamo una chiamata POST a *http://localhost:3000/postbooks* inviando come body il seguente JSON per testare il codice:
```json
{
  "title": "Il nome della rosa",
  "author": "Umberto Eco",
  "ISBN": "9788830423895",
  "is_deleted": false
}
```

Controlliamo adesso tramite terminale il database.
Dopo aver installato globalmente psql eseguiamo:
```bash
psql -U [USERNAME] -d [DB NAME]
```
e immettiamo la password

il nostro terminale dovrebbe mostrare adesso la radice del database in cui siamo entrati con il comando -d
```bash
[DB NAME]=#
```
Eseguiamo
```bash
\dt
```
e dovremmo ottenere una lista delle tabelle nel DB
```bash
         List of relations
 Schema | Name  | Type  |  Owner
--------+-------+-------+----------
 public | pbook | table | postgres
(1 row)
```
Eseguiamo 
```bash
\d pbook 
```
per ottenere una descrizione delle tabelle del DB
```bash
                                     Table "public.pbook"
   Column   |         Type          | Collation | Nullable |              Default
------------+-----------------------+-----------+----------+-----------------------------------
 id         | integer               |           | not null | nextval('pbook_id_seq'::regclass)
 title      | character varying(50) |           | not null |
 author     | character varying(50) |           | not null |
 ISBN       | character varying(13) |           | not null |
 is_deleted | boolean               |           | not null | false
 loaned_to  | integer               |           |          |
Indexes:
    "PK_d7951319cb4360e6b9532fdcbd8" PRIMARY KEY, btree (id)
```

Possiamo interrogare il DB da terminale
```bash
library=# SELECT * FROM pbook;
 id |       title        |   author    |     ISBN      | is_deleted | loaned_to
----+--------------------+-------------+---------------+------------+-----------
  1 | Il nome della rosa | Umberto Eco | 9788830423895 | f          |
(1 row)

library=# SELECT title  FROM pbook WHERE id=1;
       title
--------------------
 Il nome della rosa
(1 row)
```

Aggiungiamo il metodo update
***src\resources\postbook\postbook.service.ts***
```ts
async update(
    id: number,
    updatePostbookDto: UpdatePostbookDto,
  ): Promise<Postbook> {
    // Cerchiamo il Libro da aggiornare
    const recordToUpdate = await this.postbookRepository.findOne({
      // Non vogliamo che libri "nel cestino" vengano trovati
      where: { id, is_deleted: false }, 
    });

    if (!recordToUpdate) {
      console.log(`Book with ID ${id} not found`);
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    console.log(`Found "${recordToUpdate.title}"`);

    // Copiamo i dati del DTO in recordToUpdate
    Object.assign(recordToUpdate, updatePostbookDto);

    try {
      // Salviamo il record
      await this.postbookRepository.save(recordToUpdate);
    } catch (error) {
      if (error) {
        console.log(`Error: ${error.message}`);
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to update the book.');
    }

    console.log(
      `Book "${recordToUpdate.title}" updated at ${recordToUpdate.updated_at}`,
    );

    return recordToUpdate;
  }
```

***src\resources\postbook\postbook.controller.ts***
```ts
@Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostbookDto: UpdatePostbookDto,
  ): Promise<Postbook> {
    console.log(`Updating Book with id ${id}`);
    return this.postbookService.update(Number(id), updatePostbookDto);
  }
```

Aggiungiamo il metodo Soft Delete
***src\resources\postbook\postbook.service.ts***
```ts
async softDelete(id: number): Promise<{ message: string }> {
    const book = await this.postbookRepository.findOne({
      where: { id, is_deleted: false },
    });

    if (!book) {
      console.log(`Book with ID ${id} not found or already deleted`);

      throw new NotFoundException(
        `Book with ID ${id} not found or already deleted`,
      );
    }

    console.log(`Found ${book.title}`);

    // Aggiorniamo il campo is_deleted su true
    book.is_deleted = true;

    try {
      // salviamo il libro
      await this.postbookRepository.save(book);

      console.log(`Book ${book.title} with ID ${id} soft deleted successfully`);

      return {
        message: `Book ${book.title} with ID ${id} soft deleted successfully`,
      };
    } catch (error) {
      console.error(`Error soft deleting book with ID ${id}: ${error.message}`);

      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Failed to soft delete the book due to a database error.',
        );
      }

      throw new InternalServerErrorException('Failed to soft delete the book.');
    }
  }
```
***src\resources\postbook\postbook.controller.ts***
```ts
@Patch('delete/:id')
  async softDelete(@Param('id') id: string) {
    console.log(`Moving Book with id ${id} in the Recycle Bin`);
    return this.postbookService.softDelete(Number(id));
  }
```

Aggiungiamo il metodo Restore
***src\resources\postbook\postbook.service.ts***
```ts
async restore(id: number): Promise<{ message: string }> {
    const book = await this.postbookRepository.findOne({
      // Possiamo ripristinare solo i libri nel "cestino"
      where: { id, is_deleted: true },
    });

    if (!book) {
      console.log(`Book with ID ${id} not found or not in the Recycle Bin`);

      throw new NotFoundException(
        `Book with ID ${id} not found or not in the Recycle Bin`,
      );
    }

    console.log(`Found ${book.title}`);

    // Aggiorniamo il campo is_deleted su true
    book.is_deleted = false;

    try {
      // salviamo il libro
      await this.postbookRepository.save(book);

      console.log(`Book ${book.title} with ID ${id} restored successfully`);

      return {
        message: `Book ${book.title} with ID ${id} restored successfully`,
      };
    } catch (error) {
      console.error(
        `Error soft restoring book with ID ${id}: ${error.message}`,
      );

      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Failed to restore the book due to a database error.',
        );
      }

      throw new InternalServerErrorException('Failed to soft delete the book.');
    }
  }
```
***src\resources\postbook\postbook.controller.ts***
```ts
@Patch('restore/:id')
  async restore(@Param('id') id: string) {
    console.log(`Restoring Book with id ${id}`);
    return this.postbookService.restore(Number(id));
  }
```

Aggiungiamo il metodo Delete
***src\resources\postbook\postbook.service.ts***
```ts
async delete(id: number) {
    // Cerchiamo il Libro da eliminare
    const book = await this.postbookRepository.findOne({
      // Eliminiamo solo i libri nel "cestino"
      where: { id, is_deleted: true },
    });

    if (!book) {
      console.log(`Book with ID ${id} not found or not in the Recycle Bin`);
      throw new NotFoundException(
        `Book with ID ${id} not found or not in the Recycle Bin`,
      );
    }

    console.log(`Found ${book.title}`);

    try {
      // Elimina il libro dal database
      await this.postbookRepository.remove(book);

      console.log(`Book ${book.title} with ID ${id} deleted successfully`);

      return {
        message: `Book ${book.title} with ID ${id} deleted successfully`,
      };
    } catch (error) {
      if (error) {
        console.log(`Error deleting book with ID ${id}: ${error.message}`);

        throw new BadRequestException(
          `Error deleting book with ID ${id}: ${error.message}`,
        );
      }

      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Failed to delete the book due to a database error.',
        );
      }

      throw new InternalServerErrorException('Failed to delete the book.');
    }
  }
```
***src\resources\postbook\postbook.controller.ts***
```ts
@Delete('delete/:id')
  async delete(@Param('id') id: string) {
    console.log(`Deleting Book with id ${id}`);
    return this.postbookService.delete(Number(id));
  }
```

Modifichiamo i metodi di ricerca per evitare vengano trovati libri nel "cestino"

Quando cerchiamo un singolo libro:
```ts
await this.postbookRepository.findOne({
      where: { id, is_deleted: false },
    });
```

Ad Esempio nel metodo findOne()
```ts
async findOne(id: number): Promise<Postbook> {
    const book = await this.postbookRepository.findOne({
      where: { id, is_deleted: false },
    });

    if (!book) {
      console.log(`Book with ID ${id} not found`);
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    console.log(`Book found: ${book.title}`);

    return book;
  }
```

Quando cerchiamo più record, come in findAll():
```ts
async findAll(): Promise<Postbook[]> {
    return await this.postbookRepository.find({
      where: { is_deleted: false },
    });
  }
```

Relazioni tra entità

Nel nostro database abbiamo varie entità. I libri:
```bash
                      Table "public.pbook"
   Column   |            Type             | Collation | Nullable |              Default
------------+-----------------------------+-----------+----------+-----------------------------------
 id         | integer                     |           | not null | nextval('pbook_id_seq'::regclass)
 title      | character varying(50)       |           | not null |
 author     | character varying(50)       |           | not null |
 ISBN       | character varying(13)       |           | not null |
 created_at | timestamp without time zone |           | not null | now()
 updated_at | timestamp without time zone |           | not null | now()
 is_deleted | boolean                     |           | not null | false
 loaned_to  | integer                     |           |          |
Indexes:
    "PK_d7951319cb4360e6b9532fdcbd8" PRIMARY KEY, btree (id)
    "UQ_554e5ab6fc052edcc1677f1fd9d" UNIQUE CONSTRAINT, btree ("ISBN")
Referenced by:
    TABLE "puser_pbook" CONSTRAINT "FK_3b1e5fd60ed5cc8b42dae8a5d59" FOREIGN KEY (pbook_id) REFERENCES pbook(id)
```
Gli Utenti:
```bash
                        Table "public.puser"
  Column  |       Type        | Collation | Nullable |              Default
----------+-------------------+-----------+----------+-----------------------------------
 id       | integer           |           | not null | nextval('puser_id_seq'::regclass)
 username | character varying |           | not null |
 password | character varying |           | not null |
 name     | character varying |           | not null |
Indexes:
    "puser_pkey" PRIMARY KEY, btree (id)
    "UQ_c24e9ec60fc7d67f7cacb49d565" UNIQUE CONSTRAINT, btree (username)
Referenced by:
    TABLE "puser_pbook" CONSTRAINT "FK_2bde289fadd861fb369ae6aa366" FOREIGN KEY (puser_id) REFERENCES puser(id)
```
E i prestiti:
```bash
                        Table "public.puser_pbook"
  Column  |  Type   | Collation | Nullable |                 Default
----------+---------+-----------+----------+-----------------------------------------
 puser_id | integer |           | not null |
 pbook_id | integer |           | not null |
 id       | integer |           | not null | nextval('puser_pbook_id_seq'::regclass)
Indexes:
    "PK_ac7942791528b55a11ee4d9581b" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "FK_2bde289fadd861fb369ae6aa366" FOREIGN KEY (puser_id) REFERENCES puser(id)
    "FK_3b1e5fd60ed5cc8b42dae8a5d59" FOREIGN KEY (pbook_id) REFERENCES pbook(id)
```

Ogni utente può prendere in prestito molti libri, ma un libro può essere prestato a un solo utente per volta. 
Questo viene rappresentato tramite la tabella di unione puser_pbook. Abbiamo una relazione uno-a-molti tra Utenti e prestiti e una relazione molti-a-uno tra libri e prestiti (I libri possono avere UN prestito).

Quando Definiamo le entità, diventa necessario specificare queste relazioni e creare degli identificativi che ci permetteranno di interrogare il DB.
***src\resources\postuser_postbook\entities\postbook.entity.ts***
```ts
import { PostuserPostbook } from 'src/resources/postuser_postbook/entities/postuser_postbook.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('pbook') // Questo sarà il nome della tabella che verrà generata
@Unique(['ISBN'])
export class Postbook {
  @PrimaryGeneratedColumn()
  id: number;

  // ... Altre definizioni dei campi

  /**
   * Relazione uno-a-uno con PostuserPostbook.
   *
   * Un libro può avere un solo prestito rappresentato da una singola istanza di PostuserPostbook.
   *
   * Utilizziamo puserPbook per rappresentare questa relazione:
   * - puserPbook è un'istanza di PostuserPostbook associata a questo libro.
   * - La decorazione @OneToOne ci permette di definire una relazione uno-a-uno, indicando che ogni istanza di Postbook
   *   può avere una singola istanza di PostuserPostbook.
   * - () => PostuserPostbook specifica il tipo dell'entità di destinazione (PostuserPostbook).
   * - (puserPbook) => puserPbook.pbook specifica il campo in PostuserPostbook che fa riferimento a questo libro.
   *
   * Il nome "pbook" è stato scelto convenzionalmente per rappresentare questa relazione, non è legato a un nome obbligatorio dell'entità Postbook.
   * È buona prassi seguire le convenzioni per mantenere il codice comprensibile e consistente.
   *
   * Questo campo ci permette di accedere al prestito (PostuserPostbook) associato a questo libro.
   */
  // 1 Postbook ha molti PostuserPostbook.
  @OneToOne(() => PostuserPostbook, (puserPbook) => puserPbook.pbook)
  puserPbooks: PostuserPostbook;
}
```

Allo stesso modo dobbiamo specificare le relazioni in puser

***src\resources\postuser\entities\postuser.entity.ts***
```ts
/**
   * Relazione uno-a-molti con PostuserPostbook.
   *
   * Ogni utente può avere molti prestiti rappresentati da istanze di PostuserPostbook.
   *
   * Utilizziamo puserPbooks per rappresentare questa relazione:
   * - puserPbooks è un array di istanze di PostuserPostbook associato a questo utente.
   * - La decorazione @OneToMany ci permette di definire una relazione uno-a-molti, indicando che ogni istanza di Postuser
   *   può avere molteplici istanze di PostuserPostbook.
   * - () => PostuserPostbook specifica il tipo dell'entità di destinazione (PostuserPostbook).
   * - (puserPbook) => puserPbook.puser specifica il campo in PostuserPostbook che fa riferimento a questo utente.
   *
   * Il nome "puser" è stato scelto convenzionalmente per rappresentare questa relazione, non è legato a un nome obbligatorio dell'entità Postuser.
   * È buona prassi seguire le convenzioni per mantenere il codice comprensibile e consistente.
   *
   * Questo campo ci permette di accedere a tutti i prestiti (PostuserPostbook) associati a questo utente.
   */
  @OneToMany(() => PostuserPostbook, (puserPbook) => puserPbook.puser)
  puserPbooks: PostuserPostbook[];
```

Successiamente definiamo anche le relazioni tra prestiti (puser_pbooks) e utenti (puser) e libri (pbook)

***src\resources\postuser_postbook\entities\postuser_postbook.entity.ts***
```ts
import { Postbook } from 'src/resources/postbook/entities/postbook.entity';
import { Postuser } from 'src/resources/postuser/entities/postuser.entity';
import {
  PrimaryGeneratedColumn,
  ManyToOne,
  Entity,
  Column,
  JoinColumn,
} from 'typeorm';

@Entity('puser_pbook')
export class PostuserPostbook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  puser_id: number;

  // Ci assicuriamo che l'indice del libro sia unico
  // In questo modo un libro non potrà essere messo in prestito più volte
  @Column({ unique: true, nullable: false })
  pbook_id: number;

  /**
   * Relazione molti-a-uno con Postuser.
   *
   * Ogni prestito (PostuserPostbook) fa riferimento a un singolo utente (Postuser).
   *
   * Utilizziamo puser per rappresentare questa relazione:
   * - puser è l'istanza di Postuser associata a questo prestito (PostuserPostbook).
   * - La decorazione @ManyToOne ci permette di definire una relazione molti-a-uno, indicando che molteplici istanze di PostuserPostbook
   *   possono fare riferimento a un singolo utente (Postuser).
   * - () => Postuser specifica il tipo dell'entità di destinazione (Postuser).
   * - (postuser) => postuser.puserPbooks specifica il campo in Postuser che fa riferimento a questo prestito (PostuserPostbook).
   * - @JoinColumn({ name: 'puser_id' }) specifica il nome della colonna nel database che mappa questa relazione.
   *
   * Questo campo ci permette di accedere all'utente associato a questo prestito (PostuserPostbook).
   */
  @ManyToOne(() => Postuser, (postuser) => postuser.puserPbooks)
  @JoinColumn({ name: 'puser_id' })
  puser: Postuser;

  /**
   * Relazione uno-a-uno con Postbook.
   *
   * Un prestito (PostuserPostbook) fa riferimento a un singolo libro (Postbook).
   *
   * Utilizziamo pbook per rappresentare questa relazione:
   * - pbook è l'istanza di Postbook associata a questo prestito (PostuserPostbook).
   * - La decorazione @OneToOne ci permette di definire una relazione uno-a-uno, indicando che una istanza di PostuserPostbook
   *   può fare riferimento a un singolo libro (Postbook).
   * - () => Postbook specifica il tipo dell'entità di destinazione (Postbook).
   * - (postbook) => postbook.puserPbooks specifica il campo in Postbook che fa riferimento a questo prestito (PostuserPostbook).
   * - @JoinColumn({ name: 'pbook_id' }) specifica il nome della colonna nel database che mappa questa relazione.
   *
   * Questo campo ci permette di accedere al libro associato a questo prestito (PostuserPostbook).
   */
  @OneToOne(() => Postbook, (postbook) => postbook.puserPbooks)
  @JoinColumn({ name: 'pbook_id' })
  pbook: Postbook;
}
```

Usando metodi simili a questo possiamo accdere alle relazioni:
```ts
const relations = await this.postuserPostbookRepository.find({
      relations: ['pbook', 'puser'],
      where: {
        // Passeremo userId e bookId come variabili parametro della query
        puser: { id: userId },
        pbook: { id: bookId },
      },
    });
```

Creiamo un metodo che usi queste relazioni per ottenere i libri presi in prestito
***src\resources\postbook\postbook.service.ts***
```ts
async getLoans(): Promise<
    { username: string; name: string; books: string[] }[]
  > {
    const loans = await this.postuserPostbookRepository.find({
      relations: ['pbook', 'puser'],
    });

    // Definiamo un oggetto che terrà traccia dei libri per ogni utente:
    /* 
      { 
        Admin: {  username: 'Admin', 
                  name: 'Admin', 
                  books: [ 'TEST BOOK' ] 
                },

        User2: {  username: 'User2', 
                  name: 'User2', 
                  books: [ 'TEST BOOK 2' ] 
                }
                }
     */
    const loansMapped: {
      [username: string]: { username: string; name: string; books: string[] };
    } = {};

    loans.forEach((loan) => {
      // Recuperiamo il nome utente dal loan
      const username = loan.puser.username;

      // Controlliamo se nel nostro oggetto l'utente che stiamo mappando non è presente
      if (!loansMapped[username]) {
        // Se non è presente, lo aggiungiamo popolando i campi necessari
        loansMapped[username] = {
          username: loan.puser.username,
          name: loan.puser.name,
          // books sarà un array di titoli
          books: [],
        };
      }

      // In loans mapped, aggiungiamo all'indice dell'utente mappato nel loan atttuale il titolo del libro.
      loansMapped[username].books.push(loan.pbook.title);
    });

    console.log('loans mapped', loansMapped);

    /* 
    Siccome i risultati mappati avranno questo aspetto:
    loans mapped {
      Admin: {
        username: 'Admin',
        name: 'Admin',
        books: [ 'TEST BOOK', 'Il nome della rosa' ]
      }
    }
    e a noi interessa convertirli in un formato più adatto come un array di oggetti
    [
      {
          "username": "Admin",
          "name": "Admin",
          "books": [
              "TEST BOOK",
              "Il nome della rosa"
          ]
      }
    ]

    Convertiamo l'oggetto mappato in un array di risultati:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
    */
    const result = Object.values(loansMapped);

    return result;
  }
```

Metodo per assegnare un libro a un utente
```ts
async borrowBook(bookId: number, userId: number) {
    // Cerca il libro dal repository dei libri
    const book = await this.postbookRepository.findOne({
      where: { id: bookId, is_deleted: false },
    });

    if (!book) {
      console.log(`Book with ID ${bookId} not found`);
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    // Cerca l'utente dal repository degli utenti
    const user = await this.postuserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      console.log(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verifica se esiste già un record con la stessa combinazione di utente e libro
    const existingRecord = await this.postuserPostbookRepository.findOne({
      where: {
        puser: { id: userId },
        pbook: { id: bookId },
      },
    });

    // Se il libro è già assegnato all'utente che lo richiede
    if (existingRecord) {
      console.log(
        `Book with ID ${bookId} is already assigned to user with ID ${userId}`,
      );

      throw new BadRequestException(
        `Book with ID ${bookId} is already assigned to user with ID ${userId}`,
        // Nella realtà invieremo un messaggio che non espone l'id dell'utente
      );
    }

    // Crea la relazione PostuserPostbook
    const newPostuserPostbook = new PostuserPostbook();
    newPostuserPostbook.puser = user;
    newPostuserPostbook.pbook = book;

    try {
      // Salva la nuova relazione nel repository PostuserPostbook
      await this.postuserPostbookRepository.save(newPostuserPostbook);
      console.log(`Book "${book.title}" assigned to user "${user.username}"`);

      return {
        message: `Book ${newPostuserPostbook.pbook.title} succeffully assigned to User ${newPostuserPostbook.puser.username}`,
      };
    } catch (error) {
      // Codice di PostgreSQL di violazione chiave unica
      if (error.code === '23505') {
        throw new BadRequestException(`Book ${book.title} already on loan`);
      }

      console.error(`Error assigning book to user: ${error.message}`);
      throw new InternalServerErrorException('Failed to assign book to user');
    }
  }
```

Metodo per restituire un libro
```ts
async returnBook(
    bookId: number,
    userId: number,
  ): Promise<{ message: string }> {
    // Cerca il libro dal repository dei libri
    const book = await this.postbookRepository.findOne({
      where: { id: bookId, is_deleted: false },
    });

    if (!book) {
      console.log(`Book with ID ${bookId} not found`);
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    // Cerca l'utente dal repository degli utenti
    const user = await this.postuserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      console.log(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Cerca la relazione PostuserPostbook esistente
    const existingRecord = await this.postuserPostbookRepository.findOne({
      where: {
        puser: { id: userId },
        pbook: { id: bookId },
      },
    });

    if (!existingRecord) {
      console.log(
        `No loan record found for book ID ${bookId} and user ID ${userId}`,
      );
      throw new NotFoundException(
        `No loan record found for book ID ${bookId} and user ID ${userId}`,
      );
    }

    try {
      // Rimuove la relazione esistente dal repository PostuserPostbook
      await this.postuserPostbookRepository.remove(existingRecord);
      console.log(`Book "${book.title}" returned by user "${user.username}"`);

      return {
        message: `Book ${book.title} successfully returned by User ${user.username}`,
      };
    } catch (error) {
      console.error(`Error returning book from user: ${error.message}`);
      throw new InternalServerErrorException('Failed to return book from user');
    }
  }
```

Metodo per ottenere i libri non in affitto:
```ts
async availableBooks(): Promise<Postbook[]> {
    return (
      this.postbookRepository
        .createQueryBuilder('postbook') // Alias di Postbook
        // LEFT JOIN: postbook (sx) si unisce a postuserPostbook
        .leftJoin(
          PostuserPostbook,
          'postuserPostbook', // Alias di PostuserPostbook
          'postbook.id = postuserPostbook.pbook_id', // Associamo l'id del libro alla FK pbook_id
        )
        .where(
          'postuserPostbook.pbook_id IS NULL AND postbook.is_deleted IS FALSE', // Non vogliamo vedere i libri nel cestino
        )
        .getMany()
    );
  }
```

Metodo per creare più libri dato un array di oggetti
Creiamo un DTO che ci permetta di eseguire l'operazione
***src\resources\postbook\dto\create-multiple-postbooks.dto.ts***
```ts
import { Type } from 'class-transformer';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { CreatePostbookDto } from './create-postbook.dto';

export class CreateMultiplePostbooksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePostbookDto)
  postbooks: CreatePostbookDto[]; // postbooks è un array di CreatePostbookDto e quindi ne segue le regole
}
```
Questo metodo accetta un body della request simile a:
```json
{
  "postbooks": [
    {
      "title": "Harry Potter e la Camera dei Segreti",
      "author": "J.K. Rowling",
      "ISBN": "9788877827022"
    },
    {
      "title": "Harry Potter e il Prigioniero di Azkaban",
      "author": "J.K. Rowling",
      "ISBN": "9788877827023"
    }
  ]
}
```
```ts
async createMultiple(
    createMultiplePostbooksDto: CreateMultiplePostbooksDto,
  ): Promise<Postbook[]> {
    // Creiamo le istanze da salvare partendo dall'array createMultiplePostbooksDto.postbooks
    const newPostbooks = this.postbookRepository.create(
      createMultiplePostbooksDto.postbooks,
    );

    try {
      // Salviamo le istanze
      await this.postbookRepository.save(newPostbooks);
    } catch (error) {
      if (error) {
        console.log(`Error: ${error.message}`);
        throw new BadRequestException(error.message);
      }
      console.log(`Error: Failed to create the books.`);
      throw new InternalServerErrorException('Failed to create the books.');
    }

    console.log(`New Books Created!`, newPostbooks);
    return newPostbooks; // Ritorniamo i libri che abbiamo salvato come response
  }
```

Iseriamo il metodo nel controller
```ts
@Post('bulk/create')
  createMultiple(
    @Body() createMultiplePostbooksDto: CreateMultiplePostbooksDto,
  ): Promise<Postbook[]> {
    console.log('Creating multiple Books');
    return this.postbookService.createMultiple(createMultiplePostbooksDto);
  }
```

Ottenere tutti i libri nel cestino (esempiod i metodo con query builder)
```ts
async trashedBooks(): Promise<Postbook[]> {
    return this.postbookRepository
      .createQueryBuilder('postbook') // Alias di Postbook
      .where('postbook.is_deleted IS TRUE')
      .getMany();
  }
```

Senza query builder:
```ts
async trashedBooks(): Promise<Postbook[]> {
    // return this.postbookRepository.find();
    return await this.postbookRepository.find({
      where: { is_deleted: false },
    });
  }
```

Spostare nel cestino più libri:
```ts
async softDeleteMultiple(bookIds: number[]): Promise<{
    trashedBooks: Postbook[];
    errors: { id: number; error: string }[];
  }> {
    const trashedBooks = [];
    const errors = [];

    for (const id of bookIds) {
      try {
        const book = await this.postbookRepository.findOne({
          where: { id, is_deleted: false },
        });

        if (!book) {
          console.log(`Book with ID ${id} not found or already deleted`);
          errors.push({
            id,
            error: `Book with ID ${id} not found or already deleted`,
          });
          continue;
        }

        console.log(`Found ${book.title}`);

        // Controlla se il libro è in prestito (ha una relazione con un utente e quindi si trova nella tabella puser_pbook)
        const userPostbook = await this.postuserPostbookRepository.findOne({
          where: { pbook_id: id },
        });

        if (userPostbook) {
          console.log(
            `Book with ID ${id} is currently rented and cannot be trashed`,
          );
          errors.push({
            id,
            error: `Book with ID ${id} is currently rented and cannot be trashed`,
          });
          continue;
        }

        book.is_deleted = true;

        await this.postbookRepository.save(book);
        console.log(
          `Book ${book.title} with ID ${id} soft deleted successfully`,
        );
        trashedBooks.push(book);
      } catch (error) {
        console.error(
          `Error soft deleting book with ID ${id}: ${error.message}`,
        );
        if (error instanceof QueryFailedError) {
          errors.push({
            id,
            error: 'Failed to soft delete the book due to a database error.',
          });
        } else {
          errors.push({
            id,
            error: `Error soft deleting book with ID ${id}: ${error.message}`,
          });
        }
      }
    }

    return { trashedBooks, errors };
  }
```
Nel Controller:
```ts
@Patch('bulk/trash')
  async softDeleteMultiple(
    @Body() deleteMultiplePostbooksDto: DeleteMultiplePostbooksDto,
  ) {
    console.log('Soft deleting multiple books');
    return this.postbookService.softDeleteMultiple(
      deleteMultiplePostbooksDto.bookIds,
    );
  }
```

Ripristinare più libri
```ts
async restoreMultiple(bookIds: number[]): Promise<{
    restoredBooks: Postbook[];
    errors: { id: number; error: string }[];
  }> {
    const restoredBooks = [];
    const errors = [];

    for (const id of bookIds) {
      try {
        const book = await this.postbookRepository.findOne({
          where: { id, is_deleted: true },
        });

        if (!book) {
          console.log(`Book with ID ${id} not found or not in the Recycle Bin`);
          errors.push({
            id,
            error: `Book with ID ${id} not found or not in the Recycle Bin`,
          });
          continue;
        }

        console.log(`Found ${book.title}`);

        book.is_deleted = false;

        await this.postbookRepository.save(book);
        console.log(`Book ${book.title} with ID ${id} restored successfully`);
        restoredBooks.push(book);
      } catch (error) {
        console.error(`Error restoring book with ID ${id}: ${error.message}`);
        if (error instanceof QueryFailedError) {
          errors.push({
            id,
            error: 'Failed to restore the book due to a database error.',
          });
        } else {
          errors.push({
            id,
            error: `Error soft restoring book with ID ${id}: ${error.message}`,
          });
        }
      }
    }

    return { restoredBooks, errors };
  }
```
Nel Controller:
```ts
@Patch('bulk/restore')
  async restoreMultiple(
    @Body() restoreMultiplePostbooksDto: DeleteMultiplePostbooksDto,
  ) {
    console.log('Restoring multiple books');
    return this.postbookService.restoreMultiple(
      restoreMultiplePostbooksDto.bookIds,
    );
  }
```

Eliminare definitivamente più libri:
```ts
async deleteMultipleBooks(bookIds: number[]): Promise<{
    deletedBooks: Postbook[];
    errors: { id: number; error: string }[];
  }> {
    const deletedBooks = [];
    const errors = [];

    for (const id of bookIds) {
      try {
        const book = await this.postbookRepository.findOne({
          where: { id, is_deleted: true },
        });

        if (!book) {
          console.log(`Book with ID ${id} not found in the Recycle Bin`);
          errors.push({
            id,
            error: `Book with ID ${id} not found in the Recycle Bin`,
          });
          continue;
        }

        console.log(`Found ${book.title}`);

        await this.postbookRepository.remove(book);

        console.log(`Book ${book.title} with ID ${id} deleted successfully`);
        deletedBooks.push(book);
      } catch (error) {
        console.error(`Error deleting book with ID ${id}: ${error.message}`);
        if (error instanceof QueryFailedError) {
          errors.push({
            id,
            error: 'Failed to delete the book due to a database error.',
          });
        } else {
          errors.push({
            id,
            error: `Error deleting book with ID ${id}: ${error.message}`,
          });
        }
      }
    }

    return { deletedBooks, errors };
  }
```
Nel Controller:
```ts
@Delete('bulk/delete')
  async deleteMultipleBooks(
    @Body() deleteMultiplePostbooksDto: DeleteMultiplePostbooksDto,
  ) {
    console.log('Deleting multiple books');
    return this.postbookService.deleteMultipleBooks(
      deleteMultiplePostbooksDto.bookIds,
    );
  }
```

Aggiornare più libri contemporaneamente:

Creiamo un dto adatto
***src\resources\postbook\dto\update-multiple-postbooks.dto.ts***
```ts
import { Type } from 'class-transformer';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostbookDto } from './create-postbook.dto';

// Avremo bisogno dell'attributo ID
class UpdatePostbookWithIdDto extends PartialType(CreatePostbookDto) {
  id: number;
}
export class UpdateMultiplePostbooksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdatePostbookWithIdDto)
  postbooks: UpdatePostbookWithIdDto[];
}
```

Inseriamo il metodo nel servizio
```ts
async updateMultipleBooks(
    updateMultiplePostbooksDto: UpdateMultiplePostbooksDto,
  ): Promise<{
    updatedBooks: Postbook[];
    errors: { id: number; error: string }[];
  }> {
    const updatedBooks = [];
    const errors = [];

    for (const updateBookData of updateMultiplePostbooksDto.postbooks) {
      // Estraiamo l'id dall'elemento updateBookData dell'array di libri da aggiornare postbooks del DTO updateMultiplePostbooksDto che stiamo attualmente ciclando
      const { id } = updateBookData;

      try {
        // Cerchiamo il Libro da aggiornare usando l'id estratto
        const bookToUpdate = await this.postbookRepository.findOne({
          where: { id, is_deleted: false },
        });

        if (!bookToUpdate) {
          console.log(`Book with id ${id} not found`);
          errors.push({
            id: null,
            error: `Book with id ${id} not found`,
          });
          continue;
        }

        console.log(`Found "${bookToUpdate.title}" with id ${id}`);

        // Se abbiamo trovato il libro bookToUpdate, copiamo i dati updateBookData del DTO in bookToUpdate
        // In questo modo adesso bookToUpdate contiene adesso i dati da aggiornare inviati dalla query
        Object.assign(bookToUpdate, updateBookData);

        try {
          // Salviamo il record aggiornato bookToUpdate nel DB
          await this.postbookRepository.save(bookToUpdate);
        } catch (error) {
          console.log(`Error: ${error.message}`);
          errors.push({
            id: bookToUpdate.id,
            error: `Error updating book ${bookToUpdate.title} with id ${id}: ${error.message}`,
          });
          continue;
        }

        console.log(
          `Book "${bookToUpdate.title}" updated at ${bookToUpdate.updated_at}`,
        );

        // Inseriamo il record appena salvato nell'array dei risultati updatedBooks
        updatedBooks.push(bookToUpdate);
      } catch (error) {
        console.error(`Error updating book with id ${id}: ${error.message}`);
        if (error instanceof QueryFailedError) {
          errors.push({
            id: null,
            error: `Failed to update book with id ${id} due to a database error.`,
          });
        } else {
          errors.push({
            id: null,
            error: `Error updating book with id ${id}: ${error.message}`,
          });
        }
      }
    }

    return { updatedBooks, errors };
  }
```

Inseriamo il metodo nel controller:
```ts
@Patch('bulk/update')
  async updateMultipleBooks(
    @Body() updateMultiplePostbooksDto: UpdateMultiplePostbooksDto,
  ) {
    console.log('Updating multiple Books');
    return this.postbookService.updateMultipleBooks(updateMultiplePostbooksDto);
  }
```
## Paginazione

Creiamo un DTO per gestire i dati della paginazione
***src\resources\postbook\dto\paginated-results.dto.ts***
```ts
import { ValidateNested } from 'class-validator';
import { Postbook } from '../entities/postbook.entity';

export class PaginationLinksDto {
  first: string; // Link alla prima pagina
  prev: string | null; // Link alla pagina precedente
  next: string | null; // Link alla pagina successiva
  last: string; // Link all'ultima pagina
  hasPreviousPage: boolean; // Indica la presenza di una pagina precedente
  hasNextPage: boolean; // Indica la presenza di una pagina successiva

  /**
   * Costruttore per PaginationLinksDto.
   * @param page Numero della pagina corrente.
   * @param totalPages Numero totale di pagine.
   * @param pageSize Numero di elementi per pagina.
   * @param baseUrl Base URL per costruire i link di paginazione.
   */
  constructor(
    page: number,
    totalPages: number,
    pageSize: number,
    baseUrl: string,
  ) {
    this.first = `${baseUrl}?page=1&pageSize=${pageSize}`;
    (this.prev =
      page > 1 ? `${baseUrl}?page=${page - 1}&pageSize=${pageSize}` : null),
      (this.next =
        page < totalPages
          ? `${baseUrl}?page=${page + 1}&pageSize=${pageSize}`
          : null);
    this.last = `${baseUrl}?page=${totalPages}&pageSize=${pageSize}`;
    this.hasPreviousPage = page > 1;
    this.hasNextPage = page < totalPages;
  }
}

export class PaginatedResultsDto {
  @ValidateNested({ each: true })
  data: Postbook[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  links: PaginationLinksDto;

  /**
   * Costruttore per PaginatedResultsDto.
   * @param data Array di elementi Postbook.
   * @param total Numero totale di elementi.
   * @param page Numero della pagina corrente.
   * @param pageSize Numero di elementi per pagina.
   * @param links Oggetto PaginationLinksDto contenente i link di navigazione.
   */
  constructor(
    data: Postbook[] = [],
    total: number = 0,
    page: number = 1,
    pageSize: number = 10,
    links: PaginationLinksDto = new PaginationLinksDto(
      1, // page
      1, // totalPages
      10, // pageSize
      '', // baseUrl
    ),
  ) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize > 50 ? 50 : 10; // Vogliamo visualizzare massimo 50 elementi per pagina
    this.totalPages = Math.ceil(total / pageSize);
    this.links = links;
  }
}
```

Avremo bisogno di recuperare l'url base dalla Request per non doverlo insire manualmente. Per poterlo fare dobbiamo essere in grado di gestire l'oggetto Request. questo è possbile installare la piattaforma Esxpress, il Framework su cui si base NestJS.
```bash
npm install --save @nestjs/platform-express
```

Service
```ts
// Altri import
import { Request } from 'express'; // Importiamo sempre Request da express

@Injectable()
export class PostbookService {
  constructor(
    @InjectRepository(Postbook)
    private postbookRepository: Repository<Postbook>,

    @InjectRepository(Postuser)
    private postuserRepository: Repository<Postuser>,

    @InjectRepository(PostuserPostbook)
    private postuserPostbookRepository: Repository<PostuserPostbook>,
  ) {}

// Altri metodi

  /**
   * Crea i link di paginazione basati sul numero di pagina corrente, il numero totale di pagine e il numero di elementi per pagina.
   * @param page Numero della pagina corrente.
   * @param totalPages Numero totale di pagine.
   * @param pageSize Numero di elementi per pagina.
   * @param request Oggetto Request da cui estraremmo il Base URL per costruire i link di paginazione.
   * @returns Oggetto PaginationLinksDto contenente i link di navigazione.
   */
  private createPaginationLinks(
    page: number,
    totalPages: number,
    pageSize: number,
    // baseUrl: string,
    request: Request
  ): PaginationLinksDto {

    // Manipoliamo l'oggetto request e assegniamo i dati interessati alla costante baseUrl
    // request.originalUrl.split('?') divide la stringa  in due parti, la prima parte è il path (/postbooks/paginat), la seconda è la query string (page=3&pageSize=10). 
    // Di questo questo array ci serve il dato all'indice 0., quindi prendiamo request.originalUrl.split('?')[0]
    const baseUrl = `${request.protocol}://${request.get('host')}${request.originalUrl.split('?')[0]}`;

    console.log(`baseUrl: ${baseUrl}`);

    console.log(`originalUrl: ${request.originalUrl.split('?')[0]}`);

    return new PaginationLinksDto(page, totalPages, pageSize, baseUrl);
  }

  /**
   * Restituisce una lista paginata di Postbooks.
   * @param page Numero della pagina corrente.
   * @param pageSize Numero di elementi per pagina.
   * @param request Oggetto Request da cui estraremmo il Base URL per costruire i link di paginazione.
   * @returns Oggetto PaginatedResultsDto contenente i dati paginati.
   */
  async paginateAll(
    page: number = 1,
    pageSize: number = 10,
    request: Request,
  ): Promise<PaginatedResultsDto> {
    // Estraiamo da findAndCount i dati e il totale
    // In realtà avremmo dovuto escludere i dati soft deleted
    // Normalmente avremmo usato, come nei metodi successivi, il Query Builder
    const [data, total] = await this.postbookRepository.findAndCount({
      // skip: Offset (paginated) where from entities should be taken.
      // Ovvvero a pagina 1 vengono saltati 0 elementi
      // a pagina 2 vengono saltati 10 elementi dato che sono già presenti a pag 1
      skip: page > 0 ? (page - 1) * pageSize : 0,
      take: pageSize,
    });

    // Ora che abbiamo data e total possiamo configurare un nuovo PaginatedResultsDto
    const paginatedResults = new PaginatedResultsDto(
      data,
      total,
      page,
      pageSize,
    );
    const links = this.createPaginationLinks(
      page,
      paginatedResults.totalPages,
      pageSize,
      // `/postbooks/paginate`, // Inseriamo l'urlbase dei link che genereremo
      request, // Passiamo la request a createPaginationLinks in modo che crei la variabile baseUrl
    );
    // Assegniammo i link generati da createPaginationLinks()
    paginatedResults.links = links; 

    return paginatedResults;
  }

  /**
   * Restituisce una lista paginata di Postbooks disponibili.
   * @param page Numero della pagina corrente. Default: 1.
   * @param pageSize Numero di elementi per pagina. Default: 10.
   * @returns Oggetto PaginatedResultsDto contenente i dati paginati.
   */
  async paginateAvailableBooks(
    page: number = 1,
    pageSize: number = 10,
    request: Request,
  ): Promise<PaginatedResultsDto> {
    // Estraiamo da getManyAndCount i dati e il totale
    const [data, total] = await this.postbookRepository
      // Usiamo il Query Builder
      .createQueryBuilder('postbook') // Alias di Postbook
      // LEFT JOIN: postbook (sx) si unisce a postuserPostbook
      .leftJoin(
        PostuserPostbook,
        'postuserPostbook', // Alias di PostuserPostbook
        'postbook.id = postuserPostbook.pbook_id',
      )
      .where(
        'postuserPostbook.pbook_id IS NULL AND postbook.is_deleted IS FALSE',
      )
      // skip: Offset (paginated) where from entities should be taken.
      // Ovvvero a pagina 1 vengono saltati 0 elementi
      // a pagina 2 vengono saltati 10 elementi dato che sono già presenti a pag 1
      .skip(page > 0 ? (page - 1) * pageSize : 0)
      .take(pageSize)
      .getManyAndCount();

    const paginatedResults = new PaginatedResultsDto(
      data,
      total,
      page,
      pageSize,
    );
    const links = this.createPaginationLinks(
      page,
      paginatedResults.totalPages,
      pageSize,
      // `/postbooks/paginate/avaialable`,
      request,
    );
    paginatedResults.links = links;

    return paginatedResults;
  }

  async paginateTrashedBooks(
    page: number = 1,
    pageSize: number = 10,
    request: Request,
  ): Promise<PaginatedResultsDto> {
    // Estraiamo da getManyAndCount i dati e il totale
    const [data, total] = await this.postbookRepository
      // Usiamo il Query Builder
      .createQueryBuilder('postbook') // Alias di Postbook
      // LEFT JOIN: postbook (sx) si unisce a postuserPostbook
      .where('postbook.is_deleted IS TRUE')
      // skip: Offset (paginated) where from entities should be taken.
      // Ovvvero a pagina 1 vengono saltati 0 elementi
      // a pagina 2 vengono saltati 10 elementi dato che sono già presenti a pag 1
      .skip(page > 0 ? (page - 1) * pageSize : 0)
      .take(pageSize)
      .getManyAndCount();

    const paginatedResults = new PaginatedResultsDto(
      data,
      total,
      page,
      pageSize,
    );
    const links = this.createPaginationLinks(
      page,
      paginatedResults.totalPages,
      pageSize,
      // `/postbooks/paginate/trashed`,
      request,
    );
    paginatedResults.links = links;

    return paginatedResults;
  }

}
```
Controller
```ts
// Altri Import
// Importiamo sempre Request da express
import { Request } from 'express';

@Controller('postbooks')
export class PostbookController {
  constructor(private readonly postbookService: PostbookService) {}

  // Altri Metodi

  @Get('paginate')
  async paginateAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Req() request: Request, // Inviamo re Request come parametro
  ): Promise<PaginatedResultsDto> {
    console.log(
      `Finding all Books with pagination. Page: ${page}, Page Size: ${pageSize}`,
    );

    if (pageSize > 50) {
      console.log(
        `Page Size is ${pageSize}, max Page Size allowed is 50. Page Size will be changed to 50 by default.`,
      );
    }

    return this.postbookService.paginateAll(page, pageSize, request);
  }

  @Get('paginate/available')
  async paginateAvailableBooks(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Req() request: Request, // Inviamo re Request come parametro
  ): Promise<PaginatedResultsDto> {
    console.log(
      `Finding all avaialable Books with pagination. Page: ${page}, Page Size: ${pageSize}`,
    );

    if (pageSize > 50) {
      console.log(
        `Page Size is ${pageSize}, max Page Size allowed is 50. Page Size will be changed to 50 by default.`,
      );
    }

    return this.postbookService.paginateAvailableBooks(page, pageSize, request);
  }

  @Get('paginate/trashed')
  async paginateTrashedBooks(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Req() request: Request, // Inviamo re Request come parametro
  ): Promise<PaginatedResultsDto> {
    console.log(
      `Finding all Books in the Recycle Bin with pagination. Page: ${page}, Page Size: ${pageSize}`,
    );


    if (pageSize > 50) {
      console.log(
        `Page Size is ${pageSize}, max Page Size allowed is 50. Page Size will be changed to 50 by default.`,
      );
    }

    return this.postbookService.paginateTrashedBooks(page, pageSize, request);
  }

}
```

Ordinare i risultati

Creiamo un enum che ci permetta di selezionare l'ordine (ASC o DESC)
***src\resources\enum\order.enum.ts***
```ts
export enum OrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}
```

modifichiamo la classe del DTO PaginatedResults per accettare il campo order
***src\resources\postbook\dto\paginated-results.dto.ts***
```ts
export class PaginatedResultsDto {
  @ValidateNested({ each: true })
  readonly data: Postbook[];

  @Type(() => Number)
  @IsInt()
  readonly total: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly pageSize: number;

  @Type(() => Number)
  @IsInt()
  readonly totalPages: number;

  // Aggiungiamo la proprietà order di tipo OrderEnum
  @IsEnum(OrderEnum)
  @IsOptional()
  readonly order: OrderEnum;

  links: PaginationLinksDto;

  constructor(
    data: Postbook[] = [],
    total: number = 0,
    page: number = 1,
    pageSize: number = 10,
    order: OrderEnum = OrderEnum.ASC, // Diamo l'opzione ASC come default
    links: PaginationLinksDto = new PaginationLinksDto(
      1, // page
      1, // totalPages
      10, // pageSize
      '', // baseUrl
    ),
  ) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize > 50 ? 50 : 10;
    this.totalPages = Math.ceil(total / pageSize);
    this.order = order;
    this.links = links;
  }
}
```

Modifichiamo i metodi nel servizio inserendo l'ordinamento. In questo caso ordineremo per titolo.
```ts
  async paginateAll(
    page: number = 1,
    pageSize: number = 10,
    order: OrderEnum = OrderEnum.ASC, // Dichiariamo sempre ASC come default se nessun altro valore viene richiesto dalla query
    request: Request,
  ): Promise<PaginatedResultsDto> {
    const [data, total] = await this.postbookRepository.findAndCount({
      skip: page > 0 ? (page - 1) * pageSize : 0,
      take: pageSize,
      order: {
        title: order, // Ordiniamo per titolo
      },
    });

    const paginatedResults = new PaginatedResultsDto(
      data,
      total,
      page,
      pageSize,
      order,
    );
    const links = this.createPaginationLinks(
      page,
      paginatedResults.totalPages,
      pageSize,
      request,
    );
    paginatedResults.links = links;

    return paginatedResults;
  }

  // Con Query Builder

  async paginateAvailableBooks(
    page: number = 1,
    pageSize: number = 10,
    order: OrderEnum = OrderEnum.ASC, // Dichiariamo sempre ASC come default se nessun altro valore viene richiesto dalla query
    request: Request,
  ): Promise<PaginatedResultsDto> {
    const [data, total] = await this.postbookRepository
      .createQueryBuilder('postbook') 
      .leftJoin(
        PostuserPostbook,
        'postuserPostbook',
        'postbook.id = postuserPostbook.pbook_id',
      )
      .where(
        'postuserPostbook.pbook_id IS NULL AND postbook.is_deleted IS FALSE',
      )
      .orderBy('postbook.title', order) // Ordiniamo per titolo
      .skip(page > 0 ? (page - 1) * pageSize : 0)
      .take(pageSize)
      .getManyAndCount();

    const paginatedResults = new PaginatedResultsDto(
      data,
      total,
      page,
      pageSize,
    );
    const links = this.createPaginationLinks(
      page,
      paginatedResults.totalPages,
      pageSize,
      request,
    );
    paginatedResults.links = links;

    return paginatedResults;
  }
```

Adesso modifichiamo il controller in modo da passare il parametro order al servizio
```ts
@Get('paginate')
  async paginateAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    // Aggiungiemo order come paramwetro della query
    @Query('order') order: OrderEnum = OrderEnum.ASC, //Default
    @Req() request: Request,
  ): Promise<PaginatedResultsDto> {
    console.log(
      `Finding all Books with pagination. Page: ${page}, Page Size: ${pageSize}, Order: ${order}`,
    );

    if (pageSize > 50) {
      console.log(
        `Page Size is ${pageSize}, max Page Size allowed is 50. Page Size will be changed to 50 by default.`,
      );
    }

    // Passiamo order al metodo del servizio
    return this.postbookService.paginateAll(page, pageSize, order, request);
  }

  @Get('paginate/available')
  async paginateAvailableBooks(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    // Aggiungiemo order come paramwetro della query
    @Query('order') order: OrderEnum = OrderEnum.ASC, //Default
    @Req() request: Request,
  ): Promise<PaginatedResultsDto> {
    console.log(
      `Finding all avaialable Books with pagination. Page: ${page}, Page Size: ${pageSize}, Order: ${order}`,
    );

    if (pageSize > 50) {
      console.log(
        `Page Size is ${pageSize}, max Page Size allowed is 50. Page Size will be changed to 50 by default.`,
      );
    }

    return this.postbookService.paginateAvailableBooks(
      page,
      pageSize,
      order, // Passiamo order al metodo del servizio
      request,
    );
  }
```

Ora possiamo effettuare query chiedendo l'ordinamento dei risultati:
```
http://localhost:3000/postbooks/paginate/available?page=1&pageSize=10&order=ASC
```
```
http://localhost:3000/postbooks/paginate/available?page=1&pageSize=10&order=DESC
```

E' bene inserire in un helper le funzioni non relative al servizio ed importarle:
***src\resources\helpers\PostgreSQLhelpers.ts***
```ts
import { PaginationLinksDto } from '../postbook/dto/paginated-results.dto';
import { Request } from 'express';

/**
 * Crea i link di paginazione basati sul numero di pagina corrente, il numero totale di pagine e il numero di elementi per pagina.
 * @param page Numero della pagina corrente.
 * @param totalPages Numero totale di pagine.
 * @param pageSize Numero di elementi per pagina.
 * @param request Oggetto Request da cui estraremmo il Base URL per costruire i link di paginazione.
 * @returns Oggetto PaginationLinksDto contenente i link di navigazione.
 */
export function createPagLinks(
  page: number,
  totalPages: number,
  pageSize: number,
  // baseUrl: string,
  request: Request,
): PaginationLinksDto {
  // Manipoliamo l'oggetto request e assegniamo i dati interessati alla costante baseUrl
  // request.originalUrl.split('?') divide la stringa  in due parti, la prima parte è il path (/postbooks/paginat), la seconda è la query string (page=3&pageSize=10).
  // Di questo questo array ci serve il dato all'indice 0., quindi prendiamo request.originalUrl.split('?')[0]
  const baseUrl = `${request.protocol}://${request.get('host')}${request.originalUrl.split('?')[0]}`;
  console.log(`baseUrl: ${baseUrl}`);
  console.log(`originalUrl: ${request.originalUrl.split('?')[0]}`);
  return new PaginationLinksDto(page, totalPages, pageSize, baseUrl);
```

Importiamo l'helper:
***src\resources\postbook\postbook.service.ts***
```ts
import { createPagLinks } from '../helpers/PostgreSQLhelpers';
```

E' ora possibile utilizzare la funzione createPagLinks() per creare i link di paginazione
```ts
async paginateAll(
    page: number = 1,
    pageSize: number = 10,
    order: OrderEnum = OrderEnum.ASC,
    request: Request,
  ): Promise<PaginatedResultsDto> {
    const [data, total] = await this.postbookRepository.findAndCount({
      skip: page > 0 ? (page - 1) * pageSize : 0,
      take: pageSize,
      order: {
        title: order,
      },
    });

    const paginatedResults = new PaginatedResultsDto(
      data,
      total,
      page,
      pageSize,
      order,
    );
    // Usiamo il metodo importato dall'helper PostgreSQLhelpers
    const links = createPagLinks(
      page,
      paginatedResults.totalPages,
      pageSize,
      request,
    );
    paginatedResults.links = links;

    return paginatedResults;
  }
```

Creiamo ad esempio un helper per gestire l'errore di chiave univoca di PosteGreSQL in modo che anxhé inviare *"QueryFailedError: un valore chiave duplicato viola il vincolo univoco "UQ_554e5ab6fc052edcc1677f1fd9d"* invii *ISBN 9788877827022 already in use by another Book*
***src\resources\helpers\PostgreSQLhelpers.ts***
```ts
import { BadRequestException } from '@nestjs/common';

export function handleISBNcheck(error: any, updatePostbookDto: any): void {
  // Gestione dell'errore di vincolo univoco
  // codice errore per violazione del vincolo univoco in PostgreSQL
  if (error.code === '23505') {
    console.log(`${error}. Code ${error.code}. Details: ${error.detail}`);
    // Verifica se il messaggio contiene 'ISBN'
    if (error.detail.includes('ISBN')) {
      console.log(
        `ISBN ${updatePostbookDto.ISBN} already in use by another Book`,
      );
      throw new BadRequestException(
        `ISBN ${updatePostbookDto.ISBN} already in use by another Book`,
      );
    }
  }
}

// Altri Helpers
```
Importiamo l'helper nel nostro service
***src\resources\postbook\postbook.service.ts***
```ts
import { createPagLinks, handleISBNcheck } from '../helpers/PostgreSQLhelpers';
```

Inseriamo l'helper nei metodi interessati:
```ts
async update(
    id: number,
    updatePostbookDto: UpdatePostbookDto,
  ): Promise<Postbook> {
    const recordToUpdate = await this.postbookRepository.findOne({
      where: { id, is_deleted: false },
    });

    if (!recordToUpdate) {
      console.log(`Book with ID ${id} not found`);
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    console.log(`Found "${recordToUpdate.title}"`);

    Object.assign(recordToUpdate, updatePostbookDto);

    try {
      await this.postbookRepository.save(recordToUpdate);
    } catch (error) {
      if (error) {
        // Gestione dell'errore di vincolo univoco usando l'Helper
        handleISBNcheck(error, updatePostbookDto);

        console.log(`Error: ${error.message}`);

        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to update the book.');
    }

    console.log(
      `Book "${recordToUpdate.title}" updated at ${recordToUpdate.updated_at}`,
    );

    return recordToUpdate;
  }
```

Questo metodo però, lanciando un'eccezione, blocca il codice quando dobbiamo manipolare più elementi. Abbiamo quindi bisogno di estrarre il messaggio di errore senza lanciare l'eccezione e gestirla succesivamente.
Creiamo quindi un metodo similenell'helper che non lanci eccezioni (per completezza di ripasso lasciamo il precedente, ma è inutile) e modifichiamo i metodi di conseguenza.
***src\resources\helpers\PostgreSQLhelpers.ts***
```ts
export function handleISBNcheckNoExc(
  error: any,
  updatePostbookDto: any,
): string | null {
  if (error.code === '23505') {
    console.log(`${error}. Code ${error.code}. Details: ${error.detail}`);
    if (error.detail.includes('ISBN')) {
      console.log(
        `ISBN ${updatePostbookDto.ISBN} already in use by another Book`,
      );
      return `ISBN ${updatePostbookDto.ISBN} already in use by another Book`;
    }
  }
  return null;
}
```

nel service:
***src\resources\postbook\postbook.service.ts***
```ts
// Importiamo il metodo
import {
  createPagLinks,
  handleISBNcheck,
  handleISBNcheckNoExc,
} from '../helpers/PostgreSQLhelpers';
```

Aggiorniamo i metodi del servizio
```ts
// Create Multiple diverrebbe così.
// L'originale resta nel codice come test
async newCreateMultipleBooks(
    createMultiplePostbooksDto: CreateMultiplePostbooksDto,
  ): Promise<{
    newBooks: Postbook[];
    errors: { id: number; error: string }[];
  }> {
    const newBooks = [];
    const errors = [];

    for (const newBook of createMultiplePostbooksDto.postbooks) {
      try {

        await this.postbookRepository.save(newBook);

        console.log(`Book "${newBook.title} created"`);

        newBooks.push(newBook);
      } catch (error) {
        console.error(`Error creating book ${newBook.title}: ${error.message}`);

        // Quando manipoliamo più elementi, dopo aver assegnato il messaggio alla variabile, lo pushiamo invece nell'array dei messaggi di errore
        const errorMessage = handleISBNcheckNoExc(error, newBook);

        // Se c'è un messaggio di errore, pushiamolo nell'array dei messaggi di errore
        if (errorMessage) {
          errors.push({
            title: newBook.title,
            error: errorMessage,
          });
        } else {
          errors.push({
            title: newBook.title,
            error: `Error creating book ${newBook.title}: ${error.message}`,
          });
        }
        continue;
      }
    }

    return { newBooks, errors };
  }
```
```ts
async create(createPostbookDto: CreatePostbookDto): Promise<Postbook> {
    const newPostbook = this.postbookRepository.create(createPostbookDto);

    try {
      await this.postbookRepository.save(newPostbook);
    } catch (error) {
      if (error) {

        // Quando manipoliamo un solo elemento, dopo aver assegnato il messaggio alla variabile, possiamo lanciarlo come Exception
        const errorMessage = handleISBNcheckNoExc(error, newPostbook);
        console.log(`Error: ${error.message}`);

        // Lanciamo l'exception con il messaggio personalizzato
        throw new BadRequestException(errorMessage);
      }
      console.log(`Error: Failed to create the book.`);
      throw new InternalServerErrorException('Failed to create the book.');
    }

    console.log(`New Book Created!`, newPostbook);

    return newPostbook;
  }
```

Allo stesso modo update() e updateMultiple subiranno le modifche appropriate:
```ts
  async update(
    id: number,
    updatePostbookDto: UpdatePostbookDto,
  ): Promise<Postbook> {
    // Cerchiamo il Libro da aggiornare
    const recordToUpdate = await this.postbookRepository.findOne({
      where: { id, is_deleted: false },
    });

    if (!recordToUpdate) {
      console.log(`Book with ID ${id} not found`);
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    console.log(`Found "${recordToUpdate.title}"`);

    // Copiamo i dati del DTO in recordToUpdate
    Object.assign(recordToUpdate, updatePostbookDto);

    try {
      // Salviamo il record
      await this.postbookRepository.save(recordToUpdate);
    } catch (error) {
      if (error) {

        // Quando manipoliamo un solo elemento, dopo aver assegnato il messaggio alla variabile, possiamo lanciarlo come Exception
        const errorMessage = handleISBNcheckNoExc(error, updatePostbookDto);
        console.log(`Error: ${errorMessage}`);

        // Lanciamo l'exception con il messaggio personalizzato
        throw new BadRequestException(errorMessage);
      }
      throw new InternalServerErrorException('Failed to update the book.');
    }

    console.log(
      `Book "${recordToUpdate.title}" updated at ${recordToUpdate.updated_at}`,
    );

    return recordToUpdate;
  }

  async updateMultipleBooks(
    updateMultiplePostbooksDto: UpdateMultiplePostbooksDto,
  ): Promise<{
    updatedBooks: Postbook[];
    errors: { id: number; error: string }[];
  }> {
    const updatedBooks = [];
    const errors = [];

    for (const updateBookData of updateMultiplePostbooksDto.postbooks) {
      const { id } = updateBookData;

      try {
        const bookToUpdate = await this.postbookRepository.findOne({
          where: { id, is_deleted: false },
        });

        if (!bookToUpdate) {
          console.log(`Book with id ${id} not found`);
          errors.push({
            id: null,
            error: `Book with id ${id} not found`,
          });
          continue;
        }

        console.log(`Found "${bookToUpdate.title}" with id ${id}`);

        Object.assign(bookToUpdate, updateBookData);

        try {
          await this.postbookRepository.save(bookToUpdate);
        } catch (error) {

          // Gestione dell'errore di vincolo univoco
          // Quando manipoliamo più elementi, dopo aver assegnato il messaggio alla variabile, lo pushiamo invece nell'array dei messaggi di errore
          const errorMessage = handleISBNcheckNoExc(error, bookToUpdate);
          console.log(`Error: ${errorMessage}`);

          // Se c'è un messaggio di errore, pushiamolo nell'array dei messaggi di errore
          errors.push({
            id: bookToUpdate.id,
            error: `Error updating book ${bookToUpdate.title} with id ${id}: ${errorMessage}`,
          });
          continue;
        }

        console.log(
          `Book "${bookToUpdate.title}" updated at ${bookToUpdate.updated_at}`,
        );

        updatedBooks.push(bookToUpdate);
      } catch (error) {
        console.error(`Error updating book with id ${id}: ${error.message}`);
        if (error instanceof QueryFailedError) {
          errors.push({
            id: id,
            error: `Failed to update book with id ${id} due to a database error.`,
          });
        } else {
          errors.push({
            id: id,
            error: `Error updating book with id ${id}: ${error.message}`,
          });
        }
      }
    }

    return { updatedBooks, errors };
  }

```

## Swagger
Swagger ci permetet di creare un endpoint che descrive la nostra REST API
E' Necessario installare Swagger
```bash
npm install --save @nestjs/swagger
```
 e successivamente effettuare delle modifiche a main.ts per descrivere la configurazione di swagger

***src\main.ts***
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configura CORS per accettare solo le richieste dall'URL specificato
  app.enableCors({
    origin: 'http://localhost:5173', // Imposta l'URL del tuo frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Metodi HTTP consentiti
    allowedHeaders: ['Content-Type', 'Authorization'], // Intestazioni consentite
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true, // Accetta i cookie e l'header Authorization
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // I payload sono oggetti JS. Abilitiamo la trasformazione automatica globale per tipicizzare questi oggetti in base alla loro classe DTO
      transform: true,
    }),
  );

  // Configurazione di Swagger
  const config = new DocumentBuilder()
    .setTitle('Books example API')
    .setDescription('The Books API')
    .setVersion('1.0')
    .addTag('books')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('bookapi', app, document);

  await app.listen(3000);
}
bootstrap();
```

Se alcuni endpoint sono protetti da autorizzazione dobbiamo aggiungerla alla configurazione di Swagger:
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true, 
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Books example API')
    .setDescription('The Books API')
    .setVersion('1.0')
    .addTag('Books')
    // AGGIUNGIAMO L'AUTORIZZAZIONE PER POTER TESTARE LE OPERAZIONI
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Enter JWT token obtained after logging in. Example: [JWT]',
      },
      'Authorization', // Nome dello schema di sicurezza
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('bookapi', app, document);

  await app.listen(3000);
}
bootstrap();
```

Dopodichè indichiamo nel controller lo schema di sicurezza in modo che swagger possa riconoscerlo:
***src\resources\book\book.controller.ts***
```ts
// Altri import

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('book')
@ApiTags('Book (MongoDB)') // Identificativo sezione per Swagger
@ApiBearerAuth('Authorization') // Nome dello schema di sicurezza per Swagger
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Creea un nuovo documento mongo "Book"' })
  @ApiBody({
    type: CreateBookDto,
    description: 'Dati per la creazione del nuovo record',
  })
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  Get()
  @ApiOperation({
    summary: 'Elenca tutti i documenti Book usando la paginazione',
  })
  @ApiQuery({
    name: 'page',
    description: 'La pagina della della lista dei risultati da visualizzare',
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Il numero di elementi per pagina da visualizzare',
  })
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<PaginateResult<BookDocument>> {
    const pageNumber = page ? Number(page) : 1;
    const pageSizeNumber = pageSize ? Number(pageSize) : 10;
    return this.bookService.findAll(pageNumber, pageSizeNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Ottiene un record dal Database tramite ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del record da recuperare',
  })
  findOne(@Param('id') id: string): Promise<BookDocument> {
    return this.bookService.findOne(id);
  }

  // Altri metodi del servizio
}
```

Successivamente ci basterà visitare l'endpoint ***http://localhost:3000/bookapi***