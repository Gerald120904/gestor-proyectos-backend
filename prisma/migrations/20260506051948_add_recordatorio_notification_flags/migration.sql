-- AlterTable
ALTER TABLE `recordatorio` ADD COLUMN `notificacionEnviada` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `notificacionEnviadaAt` DATETIME(3) NULL,
    ADD COLUMN `notificacionMananaEnviada` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `notificacionMananaEnviadaAt` DATETIME(3) NULL;
