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

  let APP_PREFIX = process.env.AWEN_APP_PREFIX
    ? process.env.AWEN_APP_PREFIX.trim()
    : '/';
  if (!APP_PREFIX.endsWith('/')) {
    APP_PREFIX = APP_PREFIX + '/';
  }
  if (!APP_PREFIX.startsWith('/')) {
    APP_PREFIX = '/' + APP_PREFIX;
  }
  const APP_NAME = process.env.AWEN_APP_NAME
    ? process.env.AWEN_APP_NAME.trim()
    : 'CRANN';
  const APP_HOST = process.env.AWEN_APP_HOST
    ? process.env.AWEN_APP_HOST.trim()
    : '';
  const APP_FAVICON = process.env.AWEN_APP_FAVICON
    ? process.env.AWEN_APP_FAVICON.trim()
    : 'favicon-default.jpg';
  const serverSideClient = process.env.SERVER_SIDE_CLIENT
    ? process.env.SERVER_SIDE_CLIENT === 'true'
    : false;

  if (serverSideClient) {
    console.log(`serverSideClient enabled. Prefixed with "${APP_PREFIX}". `);
    if (APP_PREFIX !== '/') {
      app.use(
        '/',
        (
          req: express.Request,
          res: express.Response,
          next: express.NextFunction,
        ) => {
          if (!['GET', 'HEAD'].includes(req.method) || req.path !== '/') {
            return next();
          }

          const queryIndex = req.originalUrl.indexOf('?');
          const query =
            queryIndex === -1 ? '' : req.originalUrl.slice(queryIndex);
          console.log(`client redirected to ${APP_PREFIX + query}`);
          res.redirect(302, APP_PREFIX + query);
        },
      );
    }

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
      .replace('${AWEN_APP_PREFIX}', APP_PREFIX)
      .replace('${AWEN_APP_NAME}', APP_NAME)
      .replace('${AWEN_APP_HOST}', APP_HOST)
      .replace('${AWEN_APP_FAVICON}', APP_FAVICON);

    app.use(
      APP_PREFIX,
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        if (!['GET', 'HEAD'].includes(req.method)) return next();
        if (req.path.startsWith('/api')) return next();
        if (req.path.startsWith('/docs')) return next();
        if (path.extname(req.path)) return next();
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

  const config = new DocumentBuilder()
    .setTitle(process.env.AWEN_APP_NAME ?? 'AWEN')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch(console.error);
