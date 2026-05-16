import 'dotenv/config';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

function createMariaDbAdapter() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL no está configurado en el archivo .env');
  }

  const url = new URL(databaseUrl);

  return new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace('/', '')),

    // Mantener bajo para Render Free + Aiven Free
    connectionLimit: 3,

    // Evita cortes muy rápidos cuando la BD tarda en responder
    connectTimeout: 30000,
    socketTimeout: 30000,

    // Aiven normalmente requiere SSL
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: createMariaDbAdapter(),

      log:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn']
          : ['query', 'error', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();

      // Calienta la conexión para que el primer login no pague todo el costo
      await this.$queryRaw`SELECT 1`;

      this.logger.log('✅ Prisma conectado y base de datos lista');
    } catch (error) {
      this.logger.error(
        '❌ Error conectando Prisma con la base de datos',
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Prisma desconectado correctamente');
  }
}