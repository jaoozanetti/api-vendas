import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() { 
  const app = await NestFactory.create(AppModule);
  //Ativa o filtro global de exceções HTTP
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  await app.listen(process.env.PORT ?? 3000);
  console.log(`API rodando em: http://localhost:${process.env.PORT ?? 3000}/api/v1`);
}
bootstrap();
