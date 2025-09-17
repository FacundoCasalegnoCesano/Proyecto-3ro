import { NextRequest, NextResponse } from 'next/server'
import { prisma } from 'lib/prisma'

// Función para calcular stock automáticamente
const calculateAutoStock = (category: string, marca: string, productName: string): number => {
  const cat = category.toLowerCase()
  const brand = marca.toLowerCase()
  const name = productName.toLowerCase()

  // Lógica específica para sahumerios
  if (cat.includes('sahumerio') || name.includes('sahumerio')) {
    let baseStock = 10 // stock por defecto
    
    // Marcas premium tienen menos stock inicial
    if (brand.includes('premium') || brand.includes('artesanal')) {
      baseStock = 5
    } else if (brand.includes('natural') || brand.includes('organico')) {
      baseStock = 8
    } else if (brand.includes('economico') || brand.includes('basico')) {
      baseStock = 15
    }

    // Ajustar por aroma específico
    if (name.includes('lavanda') || name.includes('rosa') || name.includes('jasmin')) {
      baseStock += 3 // aromas populares
    } else if (name.includes('pachuli') || name.includes('copal') || name.includes('mirra')) {
      baseStock += 1 // aromas especializados
    }

    return baseStock
  }

  // Lógica para velas
  if (cat.includes('vela') || name.includes('vela')) {
    let baseStock = 8
    
    if (brand.includes('artesanal') || brand.includes('premium')) {
      baseStock = 4
    } else if (brand.includes('industrial') || brand.includes('masivo')) {
      baseStock = 12
    }

    return baseStock
  }

  // Lógica para aceites esenciales
  if (cat.includes('aceite') || name.includes('aceite')) {
    let baseStock = 6
    
    if (brand.includes('pure') || brand.includes('organico')) {
      baseStock = 3
    } else if (brand.includes('sintetico')) {
      baseStock = 10
    }

    return baseStock
  }

  // Lógica para cristales/piedras
  if (cat.includes('cristal') || cat.includes('piedra') || name.includes('cristal') || name.includes('cuarzo')) {
    let baseStock = 5
    
    if (name.includes('amatista') || name.includes('cuarzo rosa')) {
      baseStock = 7 // cristales populares
    } else if (name.includes('obsidiana') || name.includes('turmalina')) {
      baseStock = 3 // cristales menos comunes
    }

    return baseStock
  }

  // Stock por defecto para otras categorías
  return 8
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Recibiendo solicitud para crear producto...')
    
    const body = await request.json()
    console.log('Datos recibidos:', body)

    const {
      nombre,
      precio,
      descripcion,
      imgUrl,
      imgPublicId,
      category,
      marca,
      allImages
    } = body

    // Validar campos requeridos
    if (!nombre || !precio || !descripcion || !imgUrl || !category || !marca) {
      console.log('❌ Faltan campos requeridos')
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos requeridos: nombre, precio, descripcion, imgUrl, category, marca'
        },
        { status: 400 }
      )
    }

    // Validar precio
    const precioNumerico = parseFloat(precio)
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      console.log('❌ Precio inválido:', precio)
      return NextResponse.json(
        {
          success: false,
          error: 'El precio debe ser un número válido mayor a 0'
        },
        { status: 400 }
      )
    }

    // Guardar la relación categoría-marca en la base de datos si no existe
    try {
      await prisma.categoryMarca.upsert({
        where: {
          category_marca: {
            category: category.trim(),
            marca: marca.trim()
          }
        },
        update: {}, // No actualizar nada si ya existe
        create: {
          category: category.trim(),
          marca: marca.trim()
        }
      })
      console.log('✅ Relación categoría-marca guardada:', category.trim(), '-', marca.trim())
    } catch (error) {
      console.log('⚠️ Error al guardar relación categoría-marca (puede ser duplicado):', error)
    }

    // Calcular stock automáticamente
    const stockCalculado = calculateAutoStock(category, marca, nombre)
    console.log('🔢 Stock calculado automáticamente:', stockCalculado)

    console.log('🔍 Buscando empresa de envíos...')
    
    let empresaEnviosId: number

    // Siempre usar "Envío Gratis" como valor por defecto
    const shippingDefault = 'Envío Gratis'

    const deliverExistente = await prisma.deliver.findFirst({
      include: {
        empresa: true
      },
      where: {
        empresa: {
          nombre: shippingDefault
        }
      }
    })

    if (deliverExistente) {
      empresaEnviosId = deliverExistente.id
      console.log('✅ Empresa de envíos existente:', deliverExistente.id)
    } else {
      console.log('🆕 Creando nueva empresa de envíos...')
      
      const nuevaEmpresa = await prisma.empresa.create({
        data: {
          nombre: shippingDefault,
          direccion: 'Dirección por defecto',
          telefono: '000-000-000'
        }
      })

      const nuevoDeliver = await prisma.deliver.create({
        data: {
          empresaId: nuevaEmpresa.id
        }
      })

      empresaEnviosId = nuevoDeliver.id
      console.log('✅ Nueva empresa creada:', nuevoDeliver.id)
    }

    console.log('🛒 Creando producto...')
    
    const nuevoProducto = await prisma.products.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: precio.toString(),
        imgUrl: imgUrl,
        imgPublicId: imgPublicId || '',
        category: category.trim(),
        marca: marca.trim(),
        stock: stockCalculado,
        empresaEnvios: empresaEnviosId
      },
      include: {
        envios: {
          include: {
            empresa: true
          }
        }
      }
    })

    console.log('✅ Producto creado exitosamente:', nuevoProducto.id)

    return NextResponse.json({
      success: true,
      message: 'Producto creado exitosamente',
      data: {
        ...nuevoProducto,
        stockCalculado: stockCalculado
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error al crear producto:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor al crear el producto'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const category = searchParams.get('category')
    const marca = searchParams.get('marca')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')
    const limit = searchParams.get('limit')
    const getCategories = searchParams.get('getCategories')
    const getMarcas = searchParams.get('getMarcas')
    const saveMarca = searchParams.get('saveMarca')

    // Endpoint para guardar una nueva marca en una categoría
    if (saveMarca === 'true') {
      try {
        const categoryParam = searchParams.get('category')
        const marcaParam = searchParams.get('marca')
        
        if (!categoryParam || !marcaParam) {
          return NextResponse.json({
            success: false,
            error: 'Se requiere categoría y marca'
          }, { status: 400 })
        }

        // Guardar la relación categoría-marca
        await prisma.categoryMarca.upsert({
          where: {
            category_marca: {
              category: categoryParam.trim(),
              marca: marcaParam.trim()
            }
          },
          update: {}, // No actualizar nada si ya existe
          create: {
            category: categoryParam.trim(),
            marca: marcaParam.trim()
          }
        })

        console.log(`✅ Nueva marca guardada: ${marcaParam} en categoría ${categoryParam}`)

        return NextResponse.json({
          success: true,
          message: 'Marca guardada exitosamente'
        })
      } catch (error) {
        console.error('❌ Error al guardar marca:', error)
        return NextResponse.json({
          success: false,
          error: 'Error al guardar la marca'
        }, { status: 500 })
      }
    }

    // Endpoint para obtener categorías únicas
    if (getCategories === 'true') {
      try {
        const categories = await prisma.products.findMany({
          select: {
            category: true
          },
          distinct: ['category'],
          where: {
            category: {
              not: null
            }
          }
        })

        const uniqueCategories = categories
          .map(p => p.category)
          .filter((cat): cat is string => cat !== null && cat.trim() !== '')
          .sort()

        console.log('✅ Categorías únicas encontradas:', uniqueCategories.length)

        return NextResponse.json({
          success: true,
          data: uniqueCategories
        })
      } catch (error) {
        console.error('❌ Error al obtener categorías:', error)
        return NextResponse.json({
          success: false,
          data: []
        })
      }
    }

    // Endpoint para obtener marcas únicas por categoría
    if (getMarcas === 'true') {
      try {
        const categoryFilter = searchParams.get('category')
        
        let uniqueMarcas: string[] = []
        
        // Si se especifica una categoría, obtener marcas de la tabla CategoryMarca
        if (categoryFilter && categoryFilter.trim() !== '') {
          const categoryMarcas = await prisma.categoryMarca.findMany({
            where: {
              category: categoryFilter
            },
            select: {
              marca: true
            }
          })
          
          uniqueMarcas = categoryMarcas
            .map(cm => cm.marca)
            .filter((marca): marca is string => marca !== null && marca.trim() !== '')
            .sort()
            
          console.log(`✅ Marcas encontradas en CategoryMarca para "${categoryFilter}":`, uniqueMarcas.length)
          
          // Si no hay marcas en CategoryMarca, buscar en Products (para migración de datos existentes)
          if (uniqueMarcas.length === 0) {
            const productoMarcas = await prisma.products.findMany({
              select: {
                marca: true
              },
              distinct: ['marca'],
              where: {
                category: categoryFilter,
                marca: {
                  not: null
                }
              }
            })
            
            uniqueMarcas = productoMarcas
              .map(p => p.marca)
              .filter((marca): marca is string => marca !== null && marca.trim() !== '')
              .sort()
              
            console.log(`✅ Marcas encontradas en Products para migración "${categoryFilter}":`, uniqueMarcas.length)
            
            // Migrar las marcas encontradas a la tabla CategoryMarca
            for (const marca of uniqueMarcas) {
              try {
                await prisma.categoryMarca.create({
                  data: {
                    category: categoryFilter,
                    marca: marca
                  }
                })
              } catch (error) {
                // Ignorar errores de duplicados
                console.log(`⚠️ Marca ya existe en CategoryMarca: ${marca}`)
              }
            }
          }
        } else {
          // Si no se especifica categoría, obtener todas las marcas únicas
          const allMarcas = await prisma.categoryMarca.findMany({
            select: {
              marca: true
            },
            distinct: ['marca']
          })
          
          uniqueMarcas = allMarcas
            .map(cm => cm.marca)
            .filter((marca): marca is string => marca !== null && marca.trim() !== '')
            .sort()
        }

        console.log(`✅ Total marcas únicas encontradas para categoría "${categoryFilter || 'todas'}":`, uniqueMarcas.length)

        return NextResponse.json({
          success: true,
          data: uniqueMarcas
        })
      } catch (error) {
        console.error('❌ Error al obtener marcas:', error)
        return NextResponse.json({
          success: false,
          data: []
        })
      }
    }

    // Obtener producto por ID
    if (id) {
      console.log('📦 Obteniendo producto con ID:', id)
      
      const productId = parseInt(id)
      if (isNaN(productId)) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID de producto inválido'
          },
          { status: 400 }
        )
      }

      const producto = await prisma.products.findUnique({
        where: { id: productId },
        include: {
          envios: {
            include: {
              empresa: true
            }
          }
        }
      })

      if (!producto) {
        return NextResponse.json(
          {
            success: false,
            error: 'Producto no encontrado'
          },
          { status: 404 }
        )
      }

      // Calcular status basado en stock
      const calculateStatus = (stock: number) => {
        if (stock === 0) return "agotado"
        if (stock <= 5) return "bajo-stock"
        return "disponible"
      }

      const formattedProduct = {
        id: producto.id,
        name: producto.nombre,
        price: `$${producto.precio}`,
        image: producto.imgUrl,
        category: producto.category || 'Sin categoría',
        marca: producto.marca || '',
        stock: producto.stock,
        status: calculateStatus(producto.stock),
        shipping: producto.envios?.empresa?.nombre || 'Envío Gratis',
        src: producto.imgUrl,
        description: producto.descripcion
      }

      console.log('✅ Producto encontrado:', formattedProduct.name)

      return NextResponse.json({
        success: true,
        data: formattedProduct
      })
    }

    // Obtener lista de productos con filtros
    console.log('📦 Obteniendo productos con filtros:', { category, marca, search, sort, limit })

    const where: any = {}

    if (category && category !== 'all' && category !== 'null') {
      where.category = category
    }

    if (marca && marca !== 'all' && marca !== 'null') {
      where.marca = marca
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { marca: { contains: search, mode: 'insensitive' } }
      ]
    }

    let orderBy: any = { id: 'desc' }

    if (sort === 'price-low') {
      orderBy = { precio: 'asc' }
    } else if (sort === 'price-high') {
      orderBy = { precio: 'desc' }
    } else if (sort === 'name') {
      orderBy = { nombre: 'asc' }
    } else if (sort === 'stock-low') {
      orderBy = { stock: 'asc' }
    } else if (sort === 'stock-high') {
      orderBy = { stock: 'desc' }
    } else if (sort === 'newest') {
      orderBy = { id: 'desc' }
    }

    const take = limit ? parseInt(limit) : undefined

    const productos = await prisma.products.findMany({
      where,
      orderBy,
      take,
      include: {
        envios: {
          include: {
            empresa: true
          }
        }
      }
    })

    console.log(`✅ ${productos.length} productos encontrados`)

    // Calcular status basado en stock
    const calculateStatus = (stock: number) => {
      if (stock === 0) return "agotado"
      if (stock <= 5) return "bajo-stock"
      return "disponible"
    }

    const formattedProducts = productos.map(producto => ({
      id: producto.id,
      name: producto.nombre,
      price: `$${producto.precio}`,
      image: producto.imgUrl,
      category: producto.category || 'Sin categoría',
      marca: producto.marca || '',
      stock: producto.stock,
      status: calculateStatus(producto.stock),
      shipping: producto.envios?.empresa?.nombre || 'Envío Gratis',
      src: producto.imgUrl,
      description: producto.descripcion
    }))

    return NextResponse.json({
      success: true,
      data: formattedProducts
    })

  } catch (error) {
    console.error('❌ Error al obtener productos:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      id,
      nombre,
      precio,
      descripcion,
      imgUrl,
      imgPublicId,
      category,
      marca,
      stock,
      shipping
    } = body

    if (!id || !nombre || !precio || !descripcion || !imgUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos requeridos: id, nombre, precio, descripcion, imgUrl'
        },
        { status: 400 }
      )
    }

    const productoExistente = await prisma.products.findUnique({
      where: { id: parseInt(id) }
    })

    if (!productoExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Producto no encontrado'
        },
        { status: 404 }
      )
    }

    const precioNumerico = parseFloat(precio)
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'El precio debe ser un número válido mayor a 0'
        },
        { status: 400 }
      )
    }

    // Calcular stock automáticamente si se actualizan campos relevantes
    let stockFinal = productoExistente.stock
    if (stock !== undefined) {
      stockFinal = parseInt(stock)
      if (isNaN(stockFinal) || stockFinal < 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'El stock debe ser un número válido mayor o igual a 0'
          },
          { status: 400 }
        )
      }
    } else if (category || marca || nombre) {
      // Recalcular stock si cambiaron campos que afectan el cálculo
      stockFinal = calculateAutoStock(
        category || productoExistente.category || '',
        marca || productoExistente.marca || '',
        nombre || productoExistente.nombre
      )
    }

    let empresaEnviosId = productoExistente.empresaEnvios

    if (shipping) {
      let deliverExistente = await prisma.deliver.findFirst({
        include: {
          empresa: true
        },
        where: {
          empresa: {
            nombre: shipping
          }
        }
      })

      if (!deliverExistente) {
        const nuevaEmpresa = await prisma.empresa.create({
          data: {
            nombre: shipping,
            direccion: 'Dirección por defecto',
            telefono: '000-000-000'
          }
        })

        const nuevoDeliver = await prisma.deliver.create({
          data: {
            empresaId: nuevaEmpresa.id
          }
        })

        empresaEnviosId = nuevoDeliver.id
      } else {
        empresaEnviosId = deliverExistente.id
      }
    }

    const productoActualizado = await prisma.products.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: precio.toString(),
        imgUrl: imgUrl,
        imgPublicId: imgPublicId || '',
        category: category || productoExistente.category,
        marca: marca?.trim() || productoExistente.marca,
        stock: stockFinal,
        empresaEnvios: empresaEnviosId
      },
      include: {
        envios: {
          include: {
            empresa: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: productoActualizado
    })

  } catch (error) {
    console.error('❌ Error al actualizar producto:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor al actualizar el producto'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, stock, operation } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID del producto es requerido'
        },
        { status: 400 }
      )
    }

    const productoExistente = await prisma.products.findUnique({
      where: { id: parseInt(id) }
    })

    if (!productoExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Producto no encontrado'
        },
        { status: 404 }
      )
    }

    let nuevoStock: number

    if (operation) {
      const amount = parseInt(stock) || 1
      if (operation === 'increment') {
        nuevoStock = productoExistente.stock + amount
      } else if (operation === 'decrement') {
        nuevoStock = Math.max(0, productoExistente.stock - amount)
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Operación inválida. Use "increment" o "decrement"'
          },
          { status: 400 }
        )
      }
    } else {
      nuevoStock = parseInt(stock)
      if (isNaN(nuevoStock) || nuevoStock < 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'El stock debe ser un número válido mayor o igual a 0'
          },
          { status: 400 }
        )
      }
    }

    const productoActualizado = await prisma.products.update({
      where: { id: parseInt(id) },
      data: { stock: nuevoStock },
      include: {
        envios: {
          include: {
            empresa: true
          }
        }
      }
    })

    const calculateStatus = (stock: number) => {
      if (stock === 0) return "agotado"
      if (stock <= 5) return "bajo-stock"
      return "disponible"
    }

    const formattedProduct = {
      id: productoActualizado.id,
      name: productoActualizado.nombre,
      price: `$${productoActualizado.precio}`,
      image: productoActualizado.imgUrl,
      category: productoActualizado.category || 'Sin categoría',
      marca: productoActualizado.marca || '',
      stock: productoActualizado.stock,
      status: calculateStatus(productoActualizado.stock),
      shipping: productoActualizado.envios?.empresa?.nombre || 'Envío Gratis',
      src: productoActualizado.imgUrl,
      description: productoActualizado.descripcion
    }

    return NextResponse.json({
      success: true,
      message: 'Stock actualizado exitosamente',
      data: formattedProduct
    })

  } catch (error) {
    console.error('❌ Error al actualizar stock:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor al actualizar el stock'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID del producto es requerido'
        },
        { status: 400 }
      )
    }

    const productoExistente = await prisma.products.findUnique({
      where: { id: parseInt(id) }
    })

    if (!productoExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Producto no encontrado'
        },
        { status: 404 }
      )
    }

    await prisma.products.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error al eliminar producto:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor al eliminar el producto'
      },
      { status: 500 }
    )
  }
}