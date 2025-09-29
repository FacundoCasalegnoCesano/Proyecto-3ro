import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log("📦 Recibiendo solicitud para crear producto...");

    const body = await request.json();
    console.log("Datos recibidos:", body);

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
    } = body;

    // Validar campos requeridos básicos
    if (
      !nombre ||
      !precio ||
      !descripcion ||
      !imgUrl ||
      !category ||
      !cantidad
    ) {
      console.log("❌ Faltan campos requeridos");
      return NextResponse.json(
        {
          success: false,
          error:
            "Faltan campos requeridos: nombre, precio, descripcion, imgUrl, category, cantidad",
        },
        { status: 400 }
      );
    }

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
    const precioNumerico = parseFloat(precio);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      console.log("❌ Precio inválido:", precio);
      return NextResponse.json(
        {
          success: false,
          error: "El precio debe ser un número válido mayor a 0",
        },
        { status: 400 }
      );
    }

    // Validar cantidad
    const cantidadNumerica = parseInt(cantidad);
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      console.log("❌ Cantidad inválida:", cantidad);
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

    // Agregar campos condicionales según lo que esté presente
    if (marca) whereClause.marca = marca.trim();
    if (aroma) whereClause.aroma = aroma.trim();
    if (linea) whereClause.Linea = linea.trim();
    if (tamaño) whereClause.tamaño = tamaño.trim();
    if (color) whereClause.color = color.trim();
    if (tipo) whereClause.tipo = tipo.trim();
    if (piedra) whereClause.tipoPiedra = piedra.trim();
    // Para velas, también buscar por cantidad
    if (camposRequeridos.cantidad) {
      whereClause.cantidad = cantidad;
    }

    productoExistente = await prisma.products.findFirst({
      where: whereClause,
    });

    // Si existe un producto, incrementar su stock
    if (productoExistente) {
      console.log("✅ Producto existente encontrado, incrementando stock...");

      const nuevoStock = productoExistente.stock + cantidadNumerica;

      const productoActualizado = await prisma.products.update({
        where: { id: productoExistente.id },
        data: {
          stock: nuevoStock,
          precio: precio.toString(),
          descripcion: descripcion.trim(),
          imgUrl: imgUrl,
          imgPublicId: imgPublicId || productoExistente.imgPublicId,
          Linea: linea?.trim() || productoExistente.Linea,
          tamaño: tamaño?.trim() || productoExistente.tamaño,
          color: color?.trim() || productoExistente.color,
          tipo: tipo?.trim() || productoExistente.tipo,
          tipoPiedra: piedra?.trim() || productoExistente.tipoPiedra,
          cantidad: camposRequeridos.cantidad
            ? cantidad
            : productoExistente.cantidad,
        },
        include: {
          envios: {
            include: {
              empresa: true,
            },
          },
        },
      });

      console.log(
        `✅ Stock actualizado para producto existente. Stock anterior: ${productoExistente.stock}, Stock agregado: ${cantidadNumerica}, Stock nuevo: ${nuevoStock}`
      );

      return NextResponse.json(
        {
          success: true,
          message: `Stock incrementado para el producto existente. Stock anterior: ${productoExistente.stock}, Stock nuevo: ${nuevoStock}`,
          data: {
            ...productoActualizado,
            stockAnterior: productoExistente.stock,
            stockAgregado: cantidadNumerica,
            stockNuevo: nuevoStock,
          },
        },
        { status: 200 }
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

    const nuevoProducto = await prisma.products.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: precio.toString(),
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
        cantidad: camposRequeridos.cantidad ? cantidad : null,
        stock: cantidadNumerica,
        empresaEnvios: empresaEnviosId,
      },
      include: {
        envios: {
          include: {
            empresa: true,
          },
        },
      },
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
    const saveMarca = searchParams.get("saveMarca");
    const saveAroma = searchParams.get("saveAroma");
    const saveLinea = searchParams.get("saveLinea");

    // Endpoint para guardar una nueva línea
    if (saveLinea === "true") {
      try {
        const categoryParam = searchParams.get("category");
        const marcaParam = searchParams.get("marca");
        const aromaParam = searchParams.get("aroma");
        const lineaParam = searchParams.get("linea");

        if (!categoryParam || !marcaParam || !lineaParam) {
          return NextResponse.json(
            {
              success: false,
              error: "Se requiere categoría, marca y línea",
            },
            { status: 400 }
          );
        }

        await prisma.categoryMarca.upsert({
          where: {
            category_marca_aroma_Linea: {
              category: categoryParam.trim(),
              marca: marcaParam.trim(),
              aroma: aromaParam?.trim() || "",
              Linea: lineaParam.trim(),
            },
          },
          update: {},
          create: {
            category: categoryParam.trim(),
            marca: marcaParam.trim(),
            aroma: aromaParam?.trim() || "",
            Linea: lineaParam.trim(),
          },
        });

        console.log(
          `✅ Nueva línea guardada: ${lineaParam} para marca ${marcaParam} en categoría ${categoryParam}`
        );

        return NextResponse.json({
          success: true,
          message: "Línea guardada exitosamente",
        });
      } catch (error) {
        console.error("❌ Error al guardar línea:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Error al guardar la línea",
          },
          { status: 500 }
        );
      }
    }

    // Endpoint para guardar un nuevo aroma
    if (saveAroma === "true") {
      try {
        const categoryParam = searchParams.get("category");
        const marcaParam = searchParams.get("marca");
        const aromaParam = searchParams.get("aroma");
        const lineaParam = searchParams.get("linea");

        if (!categoryParam || !marcaParam || !aromaParam) {
          return NextResponse.json(
            {
              success: false,
              error: "Se requiere categoría, marca y aroma",
            },
            { status: 400 }
          );
        }

        await prisma.categoryMarca.upsert({
          where: {
            category_marca_aroma_Linea: {
              category: categoryParam.trim(),
              marca: marcaParam.trim(),
              aroma: aromaParam.trim(),
              Linea: lineaParam?.trim() || "",
            },
          },
          update: {},
          create: {
            category: categoryParam.trim(),
            marca: marcaParam.trim(),
            aroma: aromaParam.trim(),
            Linea: lineaParam?.trim() || "",
          },
        });

        console.log(
          `✅ Nuevo aroma guardado: ${aromaParam} para marca ${marcaParam} en categoría ${categoryParam}`
        );

        return NextResponse.json({
          success: true,
          message: "Aroma guardado exitosamente",
        });
      } catch (error) {
        console.error("❌ Error al guardar aroma:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Error al guardar el aroma",
          },
          { status: 500 }
        );
      }
    }

    // Endpoint para guardar una nueva marca
    if (saveMarca === "true") {
      try {
        const categoryParam = searchParams.get("category");
        const marcaParam = searchParams.get("marca");
        const lineaParam = searchParams.get("linea");

        if (!categoryParam || !marcaParam) {
          return NextResponse.json(
            {
              success: false,
              error: "Se requiere categoría y marca",
            },
            { status: 400 }
          );
        }

        await prisma.categoryMarca.upsert({
          where: {
            category_marca_aroma_Linea: {
              category: categoryParam.trim(),
              marca: marcaParam.trim(),
              aroma: "",
              Linea: lineaParam?.trim() || "",
            },
          },
          update: {},
          create: {
            category: categoryParam.trim(),
            marca: marcaParam.trim(),
            aroma: "",
            Linea: lineaParam?.trim() || "",
          },
        });

        console.log(
          `✅ Nueva marca guardada: ${marcaParam} en categoría ${categoryParam}`
        );

        return NextResponse.json({
          success: true,
          message: "Marca guardada exitosamente",
        });
      } catch (error) {
        console.error("❌ Error al guardar marca:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Error al guardar la marca",
          },
          { status: 500 }
        );
      }
    }

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

            for (const marca of uniqueMarcas) {
              try {
                await prisma.categoryMarca.create({
                  data: {
                    category: categoryFilter,
                    marca: marca,
                    aroma: "",
                    Linea: "",
                  },
                });
              } catch (error) {
                console.log(
                  `⚠️ Marca ya existe en CategoryMarca: ${marca}`,
                  error
                );
              }
            }
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

      const productId = parseInt(id);
      if (isNaN(productId)) {
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

      const formattedProduct = {
        id: producto.id,
        name: producto.nombre,
        price: `$${producto.precio}`,
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
      };

      console.log("✅ Producto encontrado:", formattedProduct.name);

      return NextResponse.json({
        success: true,
        data: formattedProduct,
      });
    }

    // Obtener lista de productos con filtros - SIN LIMIT POR DEFECTO
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

    // Solo aplicar limit si se especifica explícitamente
    const take = limit ? parseInt(limit) : undefined;

    console.log("🔍 Consulta a la base de datos:", { where, orderBy, take });

    const productos = await prisma.products.findMany({
      where,
      orderBy,
      take,
      include: {
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

    const formattedProducts = productos.map((producto) => ({
      id: producto.id,
      name: producto.nombre,
      price: `$${producto.precio}`,
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
    }));

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

    const precioNumerico = parseFloat(precio);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
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
      stockFinal = parseInt(stock);
      if (isNaN(stockFinal) || stockFinal < 0) {
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

    // Determinar si se requiere cantidad según la categoría
    const getCamposRequeridos = (category: string) => {
      if (!category) return { cantidad: false };
      const cat = category.toLowerCase();
      return { cantidad: cat.includes("vela") };
    };

    const camposRequeridos = getCamposRequeridos(
      category || productoExistente.category
    );

    const productoActualizado = await prisma.products.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: precio.toString(),
        imgUrl: imgUrl,
        imgPublicId: imgPublicId || "",
        category: category || productoExistente.category,
        marca: marca?.trim() || productoExistente.marca,
        aroma: aroma?.trim() || productoExistente.aroma,
        Linea: linea?.trim() || productoExistente.Linea,
        tamaño: tamaño?.trim() || productoExistente.tamaño,
        color: color?.trim() || productoExistente.color,
        tipo: tipo?.trim() || productoExistente.tipo,
        tipoPiedra: piedra?.trim() || productoExistente.tipoPiedra,
        cantidad: camposRequeridos.cantidad
          ? cantidad
          : productoExistente.cantidad,
        stock: stockFinal,
        empresaEnvios: empresaEnviosId,
      },
      include: {
        envios: {
          include: {
            empresa: true,
          },
        },
      },
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
    const body = await request.json();
    const { id, stock, operation } = body;

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

    let nuevoStock: number;

    if (operation) {
      const amount = parseInt(stock) || 1;
      if (operation === "increment") {
        nuevoStock = productoExistente.stock + amount;
      } else if (operation === "decrement") {
        nuevoStock = Math.max(0, productoExistente.stock - amount);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Operación inválida. Use "increment" o "decrement"',
          },
          { status: 400 }
        );
      }
    } else {
      nuevoStock = parseInt(stock);
      if (isNaN(nuevoStock) || nuevoStock < 0) {
        return NextResponse.json(
          {
            success: false,
            error: "El stock debe ser un número válido mayor o igual a 0",
          },
          { status: 400 }
        );
      }
    }

    const productoActualizado = await prisma.products.update({
      where: { id: parseInt(id) },
      data: { stock: nuevoStock },
      include: {
        envios: {
          include: {
            empresa: true,
          },
        },
      },
    });

    const calculateStatus = (stock: number) => {
      if (stock === 0) return "agotado";
      if (stock <= 5) return "bajo-stock";
      return "disponible";
    };

    const formattedProduct = {
      id: productoActualizado.id,
      name: productoActualizado.nombre,
      price: `${productoActualizado.precio}`,
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
