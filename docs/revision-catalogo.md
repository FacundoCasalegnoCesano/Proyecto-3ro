# Revisión del catálogo antes de cargar productos

Los hallazgos del informe original ya tienen una corrección implementada. La vidriera conserva GET público, mientras que los cambios de productos y opciones del catálogo requieren el rol administrador comprobado en el servidor. El formulario permite crear, editar y reponer variantes vinculadas a un Modelo/Familia explícito.

## Cambios completados

- `POST`, `PUT`, `PATCH` y `DELETE` de productos verifican el rol de administrador contra la base de datos. Guardar marcas, aromas y líneas usa `POST`; las lecturas GET no escriben.
- El catálogo usa `/api/catalogo` con búsqueda, categoría, orden, página y límite validados. El límite inicial es de seis grupos y el máximo permitido es 48. La base de datos cuenta y pagina grupos; luego carga todas las variantes de cada grupo de esa página. Las tarjetas conservan el orden de servidor y la búsqueda puede señalar una variante coincidente sin perder el resto del grupo.
- Los enlaces de navegación usan las categorías guardadas, por ejemplo `Sahumerio`, `Bomba de Humo`, `Lampara De Sal`, `Aromatizante De Ambientes` y `Rocio Aurico`.
- `Products` tiene `familyId` opcional y relación con `ProductFamily`. El nombre de familia define la identidad junto con categoría, marca, línea y tipo. Las filas antiguas siguen funcionando sin asignarles familia automáticamente.
- Los precios aceptan números y formato argentino; la API valida valores completos y guarda el valor numérico normalizado. El orden por precio contempla registros históricos con separadores argentinos.
- Stock acepta enteros dentro del rango de base de datos. Los incrementos y decrementos usan actualizaciones condicionales para evitar pérdidas concurrentes y stock negativo.
- Se retiró la pantalla de diagnóstico de sesión y el registro ya no imprime credenciales o datos personales en logs. Se quitó el bloque estático de credenciales de acceso. La cuenta de ejemplo existe en la base, pero la contraseña mostrada en el código no coincide con la de esa cuenta; no se requiere rotación por esta exposición. Los botones sociales sin integración también se retiraron.
- La ruta de pedidos desactivada responde `410`; si se reactiva la compra, stock, precio y orden deben validarse desde base de datos y procesarse dentro de una transacción.
- El detalle móvil apila contenido y muestra un fallback para fotos que no cargan. Las imágenes históricas que ya no existen deben cargarse de nuevo.

## Flujo para cargar el catálogo

1. En **Agregar producto**, elegí la categoría y cargá nombre, precio, descripción, stock y foto. **Modelo/Familia** es obligatorio para todo producto nuevo: usá el nombre base incluso si tendrá una sola variante, y repetilo en cada aroma, color o tamaño del mismo modelo. Cada fila conserva su propia foto, aroma, color, tamaño y stock.
2. Para sumar stock a una variante existente, usá **Modificar producto** y ajustá su stock. La reposición conserva la foto y los datos de esa variante. No cambies el nombre de Modelo/Familia para una reposición.
3. Para corregir atributos o cambiar el modelo, editá la variante concreta. Dejar el campo Modelo/Familia vacío la desvincula; no se reasignan filas automáticamente.
4. El detalle reúne las variantes de la misma familia. Cada variante mantiene su propia información e imagen.

## Despliegue y validación

El cambio de esquema es aditivo: crea `ProductFamily` y agrega `Products.familyId` nullable con `ON DELETE SET NULL`; los productos existentes siguen siendo válidos. Aplicar la migración generada antes de publicar la versión de la aplicación y regenerar Prisma Client durante el build. La aplicación nueva consulta `familyId`, así que no desplegar el código antes de que la columna y la tabla existan. No hay backfill obligatorio.

La validación final pasó el build, 28 pruebas automatizadas y 19 comprobaciones HTTP en producción local. La comparación del esquema Prisma no encontró diferencias y la verificación de checksum confirmó intactas las 10 tablas originales. No se aplicaron escrituras de productos ni se procesaron fotos históricas durante esta revisión.
