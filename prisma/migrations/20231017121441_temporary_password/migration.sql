/*
  Warnings:

  - You are about to drop the column `passwordRecoveryToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `passwordRecoveryToken`,
    ADD COLUMN `temporaryPassword` VARCHAR(191) NULL,
    ADD COLUMN `temporaryPasswordExpiry` DATETIME(3) NULL;
