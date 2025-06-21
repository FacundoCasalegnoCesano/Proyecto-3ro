import { Button } from "@/components/ui/button"
import { Globe, User } from "lucide-react"

export function Header() {
  return (
    <header className="bg-[#DF6C3B] text-babalu-medium">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <img src="img/logo.png" alt="" />
            </div>
            <span className="font-bold text-lg">Babalu Aye Reiki & Tarot</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="hover:text-orange-200 transition-colors">
              Inicio
            </a>
            <a href="#" className="hover:text-orange-200 transition-colors">
              Productos
            </a>
            <a href="#" className="hover:text-orange-200 transition-colors">
              Servicios
            </a>
            <a href="#" className="hover:text-orange-200 transition-colors">
              Reservar
            </a>
            <a href="#" className="hover:text-orange-200 transition-colors">
              Mi Carrito
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span className="text-sm">ES</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#FBE9E7] text-babalu-medium border-babalu-medium"
            >
              <User className="w-4 h-4 mr-1" />
              Ingresar
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
