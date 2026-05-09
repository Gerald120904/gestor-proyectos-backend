/*
  Warnings:

  - You are about to drop the column `pendingPhoneCountryCallingCode` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `pendingPhoneCountryIso2` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `pendingPhoneNationalNumber` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `pendingPhoneSentAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `phoneCountryCallingCode` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `phoneCountryIso2` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNationalNumber` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `pendingPhoneCountryCallingCode`,
    DROP COLUMN `pendingPhoneCountryIso2`,
    DROP COLUMN `pendingPhoneNationalNumber`,
    DROP COLUMN `pendingPhoneSentAt`,
    DROP COLUMN `phoneCountryCallingCode`,
    DROP COLUMN `phoneCountryIso2`,
    DROP COLUMN `phoneNationalNumber`,
    ADD COLUMN `pendingPhoneCodeHash` VARCHAR(191) NULL;
