-- AlterTable
ALTER TABLE `user` ADD COLUMN `emailVerificationCodeHash` VARCHAR(191) NULL,
    ADD COLUMN `emailVerificationExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `passwordResetCodeHash` VARCHAR(191) NULL,
    ADD COLUMN `passwordResetExpiresAt` DATETIME(3) NULL;
