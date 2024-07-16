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

  const config = new DocumentBuilder()
    .setTitle('Books example API')
    .setDescription('The Books API')
    .setVersion('1.0')
    .addTag('Books')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('bookapi', app, document);

  await app.listen(3000);
}
bootstrap();
