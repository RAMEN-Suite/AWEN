import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Neo4jExceptionFilter } from './neo4j/neo4j-exception-filter';
import { RAMENExceptionFilter } from './schema/ramen-exception-filter';
import express from 'express';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new Neo4jExceptionFilter(), new RAMENExceptionFilter());

  const APP_PREFIX = process.env.PREFIX ? process.env.PREFIX.trim() + '/' : '/';
  const APP_NAME = process.env.APP_NAME ? process.env.APP_NAME.trim() : 'CRANN';
  const APP_HOST = process.env.APP_HOST ? process.env.APP_HOST.trim() : '';
  const APP_FAVICON = process.env.APP_FAVICON
    ? process.env.APP_FAVICON.trim()
    : 'favicon-default.jpg';
  const serverSideClient = process.env.SERVER_SIDE_CLIENT
    ? process.env.SERVER_SIDE_CLIENT === 'true'
    : false;

  if (serverSideClient) {
    app.use(
      APP_PREFIX,
      express.static(path.join(__dirname, '..', 'client'), {
        index: false,
      }),
    );

    const raw = fs.readFileSync(
      path.join(__dirname, '..', 'client', 'index.html'),
      'utf-8',
    );
    const indexHtml = raw
      .replace('__BASE_HREF__', APP_PREFIX)
      .replace('__APP_NAME__', APP_NAME)
      .replace('__APP_CANONICAL__', 'https://' + APP_HOST)
      .replace('__APP_FAVICON__', APP_FAVICON);

    app.use(
      APP_PREFIX,
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        if (req.path.startsWith('/api')) return next();
        if (req.path.length > APP_PREFIX.length) return next();
        res.setHeader('Content-Type', 'text/html');
        res.send(indexHtml);
      },
    );
  } else {
    app.enableCors({
      origin: true,
      methods: ['GET', 'PUT', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', '*'],
      credentials: true,
    });
  }

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder().setTitle('Entity Manager').build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch(console.error);
