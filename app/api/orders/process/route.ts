// app/api/orders/process/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "lib/prisma"

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Iniciando procesamiento de orden...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📦 Datos recibidos:', JSON.stringify(body, null, 2))

    const { paymentData, cartItems, subtotal, shippingCost } = body

    // Validación básica
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'El carrito está vacío' },
        { status: 400 }
      )
    }

    // Verificar que los datos requeridos estén presentes
    if (!paymentData) {
      return NextResponse.json(
        { success: false, error: 'Datos de pago faltantes' },
        { status: 400 }
      )
    }

    // Preparar datos de envío con valores por defecto
    const shippingAddress = {
      calle: paymentData.calle || "No especificada",
      ciudad: paymentData.ciudad || "No especificada",
      provincia: paymentData.provincia || "No especificada", 
      codigoPostal: paymentData.codigoPostal || "0000",
      pais: paymentData.pais || "Argentina"
    }

    const shippingMethod = paymentData.shippingOption || {
      name: "Envío estándar",
      carrier: "Correo Argentino",
      service: "Estándar",
      price: 0,
      deliveryDays: 5,
      estimatedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR')
    }

    console.log('🔍 Verificando stock...')
    // Verificar stock antes de procesar
    const stockCheck = await checkStock(cartItems)
    if (!stockCheck.available) {
      console.log('❌ Stock insuficiente:', stockCheck.outOfStockItems)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Stock insuficiente',
          outOfStockItems: stockCheck.outOfStockItems 
        },
        { status: 400 }
      )
    }

    console.log('📊 Actualizando stock...')
    // Actualizar stock de productos
    const stockUpdateResult = await updateProductStock(cartItems)
    if (!stockUpdateResult.success) {
      console.log('❌ Error actualizando stock:', stockUpdateResult.error)
      return NextResponse.json(
        { success: false, error: 'Error al actualizar el stock' },
        { status: 500 }
      )
    }

    console.log('💾 Creando orden en base de datos...')
    // Crear la orden en la base de datos
    const order = await createOrder({
      userId: session.user.id,
      paymentData,
      cartItems,
      subtotal,
      shippingCost,
      tax: subtotal * 0.21,
      total: subtotal + shippingCost + (subtotal * 0.21),
      shippingAddress,
      shippingMethod
    })

    console.log('✅ Orden creada exitosamente:', order.id)

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.id,
        items: cartItems,
        subtotal,
        shippingCost,
        tax: subtotal * 0.21,
        total: subtotal + shippingCost + (subtotal * 0.21),
        shippingAddress: shippingAddress,
        shippingMethod: shippingMethod,
        paymentMethod: paymentData.paymentMethod || "credit-card",
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error procesando orden:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

// Función para verificar stock
async function checkStock(cartItems: any[]) {
  const outOfStockItems = []

  for (const item of cartItems) {
    try {
      console.log(`🔍 Verificando stock para producto ${item.id}...`)
      const product = await prisma.products.findUnique({
        where: { id: item.id }
      })
      
      console.log(`📊 Producto ${item.id}: stock=${product?.stock}, solicitado=${item.quantity}`)
      
      if (!product || product.stock < item.quantity) {
        outOfStockItems.push({
          id: item.id,
          name: item.name,
          requested: item.quantity,
          available: product?.stock || 0
        })
        console.log(`❌ Stock insuficiente para ${item.name}`)
      }
    } catch (error) {
      console.error(`❌ Error verificando stock para producto ${item.id}:`, error)
      outOfStockItems.push({
        id: item.id,
        name: item.name,
        requested: item.quantity,
        available: 0
      })
    }
  }

  return {
    available: outOfStockItems.length === 0,
    outOfStockItems
  }
}

// Función para actualizar stock
async function updateProductStock(cartItems: any[]) {
  try {
    for (const item of cartItems) {
      console.log(`🔄 Actualizando stock: Producto ${item.id} - reduciendo ${item.quantity} unidades`)
      
      // Actualizar cada producto en la base de datos
      const updatedProduct = await prisma.products.update({
        where: { id: item.id },
        data: { 
          stock: {
            decrement: item.quantity
          }
        }
      })
      
      console.log(`✅ Stock actualizado: ${item.name} - nuevo stock: ${updatedProduct.stock}`)
    }
    return { success: true }
  } catch (error) {
    console.error('❌ Error actualizando stock:', error)
    return { success: false, error }
  }
}

// Función para crear orden en la base de datos
async function createOrder(orderData: any) {
  try {
    console.log('💾 Creando orden principal...')
    console.log('📫 Datos de envío:', {
      address: orderData.shippingAddress,
      method: orderData.shippingMethod
    })
    
    // Crear la orden principal
    const order = await prisma.order.create({
      data: {
        userId: orderData.userId,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        tax: orderData.tax,
        total: orderData.total,
        paymentMethod: orderData.paymentData.paymentMethod || "credit-card",
        shippingAddress: JSON.stringify(orderData.shippingAddress),
        shippingMethod: JSON.stringify(orderData.shippingMethod),
        status: 'completed',
        orderDate: new Date(),
      }
    })

    console.log(`✅ Orden principal creada: ${order.id}`)

    // Crear los items de la orden
    console.log('📦 Creando items de la orden...')
    for (const item of orderData.cartItems) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          productName: item.name,
          productImage: item.image || "/placeholder.svg"
        }
      })
      console.log(`✅ Item creado: ${item.name} x${item.quantity}`)
    }

    return order
  } catch (error) {
    console.error('❌ Error creando orden:', error)
    throw error
  }
}