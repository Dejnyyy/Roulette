-- AlterTable
ALTER TABLE `Account` ADD COLUMN `access_token` VARCHAR(191) NULL,
    ADD COLUMN `expires_at` INTEGER NULL,
    ADD COLUMN `refresh_token` VARCHAR(191) NULL;
