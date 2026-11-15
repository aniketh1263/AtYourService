import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All endpoints will live under /api  (e.g. GET /api/health).
  app.setGlobalPrefix('api');

  // Only the React frontend's address may call this API from a browser.
  app.enableCors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' });

  // Automatically validates incoming request bodies against our DTO classes.
  // whitelist: strips properties that are not declared in the DTO.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
