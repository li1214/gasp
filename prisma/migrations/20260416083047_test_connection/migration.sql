/*
  Warnings:

  - You are about to drop the column `accountLevel` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `coreHeroCount` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `guaranteeTags` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `heroCount` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `highlightTags` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `isInsured` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `osPlatform` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `seasonDays` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `seasonTier` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `skinsCount` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `strategyTags` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `treasureCount` on the `Listing` table. All the data in the column will be lost.
  - You are about to alter the column `accountType` on the `Listing` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - Added the required column `contactInfo` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverImageUrl` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Listing_osPlatform_seasonTier_idx` ON `Listing`;

-- AlterTable
ALTER TABLE `Listing` DROP COLUMN `accountLevel`,
    DROP COLUMN `coreHeroCount`,
    DROP COLUMN `guaranteeTags`,
    DROP COLUMN `heroCount`,
    DROP COLUMN `highlightTags`,
    DROP COLUMN `isInsured`,
    DROP COLUMN `osPlatform`,
    DROP COLUMN `region`,
    DROP COLUMN `score`,
    DROP COLUMN `seasonDays`,
    DROP COLUMN `seasonTier`,
    DROP COLUMN `skinsCount`,
    DROP COLUMN `strategyTags`,
    DROP COLUMN `treasureCount`,
    ADD COLUMN `collectionGeneralCount` INTEGER NULL,
    ADD COLUMN `commanderLevel` INTEGER NULL,
    ADD COLUMN `constructionDesc` TEXT NULL,
    ADD COLUMN `contactInfo` VARCHAR(191) NOT NULL,
    ADD COLUMN `coverImageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `goldPigCount` INTEGER NULL,
    ADD COLUMN `hasBigTransfer` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `heroSkinCount` INTEGER NULL,
    ADD COLUMN `jadeCount` INTEGER NULL,
    ADD COLUMN `juncaiValue` INTEGER NULL,
    ADD COLUMN `mainCityAppearance` VARCHAR(191) NULL,
    ADD COLUMN `marchEffect` VARCHAR(191) NULL,
    ADD COLUMN `orangeEquipmentCount` INTEGER NULL,
    ADD COLUMN `orangeGeneralCount` INTEGER NULL,
    ADD COLUMN `seasonServer` VARCHAR(191) NULL,
    ADD COLUMN `seasonStartDate` DATETIME(3) NULL,
    MODIFY `accountType` ENUM('LINGXI_OFFICIAL', 'CHANNEL') NOT NULL,
    MODIFY `sTacticCount` INTEGER NULL,
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `idCardNo` VARCHAR(191) NULL,
    ADD COLUMN `realName` VARCHAR(191) NULL,
    ADD COLUMN `verifiedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `Favorite` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Favorite_listingId_idx`(`listingId`),
    UNIQUE INDEX `Favorite_userId_listingId_key`(`userId`, `listingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bargain` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Bargain_listingId_createdAt_idx`(`listingId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Captcha` (
    `id` VARCHAR(191) NOT NULL,
    `scene` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Captcha_expiresAt_idx`(`expiresAt`),
    INDEX `Captcha_scene_createdAt_idx`(`scene`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteConfig` (
    `id` INTEGER NOT NULL,
    `customerServiceUrl` VARCHAR(191) NULL,
    `userGroupUrl` VARCHAR(191) NULL,
    `publishNotice` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Listing_accountType_idx` ON `Listing`(`accountType`);

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bargain` ADD CONSTRAINT `Bargain_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bargain` ADD CONSTRAINT `Bargain_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
