-- CreateTable
CREATE TABLE `Device` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `device_id` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NOT NULL,
    `assigned_srt` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Device_device_id_key`(`device_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
