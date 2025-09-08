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
    
    const nuevoProducto = await prisma.products.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: precio.toString(),
        imgUrl: imgUrl,
        imgPublicId: imgPublicId || '',
        category: category || 'Sin categoría',
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


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')
    const limit = searchParams.get('limit')

    
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

      
      const formattedProduct = {
        id: producto.id,
        name: producto.nombre,
        price: `$${producto.precio}`,
        image: producto.imgUrl,
        category: producto.category || 'Sin categoría',
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

    
    console.log('📦 Obteniendo productos con filtros:', { category, search, sort, limit })

    
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

    
    let orderBy: any = { id: 'desc' }

    if (sort === 'price-low') {
      orderBy = { precio: 'asc' }
    } else if (sort === 'price-high') {
      orderBy = { precio: 'desc' }
    } else if (sort === 'name') {
      orderBy = { nombre: 'asc' }
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
        category: category || 'Sin categoría',
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