import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { applyIndexes } from './database/apply-indexes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aplica índices al arrancar (se salta los que ya existen)
  const prisma = app.get(PrismaService);
  await applyIndexes(prisma);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');

  console.log(`Servidor corriendo en puerto ${port}`);
}

bootstrap();