import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";
import { Prisma } from "@prisma/client";
import { verifyAdminRole } from "lib/auth-utils";
import { createHash } from "crypto";
import { parsePriceInput } from "utils/price-utils";
import {
  buildRestockUpdateData,
  findProductVariant,
} from "utils/productVariantMatcher";

export const dynamic = "force-dynamic";

async function requireAdminResponse() {
  const admin = await verifyAdminRole();
  if (!admin.isAdmin) {
    return NextResponse.json(
      { success: false, error: admin.error },
      { status: admin.status }
    );
  }
  return null;
}

async function saveCatalogOption(body: Record<string, unknown>) {
  const kind = body.catalogOption;
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const marca = typeof body.marca === "string" ? body.marca.trim() : "";
  const aroma = typeof body.aroma === "string" ? body.aroma.trim() : "";
  const linea = typeof body.linea === "string" ? body.linea.trim() : "";

  if (!category || !marca ||
    (kind !== "marca" && kind !== "aroma" && kind !== "linea") ||
    (kind === "aroma" && !aroma) || (kind === "linea" && !linea)) {
    return NextResponse.json(
      { success: false, error: "Los datos de categoría, marca, aroma o línea son inválidos" },
      { status: 400 }
    );
  }

  if (kind === "aroma" && !aroma) {
    return NextResponse.json({ success: false, error: "Se requiere aroma" }, { status: 400 });
  }

  const values = {
    category,
    marca,
    aroma: kind === "aroma" ? aroma : kind === "linea" ? aroma : "",
    Linea: kind === "linea" ? linea : "",
  };

  await prisma.categoryMarca.upsert({
    where: { category_marca_aroma_Linea: values },
    update: {},
    create: values,
  });

  return NextResponse.json({ success: true, message: "Opción guardada exitosamente" });
}

function buildProductFamilyKey(
  { category, marca, linea, tipo, familyName }: {
    category: string;
    marca?: string | null;
    linea?: string | null;
    tipo?: string | null;
    familyName: string;
  }
) {
  const values = [category, marca || "", linea || "", tipo || "", familyName]
    .map((value) => value.trim().toLowerCase());
  return createHash("sha256").update(values.join("\0")).digest("hex");
}

async function resolveProductFamily(
  tx: Prisma.TransactionClient,
  family: Parameters<typeof buildProductFamilyKey>[0]
) {
  const key = buildProductFamilyKey(family);
  return tx.productFamily.upsert({
    where: { key },
    update: { nombre: family.familyName.trim() },
    create: { key, nombre: family.familyName.trim() },
  });
}

