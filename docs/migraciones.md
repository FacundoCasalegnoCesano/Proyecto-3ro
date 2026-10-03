# Migraciones de base de datos

`npm run build` genera Prisma Client y compila la aplicación. Solo `npm run db:migrate:deploy` cambia el esquema.

## Base existente

Guardá un dump SQL consistente fuera del proyecto y un snapshot de conteos y huellas:

```powershell
npm run db:backup:sql -- C:/Users/OS/Desktop/catalogo-backup.sql
npm run db:snapshot -- backup C:/Users/OS/Desktop/catalogo-checksum.json
npm run db:snapshot -- verify C:/Users/OS/Desktop/catalogo-checksum.json
```

El dump usa `mysqldump --single-transaction` sin instrucciones `DROP`, `CREATE DATABASE` ni `USE`; al terminar informa SHA-256 y cantidad de tablas. El snapshot JSON agrega conteos y huellas SHA-256 por tabla. Ambos contienen todos los datos de la base: guardalos en un lugar privado fuera del proyecto. Para restaurar el dump, conectate con `mysql.exe -h <host> -u <usuario> -p <base-vacía>`, ingresá la contraseña en el prompt y ejecutá `source C:/ruta/catalogo-backup.sql;` desde el cliente.

Compará la base existente con el esquema físico previo a las migraciones:

```powershell
npx prisma migrate diff --from-schema-datasource prisma/baseline-schema.prisma --to-schema-datamodel prisma/baseline-schema.prisma --exit-code
```

El comando debe informar `No difference detected.` El baseline representa las diez tablas originales. La base existente ya tenía las relaciones de `deliver.empresaId` y `products.empresaEnvios`; la migración conserva esas claves y agrega las faltantes de `cart.product_id` y `order_items.orderId`, además de la familia opcional. Confirmá que no haya filas huérfanas en las cuatro relaciones antes de desplegar. En MySQL con `lower_case_table_names=1`, usá en `DATABASE_URL` el nombre físico de la base con su capitalización canónica; Prisma puede omitir claves foráneas al comparar una ruta con mayúsculas distintas, como se reporta en [Prisma issue #27712](https://github.com/prisma/prisma/issues/27712). Tras verificar, registrá el baseline y desplegá:

```powershell
npx prisma migrate resolve --applied 20261001000000_baseline
npm run db:migrate:deploy
npm run db:snapshot -- verify C:/Users/OS/Desktop/catalogo-checksum.json
```

La segunda migración agrega las dos relaciones faltantes y la familia opcional de producto. No completa familias para filas históricas; quedan con `family_id = NULL` hasta que se vinculen desde edición.

La tercera migración (`20261003000000_product_description_text`) cambia `products.descripcion` de `VARCHAR(191)` a `TEXT`. Resuelve el error Prisma P2000 al guardar descripciones de más de 191 caracteres. En una base existente que ya tiene el baseline y `20261002000000_product_families` registrados como aplicados, verificá y desplegá la migración pendiente antes de publicar la aplicación:

```powershell
npm run db:migrate:status
npm run db:migrate:deploy
npm run build
```

Si la base existente todavía no tiene historial Prisma, seguí primero la sección de base existente: compará el esquema, hacé el backup y registrá el baseline una sola vez con `prisma migrate resolve`. No vuelvas a registrar ni ejecutar el baseline cuando ya figura como aplicado; `db:migrate:deploy` debe aplicar únicamente la tercera migración pendiente. En una base nueva, `db:migrate:deploy` aplica las tres migraciones en orden.

## Carga de variantes

Al crear variantes, repetí el mismo valor en “Modelo / familia” para cada aroma, tamaño o color y cargá una imagen propia por variante. Reponer stock conserva la imagen de la variante existente. Para agrupar un producto histórico, abrilo desde edición y asignale el modelo; la imagen no se reemplaza al asignar la familia. Los precios se ingresan en pesos, por ejemplo `1290,50`.

## Base nueva

Con `DATABASE_URL` apuntando a una base vacía:

```powershell
npm run db:migrate:deploy
```

Se aplican baseline y migraciones posteriores en orden.

## Reversión

Para revertir cambios manualmente, consultá primero el respaldo y quitá solo las restricciones que la migración correspondiente agregó en esa base. En la base local existente, conserva `products_empresaEnvios_fkey` y `deliver_empresaId_fkey`, que ya existían; se agregaron `cart_product_id_fkey`, `order_items_orderId_fkey` y `products_family_id_fkey`. Para `descripcion`, no reduzcas automáticamente la columna a `VARCHAR(191)`: primero verificá que no existan valores de más de 191 caracteres y respaldá los datos, porque una reducción puede truncar o rechazar textos largos. Después de quitar las restricciones agregadas, quitá `products_family_id_idx`, `products.family_id` y finalmente `product_families`. No quites claves preexistentes.
