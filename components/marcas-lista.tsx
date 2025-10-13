"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Mail,
  Phone,
  Globe,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Briefcase,
} from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

interface BrandRequest {
  id: string
  brandName: string
  contactName: string
  email: string
  phone: string
  website: string
  productType: string
  message: string
  date: string
  status: "pending" | "contacted" | "approved" | "rejected"
}

interface MarcasListaProps {
  requests?: BrandRequest[]
  onUpdateStatus?: (requestId: string, status: BrandRequest["status"]) => void
  onContactBrand?: (requestId: string) => void
}

export function MarcasLista({ requests = [], onUpdateStatus = () => {}, onContactBrand = () => {} }: MarcasListaProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<BrandRequest | null>(null)

  const getStatusIcon = (status: BrandRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "contacted":
        return <Mail className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: BrandRequest["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "contacted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  const getStatusText = (status: BrandRequest["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "contacted":
        return "Contactada"
      case "approved":
        return "Aprobada"
      case "rejected":
        return "Rechazada"
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.productType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Marcas</h1>
          <p className="text-gray-600 mt-1">Gestiona las marcas que quieren trabajar contigo</p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Solicitudes</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-babalu-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contactadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {requests.filter((r) => r.status === "contacted").length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por marca, contacto, email o tipo de producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="contacted">Contactada</SelectItem>
                <SelectItem value="approved">Aprobada</SelectItem>
                <SelectItem value="rejected">Rechazada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de solicitudes */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron solicitudes</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Aún no hay solicitudes de marcas"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{request.brandName}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}
                      >
                        {getStatusIcon(request.status)}
                        {getStatusText(request.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(request.date).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Información de contacto */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{request.contactName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${request.email}`}
                      className="text-babalu-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {request.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`tel:${request.phone}`}
                      className="text-gray-700 hover:text-babalu-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {request.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a
                      href={request.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-babalu-primary hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {request.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Tipo de producto */}
                <div className="p-3 bg-babalu-light rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Tipo de Producto</p>
                  <p className="text-sm font-medium text-gray-900">{request.productType}</p>
                </div>

                {/* Mensaje (preview) */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Mensaje</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{request.message}</p>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  <Select
                    value={request.status}
                    onValueChange={(value) => onUpdateStatus(request.id, value as BrandRequest["status"])}
                  >
                    <SelectTrigger className="flex-1" onClick={(e) => e.stopPropagation()}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="contacted">Contactada</SelectItem>
                      <SelectItem value="approved">Aprobada</SelectItem>
                      <SelectItem value="rejected">Rechazada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onContactBrand(request.id)
                    }}
                    className="bg-babalu-primary hover:bg-babalu-medium text-white"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRequest(null)}
        >
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-2xl mb-2">{selectedRequest.brandName}</CardTitle>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedRequest.status)}`}
                    >
                      {getStatusIcon(selectedRequest.status)}
                      {getStatusText(selectedRequest.status)}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedRequest.date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información de contacto */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Información de Contacto</h3>
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Contacto</p>
                      <p className="font-medium text-gray-900">{selectedRequest.contactName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <a
                        href={`mailto:${selectedRequest.email}`}
                        className="font-medium text-babalu-primary hover:underline"
                      >
                        {selectedRequest.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Teléfono</p>
                      <a
                        href={`tel:${selectedRequest.phone}`}
                        className="font-medium text-gray-900 hover:text-babalu-primary"
                      >
                        {selectedRequest.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Sitio Web</p>
                      <a
                        href={selectedRequest.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-babalu-primary hover:underline flex items-center gap-1"
                      >
                        {selectedRequest.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipo de producto */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tipo de Producto</h3>
                <div className="p-4 bg-babalu-light rounded-lg">
                  <p className="text-gray-900">{selectedRequest.productType}</p>
                </div>
              </div>

              {/* Mensaje completo */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Mensaje</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.message}</p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t">
                <Select
                  value={selectedRequest.status}
                  onValueChange={(value) => onUpdateStatus(selectedRequest.id, value as BrandRequest["status"])}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="contacted">Contactada</SelectItem>
                    <SelectItem value="approved">Aprobada</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => onContactBrand(selectedRequest.id)}
                  className="bg-babalu-primary hover:bg-babalu-medium text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contactar Marca
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
