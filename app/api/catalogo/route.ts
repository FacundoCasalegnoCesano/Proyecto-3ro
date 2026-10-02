import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "lib/prisma";

export const dynamic = "force-dynamic";

const sortPrice = Prisma.sql`
  CASE WHEN LOCATE(',', p.precio) > 0
    THEN CAST(REPLACE(REPLACE(REPLACE(p.precio, '$', ''), '.', ''), ',', '.') AS DECIMAL(15, 2))
    WHEN REPLACE(p.precio, '$', '') REGEXP '^[[:digit:]]{1,3}(\\.[[:digit:]]{3})+$'
    THEN CAST(REPLACE(REPLACE(p.precio, '$', ''), '.', '') AS DECIMAL(15, 2))
    ELSE CAST(REPLACE(p.precio, '$', '') AS DECIMAL(15, 2))
  END
`;

const groupingKey = Prisma.sql`
  CASE
    WHEN p.family_id IS NOT NULL THEN CONCAT('family:', p.family_id)
    WHEN
      NOT (
        LOWER(COALESCE(p.category, '')) LIKE '%ceramica%'
        OR LOWER(COALESCE(p.category, '')) LIKE '%vela%'
        OR LOWER(COALESCE(p.category, '')) LIKE '%cascada de humo%'
        OR LOWER(COALESCE(p.category, '')) LIKE '%estatua%'
        OR LOWER(COALESCE(p.category, '')) LIKE '%lampara de sal%'
        OR LOWER(COALESCE(p.category, '')) LIKE '%lámpara de sal%'
        OR LOWER(COALESCE(p.category, '')) LIKE '%porta sahumerios%'
        OR LOWER(COALESCE(p.category, '')) LIKE '%accesorios%'
        OR LOWER(COALESCE(p.category, '')) LIKE '%atrapaluz%'
      )
      AND (
        (TRIM(COALESCE(p.marca, '')) <> '' AND LOWER(TRIM(p.marca)) NOT IN ('sin-marca', 'sin marca', 'sin_marca'))
        + (TRIM(COALESCE(p.category, '')) <> '')
        + (TRIM(COALESCE(p.Linea, '')) <> '' AND LOWER(TRIM(p.Linea)) NOT IN ('sin-linea', 'sin línea', 'sin_linea'))
        + (TRIM(COALESCE(p.aroma, '')) <> '' AND LOWER(TRIM(p.aroma)) NOT IN ('sin-aroma', 'sin aroma', 'sin_aroma'))
      ) >= 2
    THEN CONCAT(
      'legacy:',
      HEX(LOWER(COALESCE(NULLIF(TRIM(p.category), ''), 'sin-categoria'))), ':',
      HEX(CASE
        WHEN TRIM(COALESCE(p.marca, '')) <> '' AND LOWER(TRIM(p.marca)) NOT IN ('sin-marca', 'sin marca', 'sin_marca')
        THEN LOWER(TRIM(p.marca)) ELSE 'sin-marca' END), ':',
      HEX(CASE
        WHEN TRIM(COALESCE(p.Linea, '')) <> '' AND LOWER(TRIM(p.Linea)) NOT IN ('sin-linea', 'sin línea', 'sin_linea')
        THEN LOWER(TRIM(p.Linea)) ELSE 'sin-linea' END), ':',
      HEX(LOWER(COALESCE(NULLIF(TRIM(p.tipo), ''), 'sin-tipo')))
    )
    ELSE CONCAT('product:', p.id)
  END
`;

function searchFilter(searchParams: URLSearchParams) {
  const search = searchParams.get("search")?.trim();
  if (!search) return Prisma.sql`1 = 1`;
  const pattern = `%${search}%`;
  return Prisma.sql`(
    p.nombre LIKE ${pattern}
    OR p.descripcion LIKE ${pattern}
    OR p.marca LIKE ${pattern}
    OR p.aroma LIKE ${pattern}
    OR p.Linea LIKE ${pattern}
    OR p.tamaño LIKE ${pattern}
    OR p.color LIKE ${pattern}
    OR p.tipo LIKE ${pattern}
    OR p.tipoPiedra LIKE ${pattern}
    OR EXISTS (
      SELECT 1 FROM product_families pf
      WHERE pf.id = p.family_id AND pf.nombre LIKE ${pattern}
    )
  )`;
}

