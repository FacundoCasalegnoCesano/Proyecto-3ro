import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, BrandContactStatus } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Configurar el transporter de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface EmailResults {
  adminEmailSent: boolean
  brandEmailSent: boolean
  errors: string[]
}

async function sendBrandContactEmails(brandContact: any): Promise<EmailResults> {
  try {
    // 1. Email al ADMINISTRADOR
    const adminEmail = {
      from: `"Babalu Notificaciones" <${process.env.SMTP_FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🎯 Nueva solicitud de colaboración - ${brandContact.brandName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #667eea; }
                .message-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎯 Nueva Solicitud de Colaboración</h1>
                    <p>Una marca quiere trabajar con Babalu</p>
                </div>
                <div class="content">
                    <div class="field">
                        <span class="label">Marca:</span> ${brandContact.brandName}
                    </div>
                    <div class="field">
                        <span class="label">Email de contacto:</span> ${brandContact.email}
                    </div>
                    <div class="field">
                        <span class="label">Teléfono:</span> ${brandContact.phone || 'No proporcionado'}
                    </div>
                    <div class="field">
                        <span class="label">Sitio web:</span> ${brandContact.website ? `<a href="${brandContact.website}" target="_blank">${brandContact.website}</a>` : 'No proporcionado'}
                    </div>
                    <div class="field">
                        <span class="label">Tipo de productos:</span> ${brandContact.productType}
                    </div>
                    <div class="field">
                        <span class="label">Mensaje:</span>
                        <div class="message-box">${brandContact.message.replace(/\n/g, '<br>')}</div>
                    </div>
                    <div class="field">
                        <span class="label">Fecha de envío:</span> ${new Date(brandContact.createdAt).toLocaleDateString('es-ES')}
                    </div>
                </div>
            </div>
        </body>
        </html>
      `
    }

    // 2. Email de CONFIRMACIÓN a la MARCA
    const brandEmail = {
      from: `"Babalu Colaboraciones" <${process.env.SMTP_FROM_EMAIL}>`,
      to: brandContact.email,
      subject: `✅ Recibimos tu solicitud de colaboración - Babalu`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
                .highlight { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea; }
                .next-steps { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ ¡Hola ${brandContact.brandName}!</h1>
                    <p>Recibimos tu solicitud de colaboración</p>
                </div>
                <div class="content">
                    <p>Gracias por tu interés en colaborar con <strong>Babalu</strong>. Hemos recibido tu información y estamos revisando tu propuesta.</p>
                    
                    <div class="highlight">
                        <strong>Resumen de tu solicitud:</strong><br>
                        • Marca: ${brandContact.brandName}<br>
                        • Email: ${brandContact.email}<br>
                        • Tipo de productos: ${brandContact.productType}<br>
                        • Fecha de envío: ${new Date().toLocaleDateString('es-ES')}
                    </div>

                    <div class="next-steps">
                        <h3>📋 Próximos pasos:</h3>
                        <ol>
                            <li>Revisaremos tu propuesta y valores</li>
                            <li>Evaluaremos la alineación con nuestra misión</li>
                            <li>Nos contactaremos contigo en un plazo de 3-5 días hábiles</li>
                        </ol>
                    </div>

                    <p><strong>¿Qué valoramos especialmente?</strong></p>
                    <ul>
                        <li>✅ Compromiso con la sostenibilidad</li>
                        <li>✅ Productos naturales y ecológicos</li>
                        <li>✅ Valores alineados con el cuidado del medio ambiente</li>
                        <li>✅ Transparencia y ética empresarial</li>
                    </ul>

                    <p>Si tienes alguna pregunta adicional, no dudes en responder a este email.</p>

                    <p>Saludos cordiales,<br>
                    <strong>El equipo de Babalu</strong></p>
                </div>
            </div>
        </body>
        </html>
      `
    }

    // Enviar ambos emails
    const [adminResult, brandResult] = await Promise.allSettled([
      transporter.sendMail(adminEmail),
      transporter.sendMail(brandEmail)
    ])

    const results: EmailResults = {
      adminEmailSent: adminResult.status === 'fulfilled',
      brandEmailSent: brandResult.status === 'fulfilled',
      errors: []
    }

    if (adminResult.status === 'rejected') {
      console.error('Error enviando email al admin:', adminResult.reason)
      results.errors.push('Error enviando notificación al administrador')
    }

    if (brandResult.status === 'rejected') {
      console.error('Error enviando email a la marca:', brandResult.reason)
      results.errors.push('Error enviando email de confirmación a la marca')
    }

    return results

  } catch (error) {
    console.error('Error en el servicio de emails:', error)
    return {
      adminEmailSent: false,
      brandEmailSent: false,
      errors: ['Error general en el servicio de emails']
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar campos requeridos
    const requiredFields = ['brandName', 'email', 'productType', 'message']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Campos requeridos faltantes', 
          missingFields 
        },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Validar formato de website si se proporciona
    if (body.website && !body.website.startsWith('http')) {
      body.website = `https://${body.website}`
    }

    // Crear el registro en la base de datos
    const brandContact = await prisma.brandContact.create({
      data: {
        brandName: body.brandName,
        email: body.email,
        phone: body.phone || null,
        website: body.website || null,
        productType: body.productType,
        message: body.message,
      },
    })

    // Enviar emails en segundo plano
    sendBrandContactEmails(brandContact)
      .then(results => {
        console.log('Resultados del envío de emails:', results)
      })
      .catch(error => {
        console.error('Error en el envío de emails:', error)
      })

    return NextResponse.json(
      { 
        message: 'Solicitud recibida correctamente. Te enviaremos un email de confirmación.', 
        data: brandContact 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error al procesar la solicitud:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Ya existe una solicitud con este email' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as BrandContactStatus | null

    // Crear el where condition de manera type-safe
    const where = status ? { 
      status: status as BrandContactStatus 
    } : {}

    const brandContacts = await prisma.brandContact.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ data: brandContacts })
  } catch (error) {
    console.error('Error al obtener las solicitudes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}