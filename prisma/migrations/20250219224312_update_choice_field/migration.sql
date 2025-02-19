/*
  Warnings:

  - You are about to alter the column `choice` on the `Bet` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `Bet` MODIFY `choice` JSON NOT NULL;