function filteredProducts(searchParams: URLSearchParams, includeSearch = true) {
  const filters: Prisma.Sql[] = [];
  const category = searchParams.get("category")?.trim();

  if (category && category !== "all" && category !== "null") {
    filters.push(Prisma.sql`p.category = ${category}`);
  }

  if (includeSearch) filters.push(searchFilter(searchParams));

  return filters.length
    ? Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`
    : Prisma.empty;
}

function orderBy(sort: string | null) {
  if (sort === "name") return Prisma.sql`sort_name ASC, newest_id DESC`;
  if (sort === "price-low") return Prisma.sql`sort_price ASC, newest_id DESC`;
  if (sort === "price-high") return Prisma.sql`sort_price DESC, newest_id DESC`;
  if (sort === "stock-low") return Prisma.sql`sort_stock ASC, newest_id DESC`;
  if (sort === "stock-high") return Prisma.sql`sort_stock DESC, newest_id DESC`;
  return Prisma.sql`newest_id DESC`;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get("page") || 1);
  const requestedLimit = Number(params.get("limit") || 6);
  if (!Number.isInteger(page) || page < 1 || page > 100000 ||
      !Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 48) {
    return NextResponse.json(
      { success: false, error: "Página o límite inválido" },
      { status: 400 }
    );
  }

  const offset = (page - 1) * requestedLimit;
  const where = filteredProducts(params);
  const groupedFrom = Prisma.sql`
    WITH filtered_products AS (
      SELECT p.*, ${groupingKey} AS group_key, ${sortPrice} AS numeric_price
      FROM products p
      ${where}
    )
  `;

  try {
    const [groups, totals] = await Promise.all([
      prisma.$queryRaw<Array<{ group_key: string; representative_id: number }>>(
        Prisma.sql`
          ${groupedFrom}
          SELECT group_key,
            MIN(id) AS representative_id,
            MAX(id) AS newest_id,
            MIN(nombre) AS sort_name,
            MIN(numeric_price) AS sort_price,
            MAX(stock) AS sort_stock
          FROM filtered_products
          GROUP BY group_key
          ORDER BY ${orderBy(params.get("sort"))}
          LIMIT ${requestedLimit} OFFSET ${offset}
        `
      ),
      prisma.$queryRaw<Array<{ total: bigint; grouped: bigint; individual: bigint }>>(
        Prisma.sql`
          ${groupedFrom},
          group_sizes AS (
            SELECT group_key, COUNT(*) AS variant_count, MAX(family_id) AS family_id
            FROM filtered_products
            GROUP BY group_key
          )
          SELECT COUNT(*) AS total,
            COALESCE(SUM(group_key LIKE 'family:%' OR group_key LIKE 'legacy:%'), 0) AS grouped,
            COALESCE(SUM(group_key LIKE 'product:%'), 0) AS individual
          FROM group_sizes
        `
      ),
    ]);

    const groupKeys = groups.map((group) => group.group_key);
    const representativeIds = new Map(groups.map((group) => [group.group_key, Number(group.representative_id)]));
    const hydrationWhere = filteredProducts(params, false);
    const hydrationFrom = Prisma.sql`
      WITH filtered_products AS (
      SELECT p.*, ${groupingKey} AS group_key, ${sortPrice} AS numeric_price
        FROM products p
        ${hydrationWhere}
      )
    `;
    const products = groupKeys.length
      ? await prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
          ${hydrationFrom}
          SELECT p.id, p.nombre, p.descripcion, p.precio, p.imgUrl, p.category,
            p.marca, p.aroma, p.Linea, p.tamaño, p.color, p.tipo, p.tipoPiedra,
            p.cantidad, p.stock, p.family_id AS familyId, pf.nombre AS familyName,
            e.nombre AS shipping,
            fp.group_key AS catalogGroupKey,
            CASE WHEN ${searchFilter(params)} THEN 1 ELSE 0 END AS matchesSearch
          FROM filtered_products fp
          JOIN products p ON p.id = fp.id
          LEFT JOIN product_families pf ON pf.id = p.family_id
          LEFT JOIN deliver d ON d.id = p.empresaEnvios
          LEFT JOIN empresa e ON e.id = d.empresaId
          WHERE fp.group_key IN (${Prisma.join(groupKeys)})
          ORDER BY FIELD(fp.group_key, ${Prisma.join(groupKeys)}), p.id DESC
        `)
      : [];

    const total = Number(totals[0]?.total || 0);
    return NextResponse.json({
      success: true,
      data: products.map((product) => ({
        id: Number(product.id),
        name: product.nombre,
        price: String(product.precio),
        formattedPrice: product.precio,
        image: product.imgUrl,
        category: product.category || "Sin categoría",
        marca: product.marca || "",
        aroma: product.aroma || "",
        linea: product.Linea || "",
        tamaño: product.tamaño || "",
        color: product.color || "",
        tipo: product.tipo || "",
        piedra: product.tipoPiedra || "",
        cantidad: product.cantidad || "",
        stock: Number(product.stock || 0),
        status: Number(product.stock) === 0 ? "agotado" : Number(product.stock) <= 5 ? "bajo-stock" : "disponible",
        shipping: product.shipping || "Envío Gratis",
        src: product.imgUrl,
        description: product.descripcion,
        familyId: product.familyId === null ? null : Number(product.familyId),
        familyName: product.familyName || null,
        matchesSearch: Number(product.matchesSearch) === 1,
        catalogGroupKey: String(product.catalogGroupKey),
        catalogRepresentative:
          Number(product.id) === representativeIds.get(String(product.catalogGroupKey)),
      })),
      pagination: {
        page,
        limit: requestedLimit,
        total,
        totalPages: Math.ceil(total / requestedLimit),
        grouped: Number(totals[0]?.grouped || 0),
        individual: Number(totals[0]?.individual || 0),
      },
    });
  } catch (error) {
    console.error("Error al paginar el catálogo", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
