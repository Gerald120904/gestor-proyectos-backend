/*
  Warnings:

  - You are about to drop the column `emailChangeCodeHash` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `emailChangeExpiresAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `pendingPhoneCodeHash` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `phoneChangeCodeHash` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `phoneChangeExpiresAt` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[telefono]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `emailChangeCodeHash`,
    DROP COLUMN `emailChangeExpiresAt`,
    DROP COLUMN `pendingPhoneCodeHash`,
    DROP COLUMN `phoneChangeCodeHash`,
    DROP COLUMN `phoneChangeExpiresAt`,
    ADD COLUMN `pendingPhoneCountryCallingCode` VARCHAR(191) NULL,
    ADD COLUMN `pendingPhoneCountryIso2` VARCHAR(191) NULL,
    ADD COLUMN `pendingPhoneNationalNumber` VARCHAR(191) NULL,
    ADD COLUMN `pendingPhoneSentAt` DATETIME(3) NULL,
    ADD COLUMN `phoneCountryCallingCode` VARCHAR(191) NULL,
    ADD COLUMN `phoneCountryIso2` VARCHAR(191) NULL,
    ADD COLUMN `phoneNationalNumber` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_telefono_key` ON `User`(`telefono`);
