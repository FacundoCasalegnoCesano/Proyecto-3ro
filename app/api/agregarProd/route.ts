// app/api/agregarProd/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from 'lib/prisma'

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
      shipping = 'Envío Gratis',
      allImages
    } = body

    // Validación básica
    if (!nombre || !precio || !descripcion || !imgUrl) {
      console.log('❌ Faltan campos requeridos')
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos requeridos: nombre, precio, descripcion, imgUrl'
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

    console.log('🔍 Buscando empresa de envíos...')
    // Obtener o crear empresa de envíos
    let empresaEnviosId: number

    const deliverExistente = await prisma.deliver.findFirst({
      include: {
        empresa: true
      },
      where: {
        empresa: {
          nombre: shipping
        }
      }
    })

    if (deliverExistente) {
      empresaEnviosId = deliverExistente.id
      console.log('✅ Empresa de envíos existente:', deliverExistente.id)
    } else {
      console.log('🆕 Creando nueva empresa de envíos...')
      // Crear nueva empresa y deliver
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
      console.log('✅ Nueva empresa creada:', nuevoDeliver.id)
    }

    console.log('🛒 Creando producto...')
    // Crear el producto
    const nuevoProducto = await prisma.products.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: precio.toString(),
        imgUrl: imgUrl,
        imgPublicId: imgPublicId || '',
        category: category || 'Sin categoría', // Asegurar que siempre tenga categoría
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
      data: nuevoProducto
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

// GET - Obtener productos con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')

    console.log('📦 Obteniendo productos con filtros:', { category, search, sort })

    // Construir where clause para filtros
    const where: any = {}

    if (category && category !== 'all' && category !== 'null') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Construir orderBy para ordenamiento
    let orderBy: any = { id: 'desc' }

    if (sort === 'price-low') {
      orderBy = { precio: 'asc' }
    } else if (sort === 'price-high') {
      orderBy = { precio: 'desc' }
    } else if (sort === 'name') {
      orderBy = { nombre: 'asc' }
    }

    const productos = await prisma.products.findMany({
      where,
      orderBy,
      include: {
        envios: {
          include: {
            empresa: true
          }
        }
      }
    })

    console.log(`✅ ${productos.length} productos encontrados`)

    // Mapear a la estructura que espera el frontend
    const formattedProducts = productos.map(producto => ({
      id: producto.id,
      name: producto.nombre,
      price: `$${producto.precio}`,
      image: producto.imgUrl,
      category: producto.category || 'Sin categoría',
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