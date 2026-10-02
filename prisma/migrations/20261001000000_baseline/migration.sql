-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `precio` VARCHAR(191) NOT NULL,
    `imgUrl` VARCHAR(191) NOT NULL,
    `imgPublicId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(100) NULL DEFAULT 'Sin categoría',
    `empresaEnvios` INTEGER NOT NULL,
    `Linea` VARCHAR(100) NULL,
    `marca` VARCHAR(100) NULL,
    `aroma` VARCHAR(100) NULL,
    `color` VARCHAR(100) NULL,
    `tamaño` VARCHAR(100) NULL,
    `tipo` VARCHAR(100) NULL,
    `tipoPiedra` VARCHAR(100) NULL,
    `cantidad` VARCHAR(100) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,

    INDEX `products_empresaEnvios_category_idx`(`empresaEnvios`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NULL,
    `session_id` VARCHAR(191) NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cart_user_id_idx`(`user_id`),
    INDEX `cart_session_id_idx`(`session_id`),
    INDEX `cart_product_id_idx`(`product_id`),
    INDEX `cart_user_id_session_id_idx`(`user_id`, `session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category_marca` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(100) NOT NULL,
    `marca` VARCHAR(100) NOT NULL,
    `Linea` VARCHAR(100) NOT NULL,
    `aroma` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `category_marca_category_marca_aroma_Linea_key`(`category`, `marca`, `aroma`, `Linea`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deliver` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empresaId` INTEGER NOT NULL,

    INDEX `deliver_empresaId_idx`(`empresaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `fechaNac` DATETIME(3) NOT NULL,
    `calle` VARCHAR(191) NULL,
    `ciudad` VARCHAR(191) NULL,
    `provincia` VARCHAR(191) NULL,
    `codigoPostal` VARCHAR(191) NULL,
    `pais` VARCHAR(191) NULL DEFAULT 'Argentina',
    `rol` VARCHAR(191) NOT NULL DEFAULT 'user',

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reserva_id` VARCHAR(191) NOT NULL,
    `servicio_id` VARCHAR(191) NOT NULL,
    `servicio_nombre` VARCHAR(191) NOT NULL,
    `servicio_precio` VARCHAR(191) NOT NULL,
    `servicio_duracion` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `hora` VARCHAR(191) NOT NULL,
    `cliente_nombre` VARCHAR(191) NOT NULL,
    `cliente_apellido` VARCHAR(191) NOT NULL,
    `cliente_email` VARCHAR(191) NOT NULL,
    `cliente_telefono` VARCHAR(191) NOT NULL,
    `mensaje` VARCHAR(191) NULL,
    `estado` ENUM('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA') NOT NULL DEFAULT 'PENDIENTE',
    `google_event_id` VARCHAR(191) NULL,
    `google_calendar_link` VARCHAR(191) NULL,
    `emailEnviado` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reservas_reserva_id_key`(`reserva_id`),
    INDEX `reservas_reserva_id_idx`(`reserva_id`),
    INDEX `reservas_fecha_hora_idx`(`fecha`, `hora`),
    INDEX `reservas_cliente_email_idx`(`cliente_email`),
    INDEX `reservas_estado_idx`(`estado`),
    INDEX `reservas_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `subtotal` DOUBLE NOT NULL,
    `shippingCost` DOUBLE NOT NULL,
    `tax` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `shippingAddress` VARCHAR(191) NOT NULL,
    `shippingMethod` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `productImage` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brand_contacts` (
    `id` VARCHAR(191) NOT NULL,
    `brandName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `productType` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'REVIEWED', 'CONTACTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
