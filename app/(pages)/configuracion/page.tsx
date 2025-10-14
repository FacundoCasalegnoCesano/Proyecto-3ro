// app/configuracion/page.tsx
import { UserConfigurationForm } from "components/user-configuration-form"

export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Configuración</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y dirección</p>
        </div>
        <UserConfigurationForm />
      </div>
    </div>
  )
}