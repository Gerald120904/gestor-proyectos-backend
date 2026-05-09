-- AlterTable
ALTER TABLE `user` ADD COLUMN `firebasePhoneUid` VARCHAR(191) NULL,
    ADD COLUMN `phoneCountryIso2` VARCHAR(191) NULL,
    ADD COLUMN `phoneDialCode` VARCHAR(191) NULL;
