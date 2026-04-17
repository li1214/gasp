-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `status` ENUM('ACTIVE', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Listing` (
    `id` VARCHAR(191) NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,
    `gameName` VARCHAR(191) NOT NULL DEFAULT '三国志战略版',
    `title` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `osPlatform` VARCHAR(191) NOT NULL,
    `accountType` VARCHAR(191) NOT NULL,
    `serverName` VARCHAR(191) NULL,
    `seasonTier` INTEGER NOT NULL DEFAULT 1,
    `seasonDays` INTEGER NOT NULL DEFAULT 0,
    `accountLevel` INTEGER NOT NULL DEFAULT 1,
    `heroCount` INTEGER NOT NULL DEFAULT 0,
    `coreHeroCount` INTEGER NOT NULL DEFAULT 0,
    `sTacticCount` INTEGER NOT NULL DEFAULT 0,
    `treasureCount` INTEGER NOT NULL DEFAULT 0,
    `skinsCount` INTEGER NOT NULL DEFAULT 0,
    `score` INTEGER NOT NULL DEFAULT 0,
    `highlightTags` JSON NOT NULL,
    `strategyTags` JSON NOT NULL,
    `guaranteeTags` JSON NOT NULL,
    `priceCents` INTEGER NOT NULL,
    `supportBargain` BOOLEAN NOT NULL DEFAULT false,
    `isInsured` BOOLEAN NOT NULL DEFAULT false,
    `description` TEXT NOT NULL,
    `status` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'OFFLINE', 'SOLD') NOT NULL DEFAULT 'DRAFT',
    `rejectReason` VARCHAR(191) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `favoriteCount` INTEGER NOT NULL DEFAULT 0,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Listing_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Listing_osPlatform_seasonTier_idx`(`osPlatform`, `seasonTier`),
    INDEX `Listing_priceCents_idx`(`priceCents`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListingImage` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ListingImage_listingId_sortOrder_idx`(`listingId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListingAudit` (
    `id` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NULL,
    `action` ENUM('SUBMIT', 'APPROVE', 'REJECT', 'OFFLINE', 'MARK_SOLD') NOT NULL,
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ListingAudit_listingId_createdAt_idx`(`listingId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListingImage` ADD CONSTRAINT `ListingImage_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListingAudit` ADD CONSTRAINT `ListingAudit_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListingAudit` ADD CONSTRAINT `ListingAudit_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
