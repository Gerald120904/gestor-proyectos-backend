-- AlterTable
ALTER TABLE `user` ADD COLUMN `pendingEmailCodeHash` VARCHAR(191) NULL,
    ADD COLUMN `pendingEmailExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `pendingPhoneCodeHash` VARCHAR(191) NULL,
    ADD COLUMN `pendingPhoneExpiresAt` DATETIME(3) NULL;
