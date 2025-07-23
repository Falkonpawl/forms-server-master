import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Настройка CORS должна быть в начале, перед другими middleware
  app.enableCors({
    origin: [
      'https://front-pied-two.vercel.app',
      'http://localhost:5173'              
    ],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true, 
    allowedHeaders: 'Content-Type,Authorization',
  });

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Users API')
    .setDescription('t1 camp form api')
    .setVersion('1.0')
    .addBasicAuth()
    .addTag('users')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Middleware
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true 
    }),
  );

  // Сессии
  app.use(
    session({
      secret: 't1_camp_js',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // В продакшене должно быть true
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
