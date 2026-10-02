CREATE TABLE IF NOT EXISTS `product_families` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(600) NOT NULL,
    `nombre` VARCHAR(150) NOT NULL,

    UNIQUE INDEX `product_families_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @has_fk = (SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'products'
      AND CONSTRAINT_NAME = 'products_empresaEnvios_fkey');
SET @fk_sql = IF(@has_fk = 0,
    'ALTER TABLE `products` ADD CONSTRAINT `products_empresaEnvios_fkey` FOREIGN KEY (`empresaEnvios`) REFERENCES `deliver`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT 1');
PREPARE fk_stmt FROM @fk_sql;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;

SET @has_fk = (SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'cart'
      AND CONSTRAINT_NAME = 'cart_product_id_fkey');
SET @fk_sql = IF(@has_fk = 0,
    'ALTER TABLE `cart` ADD CONSTRAINT `cart_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT 1');
PREPARE fk_stmt FROM @fk_sql;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;

SET @has_fk = (SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'deliver'
      AND CONSTRAINT_NAME = 'deliver_empresaId_fkey');
SET @fk_sql = IF(@has_fk = 0,
    'ALTER TABLE `deliver` ADD CONSTRAINT `deliver_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT 1');
PREPARE fk_stmt FROM @fk_sql;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;

SET @has_fk = (SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items'
      AND CONSTRAINT_NAME = 'order_items_orderId_fkey');
SET @fk_sql = IF(@has_fk = 0,
    'ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT 1');
PREPARE fk_stmt FROM @fk_sql;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;

ALTER TABLE `products` ADD COLUMN `family_id` INTEGER NULL;

CREATE INDEX `products_family_id_idx` ON `products`(`family_id`);

ALTER TABLE `products` ADD CONSTRAINT `products_family_id_fkey`
FOREIGN KEY (`family_id`) REFERENCES `product_families`(`id`)
ON DELETE SET NULL ON UPDATE CASCADE;
