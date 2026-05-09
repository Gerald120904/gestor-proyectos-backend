-- AlterTable
ALTER TABLE `user` ADD COLUMN `emailChangeCodeHash` VARCHAR(191) NULL,
    ADD COLUMN `emailChangeExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `pendingEmail` VARCHAR(191) NULL,
    ADD COLUMN `pendingPhone` VARCHAR(191) NULL,
    ADD COLUMN `phoneChangeCodeHash` VARCHAR(191) NULL,
    ADD COLUMN `phoneChangeExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `phoneVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `telefono` VARCHAR(191) NULL;