export async function POST(request: NextRequest) {
  try {
    const adminResponse = await requireAdminResponse();
    if (adminResponse) return adminResponse;

    console.log("📦 Recibiendo solicitud para crear producto...");

    const body = await request.json();
    if (body.catalogOption) return await saveCatalogOption(body);

    const {
      nombre,
      precio,
      descripcion,
      imgUrl,
      imgPublicId,
      category,
      marca,
      aroma,
      cantidad,
      linea,
      tamaño,
      color,
      tipo,
      piedra,
      familyName,
    } = body;

    // Validar campos requeridos básicos
    if (
      !nombre ||
      !precio ||
      !descripcion ||
      !category ||
      !cantidad
    ) {
      console.log("❌ Faltan campos requeridos");
      return NextResponse.json(
        {
          success: false,
          error:
            "Faltan campos requeridos: nombre, precio, descripcion, category, cantidad",
        },
        { status: 400 }
      );
    }

    if (familyName !== undefined &&
      (typeof familyName !== "string" || familyName.trim().length > 150)) {
      return NextResponse.json(
        { success: false, error: "El nombre del modelo no puede superar 150 caracteres" },
        { status: 400 }
      );
    }

    const normalizedFamilyName = typeof familyName === "string" ? familyName.trim() : "";
    const existingFamily = normalizedFamilyName
      ? await prisma.productFamily.findUnique({
          where: {
            key: buildProductFamilyKey({
              category,
              marca,
              linea,
              tipo,
              familyName: normalizedFamilyName,
            }),
          },
          select: { id: true },
        })
      : null;
    const requestedFamilyId = existingFamily?.id ?? null;

    // Determinar campos requeridos según la categoría
    const getCamposRequeridos = (category: string) => {
      if (!category)
        return {
          marca: false,
          aroma: false,
          linea: false,
          tamaño: false,
          color: false,
          tipo: false,
          piedra: false,
          cantidad: false,
        };

      const cat = category.toLowerCase();

      if (cat.includes("rocio aurico")) {
        return {
          marca: true,
          aroma: true,
          linea: true,
          tamaño: false,
          color: false,
          tipo: false,
          piedra: false,
          cantidad: false,
        };
      }
      if (
        cat.includes("aromatizante de ambiente") ||
        cat.includes("aromatizante de ambientes")
      ) {
        return {
          marca: true,
          aroma: true,
          linea: true,
          tamaño: false,
          color: false,
          tipo: false,
          piedra: false,
          cantidad: false,
        };
      }
      if (
        cat.includes("aromatizante para auto") ||
        cat.includes("aromatizante de auto")
      ) {
        return {
          marca: true,
          aroma: true,
          linea: true,
          tamaño: false,
          color: false,
          tipo: false,
          piedra: false,
          cantidad: false,
        };
      }
      if (cat.includes("esencia")) {
        return {
          marca: true,
          aroma: true,
          linea: true,
          tamaño: false,
          color: false,
          tipo: false,
          piedra: false,
          cantidad: false,
        };
      }
      if (cat.includes("incienso")) {
        return {
          marca: true,
          aroma: true,
          linea: true,
          tamaño: false,
          color: false,
          tipo: false,
          piedra: false,
          cantidad: false,
        };
      }
      if (cat.includes("bombas de humo")) {
        return {
          marca: true,
          aroma: true,
          linea: true,
          tamaño: false,
          color: false,
          tipo: false,
          piedra: false,
          cantidad: false,
        };
      }
      if (cat.includes("vela")) {
        return {
          marca: true,
          aroma: false,
          linea: false,
          tamaño: true,
          color: false,
          tipo: false,
          piedra: false,
          cantidad: true,
        };
      }
      if (cat.includes("cascada de humo")) {
        return {
          marca: false,
          aroma: false,
          linea: false,
          tamaño: true,
          color: false,
          tipo: false,
          piedra: false,
          cantidad: false,
        };
      }
      if (cat.includes("estatua")) {
        return {
          marca: false,
          aroma: false,
          linea: false,
          tamaño: true,
          color: false,
          tipo: false,
          piedra: false,
          cantidad: false,
        };
      }
      if (cat.includes("lampara de sal")) {
        return {
          marca: false,
          aroma: false,
          linea: false,
          tamaño: true,
          color: true,
          tipo: false,
          piedra: false,
          cantidad: false,
        };
      }
      if (cat.includes("porta sahumerios")) {
        return {
          marca: false,
          aroma: false,
          linea: false,
          tamaño: true,
          color: false,
          tipo: false,
          piedra: false,
          cantidad: false,
        };
      }
      // NUEVO: Categoría Cerámica
      if (cat.includes("ceramica") || cat.includes("cerámica")) {
        return {
          marca: false,
          aroma: false,
          linea: false,
          tamaño: true,
          color: false,
          tipo: true, // Tipo es requerido para cerámica
          piedra: false,
          cantidad: false,
        };
      }
      if (cat.includes("accesorios")) {
        return {
          marca: false,
          aroma: false,
          linea: false,
          tamaño: false,
          color: false,
          tipo: true,
          piedra: false,
          cantidad: false,
        };
      }
      // Para sahumerios y otros por defecto
      return {
        marca: true,
        aroma: true,
        linea: true,
        tamaño: false,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: false,
      };
    };

    // Función para determinar si se requiere piedra (solo para collares en accesorios)
    const requierePiedra = (category: string, tipo: string) => {
      return (
        category.toLowerCase().includes("accesorios") &&
        tipo &&
        tipo.toLowerCase().includes("collar")
      );
    };

    const camposRequeridos = getCamposRequeridos(category);

    // Validar campos según la categoría
    if (camposRequeridos.marca && !marca) {
      return NextResponse.json(
        {
          success: false,
          error: "La marca es requerida para esta categoría",
        },
        { status: 400 }
      );
    }

    if (camposRequeridos.aroma && !aroma) {
      return NextResponse.json(
        {
          success: false,
          error: `El aroma es requerido para productos de categoría ${category}`,
        },
        { status: 400 }
      );
    }

    if (camposRequeridos.tamaño && !tamaño) {
      return NextResponse.json(
        {
          success: false,
          error: `El tamaño es requerido para productos de categoría ${category}`,
        },
        { status: 400 }
      );
    }

    if (camposRequeridos.color && !color) {
      return NextResponse.json(
        {
          success: false,
          error: `El color es requerido para productos de categoría ${category}`,
        },
        { status: 400 }
      );
    }

    if (camposRequeridos.tipo && !tipo) {
      return NextResponse.json(
        {
          success: false,
          error: `El tipo es requerido para productos de categoría ${category}`,
        },
        { status: 400 }
      );
    }

    // Validar cantidad solo si la categoría requiere cantidad (velas)
    if (camposRequeridos.cantidad && !cantidad) {
      return NextResponse.json(
        {
          success: false,
          error: `La cantidad por pack es requerida para productos de categoría ${category}`,
        },
        { status: 400 }
      );
    }

    // Validar piedra solo si es collar en accesorios
    if (requierePiedra(category, tipo || "")) {
      if (!piedra) {
        return NextResponse.json(
          {
            success: false,
            error: "El tipo de piedra es requerido para collares",
          },
          { status: 400 }
        );
      }
    }

    // Validar precio
    const precioNumerico = parsePriceInput(precio);
    if (precioNumerico === null || !Number.isFinite(precioNumerico) || precioNumerico <= 0) {
      console.log("❌ Precio inválido");
      return NextResponse.json(
        {
          success: false,
          error: "El precio debe ser un número válido mayor a 0",
        },
        { status: 400 }
      );
    }

    // Validar cantidad
    const cantidadNumerica = typeof cantidad === "number" ? cantidad : Number(cantidad);
    if ((typeof cantidad !== "number" && typeof cantidad !== "string") ||
        (typeof cantidad === "string" && !/^\d+$/.test(cantidad)) ||
        !Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0 || cantidadNumerica > 2147483647) {
      console.log("❌ Cantidad inválida");
      return NextResponse.json(
        {
          success: false,
          error: "La cantidad debe ser un número válido mayor a 0",
        },
        { status: 400 }
      );
    }

    // Buscar producto existente
    let productoExistente = null;

    console.log("🔍 Buscando producto existente con:", {
      category,
      marca,
      aroma,
      linea,
      tamaño,
      color,
      tipo,
      piedra,
      nombre,
      cantidad: camposRequeridos.cantidad ? cantidad : undefined,
    });

    const whereClause: Prisma.ProductsWhereInput = {
      category: category.trim(),
      nombre: nombre.trim(),
    };

    const dimensions = [
      "marca",
      "aroma",
      "linea",
      "tamaño",
      "color",
      "tipo",
      "piedra",
      ...(camposRequeridos.cantidad ? ["cantidad"] : []),
    ];

    const productosMismoNombre = await prisma.products.findMany({
      where: whereClause,
      orderBy: { id: "asc" },
    });
    productoExistente = findProductVariant(
      productosMismoNombre
        .filter((producto) =>
          requestedFamilyId !== null
            ? producto.familyId === requestedFamilyId
            : !normalizedFamilyName && !producto.familyId
        )
        .map((producto) => ({
        nombre: producto.nombre,
        category: producto.category,
        marca: producto.marca,
        aroma: producto.aroma,
        Linea: producto.Linea,
        tamaño: producto.tamaño,
        color: producto.color,
        tipo: producto.tipo,
        tipoPiedra: producto.tipoPiedra,
        cantidad: producto.cantidad,
        producto,
        })),
      { nombre, category, marca, aroma, linea, tamaño, color, tipo, piedra, cantidad },
      dimensions
    )?.producto || null;

    // Si existe un producto, incrementar su stock
    if (productoExistente) {
      console.log("✅ Producto existente encontrado, incrementando stock...");

      const productoActualizado = await prisma.$transaction(async (tx) => {
        const data: Prisma.ProductsUncheckedUpdateInput = buildRestockUpdateData(productoExistente, {
          quantity: cantidadNumerica,
          price: precioNumerico,
          description: descripcion,
          cantidad: String(cantidadNumerica),
          includeQuantity: camposRequeridos.cantidad,
        });
        if (typeof familyName === "string") {
          data.familyId = familyName.trim()
            ? (await resolveProductFamily(tx, { category, marca, linea, tipo, familyName })).id
            : null;
        }

        return tx.products.update({
          where: { id: productoExistente.id },
          data,
          include: {
            envios: { include: { empresa: true } },
            family: true,
          },
        });
      });

      console.log(
        `✅ Stock actualizado para producto existente. Stock anterior: ${productoExistente.stock}, Stock agregado: ${cantidadNumerica}, Stock nuevo: ${productoActualizado.stock}`
      );

      return NextResponse.json(
        {
          success: true,
          message: `Stock incrementado para el producto existente. Stock anterior: ${productoExistente.stock}, Stock nuevo: ${productoActualizado.stock}`,
          data: {
            ...productoActualizado,
            stockAnterior: productoExistente.stock,
            stockAgregado: cantidadNumerica,
            stockNuevo: productoActualizado.stock,
          },
        },
        { status: 200 }
      );
    }

    if (!imgUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Se requiere una imagen para crear una variante nueva",
        },
        { status: 400 }
      );
    }

    // Si no existe un producto similar, crear nuevo producto

    // Guardar la relación categoría-marca-aroma-línea (solo si aplica)
    if (marca) {
      try {
        await prisma.categoryMarca.upsert({
          where: {
            category_marca_aroma_Linea: {
              category: category.trim(),
              marca: marca.trim(),
              aroma: aroma?.trim() || "",
              Linea: linea?.trim() || "",
            },
          },
          update: {},
          create: {
            category: category.trim(),
            marca: marca.trim(),
            aroma: aroma?.trim() || "",
            Linea: linea?.trim() || "",
          },
        });
        console.log("✅ Relación categoría-marca-aroma-línea guardada");
      } catch (error) {
        console.log(
          "⚠️ Error al guardar relación (puede ser duplicado):",
          error
        );
      }
    }

    // Buscar o crear empresa de envíos
    let empresaEnviosId: number;
    const shippingDefault = "Envío Gratis";

    const deliverExistente = await prisma.deliver.findFirst({
      include: {
        empresa: true,
      },
      where: {
        empresa: {
          nombre: shippingDefault,
        },
      },
    });

    if (deliverExistente) {
      empresaEnviosId = deliverExistente.id;
      console.log("✅ Empresa de envíos existente:", deliverExistente.id);
    } else {
      console.log("🆕 Creando nueva empresa de envíos...");

      const nuevaEmpresa = await prisma.empresa.create({
        data: {
          nombre: shippingDefault,
          direccion: "Dirección por defecto",
          telefono: "000-000-000",
        },
      });

      const nuevoDeliver = await prisma.deliver.create({
        data: {
          empresaId: nuevaEmpresa.id,
        },
      });

      empresaEnviosId = nuevoDeliver.id;
      console.log("✅ Nueva empresa creada:", nuevoDeliver.id);
    }

    // Crear nuevo producto
    console.log("🛒 Creando producto nuevo...");

    const nuevoProducto = await prisma.$transaction(async (tx) => {
      const familyId = typeof familyName === "string" && familyName.trim()
        ? (await resolveProductFamily(tx, {
            category,
            marca,
            linea,
            tipo,
            familyName,
          })).id
        : null;

      return tx.products.create({
        data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: String(precioNumerico),
        imgUrl: imgUrl,
        imgPublicId: imgPublicId || "",
        category: category.trim(),
        marca: marca?.trim() || null,
        aroma: aroma?.trim() || null,
        Linea: linea?.trim() || null,
        tamaño: tamaño?.trim() || null,
        color: color?.trim() || null,
        tipo: tipo?.trim() || null,
        tipoPiedra: piedra?.trim() || null,
        cantidad: camposRequeridos.cantidad ? String(cantidadNumerica) : null,
        stock: cantidadNumerica,
          empresaEnvios: empresaEnviosId,
          familyId,
        },
        include: {
          envios: {
            include: {
              empresa: true,
            },
          },
          family: true,
        },
      });
    });

    console.log("✅ Producto creado exitosamente:", nuevoProducto.id);

    return NextResponse.json(
      {
        success: true,
        message: "Producto creado exitosamente",
        data: {
          ...nuevoProducto,
          stockInicial: cantidadNumerica,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor al crear el producto",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const familyIdParam = searchParams.get("familyId");
    const category = searchParams.get("category");
    const marca = searchParams.get("marca");
    const aroma = searchParams.get("aroma");
    const linea = searchParams.get("linea");
    const tamaño = searchParams.get("tamaño");
    const color = searchParams.get("color");
    const tipo = searchParams.get("tipo");
    const piedra = searchParams.get("piedra");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const limit = searchParams.get("limit");
    const getCategories = searchParams.get("getCategories");
    const getMarcas = searchParams.get("getMarcas");
    const getAromas = searchParams.get("getAromas");
    const getLineas = searchParams.get("getLineas");
    // Endpoint para obtener líneas únicas por categoría, marca y aroma
    if (getLineas === "true") {
      try {
        const categoryFilter = searchParams.get("category");
        const marcaFilter = searchParams.get("marca");
        const aromaFilter = searchParams.get("aroma");

        if (!categoryFilter || !marcaFilter) {
          return NextResponse.json({
            success: false,
            data: [],
          });
        }

        const whereClause: Prisma.CategoryMarcaWhereInput = {
          category: categoryFilter,
          marca: marcaFilter,
          Linea: {
            not: "",
          },
        };

        const categoryLineas = await prisma.categoryMarca.findMany({
          where: whereClause,
          select: {
            Linea: true,
          },
          distinct: ["Linea"],
        });

        const uniqueLineas = categoryLineas
          .map((cl) => cl.Linea)
          .filter(
            (linea): linea is string => linea !== null && linea.trim() !== ""
          )
          .sort();

        console.log(
          `✅ Líneas encontradas para "${marcaFilter}" en "${categoryFilter}"${
            aromaFilter ? ` con aroma "${aromaFilter}"` : ""
          }:`,
          uniqueLineas.length
        );

        return NextResponse.json({
          success: true,
          data: uniqueLineas,
        });
      } catch (error) {
        console.error("❌ Error al obtener líneas:", error);
        return NextResponse.json({
          success: false,
          data: [],
        });
      }
    }

    // Endpoint para obtener aromas únicos por categoría, marca y línea
    if (getAromas === "true") {
      try {
        const categoryFilter = searchParams.get("category");
        const marcaFilter = searchParams.get("marca");
        const lineaFilter = searchParams.get("linea");

        if (!categoryFilter || !marcaFilter) {
          return NextResponse.json({
            success: false,
            data: [],
          });
        }

        const whereClause: Prisma.CategoryMarcaWhereInput = {
          category: categoryFilter,
          marca: marcaFilter,
          aroma: {
            not: "",
          },
        };

        if (lineaFilter && lineaFilter.trim() !== "") {
          whereClause.Linea = lineaFilter;
        }

        const categoryAromas = await prisma.categoryMarca.findMany({
          where: whereClause,
          select: {
            aroma: true,
          },
          distinct: ["aroma"],
        });

        const uniqueAromas = categoryAromas
          .map((ca) => ca.aroma)
          .filter(
            (aroma): aroma is string => aroma !== null && aroma.trim() !== ""
          )
          .sort();

        console.log(
          `✅ Aromas encontrados para "${marcaFilter}" en "${categoryFilter}"${
            lineaFilter ? ` de línea "${lineaFilter}"` : ""
          }:`,
          uniqueAromas.length
        );

        return NextResponse.json({
          success: true,
          data: uniqueAromas,
        });
      } catch (error) {
        console.error("❌ Error al obtener aromas:", error);
        return NextResponse.json({
          success: false,
          data: [],
        });
      }
    }

    // Endpoint para obtener categorías únicas
    if (getCategories === "true") {
      try {
        const categories = await prisma.products.findMany({
          select: {
            category: true,
          },
          distinct: ["category"],
          where: {
            category: {
              not: null,
            },
          },
        });

        const uniqueCategories = categories
          .map((p) => p.category)
          .filter((cat): cat is string => cat !== null && cat.trim() !== "")
          .sort();

        console.log(
          "✅ Categorías únicas encontradas:",
          uniqueCategories.length
        );

        return NextResponse.json({
          success: true,
          data: uniqueCategories,
        });
      } catch (error) {
        console.error("❌ Error al obtener categorías:", error);
        return NextResponse.json({
          success: false,
          data: [],
        });
      }
    }

    // Endpoint para obtener marcas únicas por categoría
    if (getMarcas === "true") {
      try {
        const categoryFilter = searchParams.get("category");
        let uniqueMarcas: string[] = [];

        if (categoryFilter && categoryFilter.trim() !== "") {
          const categoryMarcas = await prisma.categoryMarca.findMany({
            where: {
              category: categoryFilter,
            },
            select: {
              marca: true,
            },
            distinct: ["marca"],
          });

          uniqueMarcas = categoryMarcas
            .map((cm) => cm.marca)
            .filter(
              (marca): marca is string => marca !== null && marca.trim() !== ""
            )
            .sort();

          console.log(
            `✅ Marcas encontradas en CategoryMarca para "${categoryFilter}":`,
            uniqueMarcas.length
          );

          if (uniqueMarcas.length === 0) {
            const productoMarcas = await prisma.products.findMany({
              select: {
                marca: true,
              },
              distinct: ["marca"],
              where: {
                category: categoryFilter,
                marca: {
                  not: null,
                },
              },
            });

            uniqueMarcas = productoMarcas
              .map((p) => p.marca)
              .filter(
                (marca): marca is string =>
                  marca !== null && marca.trim() !== ""
              )
              .sort();

            console.log(
              `✅ Marcas encontradas en Products para migración "${categoryFilter}":`,
              uniqueMarcas.length
            );

          }
        } else {
          const allMarcas = await prisma.categoryMarca.findMany({
            select: {
              marca: true,
            },
            distinct: ["marca"],
          });

          uniqueMarcas = allMarcas
            .map((cm) => cm.marca)
            .filter(
              (marca): marca is string => marca !== null && marca.trim() !== ""
            )
            .sort();
        }

        console.log(
          `✅ Total marcas únicas encontradas para categoría "${
            categoryFilter || "todas"
          }":`,
          uniqueMarcas.length
        );

        return NextResponse.json({
          success: true,
          data: uniqueMarcas,
        });
      } catch (error) {
        console.error("❌ Error al obtener marcas:", error);
        return NextResponse.json({
          success: false,
          data: [],
        });
      }
    }

    // Obtener producto por ID
    if (id) {
      console.log("📦 Obteniendo producto con ID:", id);

      const productId = Number(id);
      if (!Number.isSafeInteger(productId) || productId < 1) {
        return NextResponse.json(
          {
            success: false,
            error: "ID de producto inválido",
          },
          { status: 400 }
        );
      }

      const producto = await prisma.products.findUnique({
        where: { id: productId },
        include: {
          family: true,
          envios: {
            include: {
              empresa: true,
            },
          },
        },
      });

      if (!producto) {
        return NextResponse.json(
          {
            success: false,
            error: "Producto no encontrado",
          },
          { status: 404 }
        );
      }

      const calculateStatus = (stock: number) => {
        if (stock === 0) return "agotado";
        if (stock <= 5) return "bajo-stock";
        return "disponible";
      };

      const priceNumber = parsePriceInput(producto.precio) ?? 0;

      const formattedProduct = {
        id: producto.id,
        name: producto.nombre,
        price: priceNumber,
        formattedPrice: `${producto.precio}`,
        image: producto.imgUrl,
        category: producto.category || "Sin categoría",
        marca: producto.marca || "",
        aroma: producto.aroma || "",
        linea: producto.Linea || "",
        tamaño: producto.tamaño || "",
        color: producto.color || "",
        tipo: producto.tipo || "",
        piedra: producto.tipoPiedra || "",
        cantidad: producto.cantidad || "",
        stock: producto.stock,
        status: calculateStatus(producto.stock),
        shipping: producto.envios?.empresa?.nombre || "Envío Gratis",
        src: producto.imgUrl,
        description: producto.descripcion,
        familyId: producto.familyId,
        familyName: producto.family?.nombre || null,
      };

      console.log("✅ Producto encontrado:", formattedProduct.name);

      return NextResponse.json({
        success: true,
        data: formattedProduct,
      });
    }

    // Obtener lista de productos con filtros
    console.log("📦 Obteniendo productos con filtros:", {
      category,
      marca,
      aroma,
      linea,
      tamaño,
      color,
      tipo,
      piedra,
      search,
      sort,
      limit,
    });

    const where: Prisma.ProductsWhereInput = {};

    if (familyIdParam !== null) {
      const familyId = Number(familyIdParam);
      if (!Number.isSafeInteger(familyId) || familyId < 1) {
        return NextResponse.json(
          { success: false, error: "ID de familia inválido" },
          { status: 400 }
        );
      }
      where.familyId = familyId;
    }

    if (category && category !== "all" && category !== "null") {
      where.category = category;
    }

    if (marca && marca !== "all" && marca !== "null") {
      where.marca = marca;
    }

    if (aroma && aroma !== "all" && aroma !== "null") {
      where.aroma = aroma;
    }

    if (linea && linea !== "all" && linea !== "null") {
      where.Linea = linea;
    }

    if (tamaño && tamaño !== "all" && tamaño !== "null") {
      where.tamaño = tamaño;
    }

    if (color && color !== "all" && color !== "null") {
      where.color = color;
    }

    if (tipo && tipo !== "all" && tipo !== "null") {
      where.tipo = tipo;
    }

    if (piedra && piedra !== "all" && piedra !== "null") {
      where.tipoPiedra = piedra;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { descripcion: { contains: search } },
        { marca: { contains: search } },
        { aroma: { contains: search } },
        { Linea: { contains: search } },
        { tamaño: { contains: search } },
        { color: { contains: search } },
        { tipo: { contains: search } },
        { tipoPiedra: { contains: search } },
      ];
    }

    let orderBy: Prisma.ProductsOrderByWithRelationInput = { id: "desc" };

    if (sort === "price-low") {
      orderBy = { precio: "asc" };
    } else if (sort === "price-high") {
      orderBy = { precio: "desc" };
    } else if (sort === "name") {
      orderBy = { nombre: "asc" };
    } else if (sort === "stock-low") {
      orderBy = { stock: "asc" };
    } else if (sort === "stock-high") {
      orderBy = { stock: "desc" };
    } else if (sort === "newest") {
      orderBy = { id: "desc" };
    }

    const take = limit === null ? 100 : Number(limit);
    const offsetParam = searchParams.get("offset");
    const skip = offsetParam === null ? 0 : Number(offsetParam);
    if (!Number.isInteger(take) || take < 1 || take > 100 ||
        !Number.isInteger(skip) || skip < 0 || skip > 100000) {
      return NextResponse.json(
        { success: false, error: "Límite u offset inválido" },
        { status: 400 }
      );
    }

    console.log("🔍 Consulta a la base de datos:", { where, orderBy, take });

    const productos = await prisma.products.findMany({
      where,
      orderBy,
      take,
      skip,
      include: {
        family: true,
        envios: {
          include: {
            empresa: true,
          },
        },
      },
    });

    console.log(`✅ ${productos.length} productos encontrados`);

    const calculateStatus = (stock: number) => {
      if (stock === 0) return "agotado";
      if (stock <= 5) return "bajo-stock";
      return "disponible";
    };

    const formattedProducts = productos.map((producto) => {
      const priceNumber = parsePriceInput(producto.precio) ?? 0;

      return {
        id: producto.id,
        name: producto.nombre,
        price: priceNumber,
        formattedPrice: `${producto.precio}`,
        image: producto.imgUrl,
        category: producto.category || "Sin categoría",
        marca: producto.marca || "",
        aroma: producto.aroma || "",
        linea: producto.Linea || "",
        tamaño: producto.tamaño || "",
        color: producto.color || "",
        tipo: producto.tipo || "",
        piedra: producto.tipoPiedra || "",
        cantidad: producto.cantidad || "",
        stock: producto.stock,
        status: calculateStatus(producto.stock),
        shipping: producto.envios?.empresa?.nombre || "Envío Gratis",
        src: producto.imgUrl,
        description: producto.descripcion,
        familyId: producto.familyId,
        familyName: producto.family?.nombre || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedProducts,
    });
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminResponse = await requireAdminResponse();
    if (adminResponse) return adminResponse;

    const body = await request.json();

    const {
      id,
      nombre,
      precio,
      descripcion,
      imgUrl,
      imgPublicId,
      category,
      marca,
      aroma,
      linea,
      tamaño,
      color,
      tipo,
      piedra,
      cantidad,
      familyName,
      stock,
      shipping,
    } = body;

    if (!id || !nombre || !precio || !descripcion || !imgUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Faltan campos requeridos: id, nombre, precio, descripcion, imgUrl",
        },
        { status: 400 }
      );
    }

    if (familyName !== undefined &&
      (typeof familyName !== "string" || familyName.trim().length > 150)) {
      return NextResponse.json(
        { success: false, error: "El nombre del modelo no puede superar 150 caracteres" },
        { status: 400 }
      );
    }

    const productoExistente = await prisma.products.findUnique({
      where: { id: parseInt(id) },
    });

    if (!productoExistente) {
      return NextResponse.json(
        {
          success: false,
          error: "Producto no encontrado",
        },
        { status: 404 }
      );
    }

    const precioNumerico = parsePriceInput(precio);
    if (precioNumerico === null || !Number.isFinite(precioNumerico) || precioNumerico <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El precio debe ser un número válido mayor a 0",
        },
        { status: 400 }
      );
    }

    let stockFinal = productoExistente.stock;
    if (stock !== undefined) {
      stockFinal = typeof stock === "number" ? stock : Number(stock);
      if ((typeof stock !== "number" && typeof stock !== "string") ||
          (typeof stock === "string" && !/^\d+$/.test(stock)) ||
          !Number.isInteger(stockFinal) || stockFinal < 0 || stockFinal > 2147483647) {
        return NextResponse.json(
          {
            success: false,
            error: "El stock debe ser un número válido mayor o igual a 0",
          },
          { status: 400 }
        );
      }
    }

    let empresaEnviosId = productoExistente.empresaEnvios;

    if (shipping) {
      const deliverExistente = await prisma.deliver.findFirst({
        include: {
          empresa: true,
        },
        where: {
          empresa: {
            nombre: shipping,
          },
        },
      });

      if (!deliverExistente) {
        const nuevaEmpresa = await prisma.empresa.create({
          data: {
            nombre: shipping,
            direccion: "Dirección por defecto",
            telefono: "000-000-000",
          },
        });

        const nuevoDeliver = await prisma.deliver.create({
          data: {
            empresaId: nuevaEmpresa.id,
          },
        });

        empresaEnviosId = nuevoDeliver.id;
      } else {
        empresaEnviosId = deliverExistente.id;
      }
    }

    const getCamposRequeridos = (category: string) => {
      if (!category) return { cantidad: false };
      const cat = category.toLowerCase();
      return { cantidad: cat.includes("vela") };
    };

    const camposRequeridos = getCamposRequeridos(
      category || productoExistente.category
    );

    const productoActualizado = await prisma.$transaction(async (tx) => {
      const finalCategory = category || productoExistente.category || "";
      const finalMarca = marca === undefined
        ? productoExistente.marca
        : marca.trim() || null;
      const finalAroma = aroma === undefined
        ? productoExistente.aroma
        : aroma.trim() || null;
      const finalLinea = linea === undefined
        ? productoExistente.Linea
        : linea.trim() || null;
      const finalTamaño = tamaño === undefined
        ? productoExistente.tamaño
        : tamaño.trim() || null;
      const finalColor = color === undefined
        ? productoExistente.color
        : color.trim() || null;
      const finalTipo = tipo === undefined
        ? productoExistente.tipo
        : tipo.trim() || null;
      const finalPiedra = piedra === undefined
        ? productoExistente.tipoPiedra
        : piedra.trim() || null;

      const data: Prisma.ProductsUncheckedUpdateInput = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: String(precioNumerico),
        imgUrl: imgUrl,
        imgPublicId: imgPublicId || "",
        category: finalCategory,
        marca: finalMarca,
        aroma: finalAroma,
        Linea: finalLinea,
        tamaño: finalTamaño,
        color: finalColor,
        tipo: finalTipo,
        tipoPiedra: finalPiedra,
        cantidad: camposRequeridos.cantidad
          ? cantidad
          : productoExistente.cantidad,
        stock: stockFinal,
        empresaEnvios: empresaEnviosId,
      };
      if (familyName !== undefined) {
        const normalizedFamilyName = familyName.trim();
        data.familyId = normalizedFamilyName
          ? (await resolveProductFamily(tx, {
              category: finalCategory,
              marca: finalMarca,
              linea: finalLinea,
              tipo: finalTipo,
              familyName: normalizedFamilyName,
            })).id
          : null;
      }

      return tx.products.update({
        where: { id: parseInt(id) },
        data,
        include: {
          envios: { include: { empresa: true } },
          family: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: productoActualizado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor al actualizar el producto",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminResponse = await requireAdminResponse();
    if (adminResponse) return adminResponse;

    const body = await request.json();
    const { id, stock, operation } = body;
    const productId = typeof id === "number" ? id : Number(id);
    if (!Number.isInteger(productId) || productId < 1) {
      return NextResponse.json(
        { success: false, error: "ID del producto es inválido" },
        { status: 400 }
      );
    }

    const maxStock = 2_147_483_647;
    let producto = await prisma.products.findUnique({ where: { id: productId } });
    if (!producto) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
    }

    if (operation === "increment" || operation === "decrement") {
      const amount = stock === undefined ? 1 : Number(stock);
      if ((typeof stock === "string" && !/^\d+$/.test(stock)) ||
          !Number.isInteger(amount) || amount < 1 || amount > maxStock) {
        return NextResponse.json(
          { success: false, error: "La cantidad debe ser un entero positivo" },
          { status: 400 }
        );
      }

      if (operation === "increment") {
        const result = await prisma.products.updateMany({
          where: { id: productId, stock: { lte: maxStock - amount } },
          data: { stock: { increment: amount } },
        });
        if (result.count === 0) {
          producto = await prisma.products.findUnique({ where: { id: productId } });
          if (!producto) {
            return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
          }
          return NextResponse.json(
            { success: false, error: "El stock supera el máximo permitido" },
            { status: 400 }
          );
        }
      } else {
        let updated = false;
        for (let attempt = 0; attempt < 3 && !updated; attempt += 1) {
          const decrement = await prisma.products.updateMany({
            where: { id: productId, stock: { gte: amount } },
            data: { stock: { decrement: amount } },
          });
          if (decrement.count > 0) {
            updated = true;
            break;
          }

          producto = await prisma.products.findUnique({ where: { id: productId } });
          if (!producto) {
            return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
          }
          if (producto.stock === 0) {
            updated = true;
          } else if (producto.stock < amount) {
            const clamp = await prisma.products.updateMany({
              where: { id: productId, stock: producto.stock },
              data: { stock: 0 },
            });
            updated = clamp.count > 0;
          }
        }
        if (!updated) {
          return NextResponse.json(
            { success: false, error: "No se pudo ajustar el stock; intentá nuevamente" },
            { status: 409 }
          );
        }
      }
    } else if (operation !== undefined && operation !== null && operation !== "") {
      return NextResponse.json(
        { success: false, error: 'Operación inválida. Use "increment" o "decrement"' },
        { status: 400 }
      );
    } else {
      const targetStock = typeof stock === "number" ? stock : Number(stock);
      if (stock === undefined ||
          (typeof stock === "string" && !/^\d+$/.test(stock)) ||
          !Number.isInteger(targetStock) || targetStock < 0 || targetStock > maxStock) {
        return NextResponse.json(
          { success: false, error: "El stock debe ser un entero entre 0 y el máximo permitido" },
          { status: 400 }
        );
      }
      await prisma.products.update({
        where: { id: productId },
        data: { stock: targetStock },
      });
    }

    const productoActualizado = await prisma.products.findUnique({
      where: { id: productId },
      include: { envios: { include: { empresa: true } }, family: true },
    });
    if (!productoActualizado) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
    }

    const calculateStatus = (stock: number) => {
      if (stock === 0) return "agotado";
      if (stock <= 5) return "bajo-stock";
      return "disponible";
    };

    const priceNumber = parsePriceInput(productoActualizado.precio) ?? 0;

    const formattedProduct = {
      id: productoActualizado.id,
      name: productoActualizado.nombre,
      price: priceNumber,
      formattedPrice: `${productoActualizado.precio}`,
      image: productoActualizado.imgUrl,
      category: productoActualizado.category || "Sin categoría",
      marca: productoActualizado.marca || "",
      aroma: productoActualizado.aroma || "",
      linea: productoActualizado.Linea || "",
      tamaño: productoActualizado.tamaño || "",
      color: productoActualizado.color || "",
      tipo: productoActualizado.tipo || "",
      piedra: productoActualizado.tipoPiedra || "",
      cantidad: productoActualizado.cantidad || "",
      stock: productoActualizado.stock,
      status: calculateStatus(productoActualizado.stock),
      shipping: productoActualizado.envios?.empresa?.nombre || "Envío Gratis",
      src: productoActualizado.imgUrl,
      description: productoActualizado.descripcion,
      familyId: productoActualizado.familyId,
      familyName: productoActualizado.family?.nombre || null,
    };

    return NextResponse.json({
      success: true,
      message: "Stock actualizado exitosamente",
      data: formattedProduct,
    });
  } catch (error) {
    console.error("❌ Error al actualizar stock:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor al actualizar el stock",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminResponse = await requireAdminResponse();
    if (adminResponse) return adminResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID del producto es requerido",
        },
        { status: 400 }
      );
    }

    const productoExistente = await prisma.products.findUnique({
      where: { id: parseInt(id) },
    });

    if (!productoExistente) {
      return NextResponse.json(
        {
          success: false,
          error: "Producto no encontrado",
        },
        { status: 404 }
      );
    }

    await prisma.products.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor al eliminar el producto",
      },
      { status: 500 }
    );
  }
}
