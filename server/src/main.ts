import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Neo4jExceptionFilter } from './neo4j/neo4j-exception-filter';
import { RAMENExceptionFilter } from './schema/ramen-exception-filter';

function envOrDefault(name: string, defaultValue: string = ''): string {
  const value = process.env[name]?.trim() ?? '';
  return value.length > 0 ? value : defaultValue;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new Neo4jExceptionFilter(), new RAMENExceptionFilter());

  app.enableCors({
    origin: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', '*'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder().setTitle(envOrDefault('AWEN_APP_NAME', 'AWEN')).build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(envOrDefault('AWEN_SERVER_PORT', '3000'));
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch(console.error);
