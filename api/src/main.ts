import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000' });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
