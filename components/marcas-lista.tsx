"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
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
  RefreshCw,
} from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"

type UIBrandStatus = "pending" | "contacted" | "approved" | "rejected"

interface BrandRequest {
  id: string
  brandName: string
  email: string
  phone: string
  website: string
  productType: string
  message: string
  date: string
  status: UIBrandStatus
}

interface MarcasListaProps {
  requests?: BrandRequest[]
  onUpdateStatus?: (requestId: string, status: UIBrandStatus) => void
  onContactBrand?: (requestId: string) => void
}

const mapStatusToUI = (status: string): UIBrandStatus => {
  switch (status) {
    case "PENDING":
      return "pending"
    case "CONTACTED":
      return "contacted"
    case "APPROVED":
      return "approved"
    case "REJECTED":
      return "rejected"
    default:
      return "pending"
  }
}

const mapStatusToDB = (status: UIBrandStatus): string => {
  switch (status) {
    case "pending":
      return "PENDING"
    case "contacted":
      return "CONTACTED"
    case "approved":
      return "APPROVED"
    case "rejected":
      return "REJECTED"
    default:
      return "PENDING"
  }
}

const transformBrandContactToRequest = (contact: any): BrandRequest => ({
  id: contact.id,
  brandName: contact.brandName,
  email: contact.email,
  phone: contact.phone || "",
  website: contact.website || "",
  productType: contact.productType,
  message: contact.message,
  date: contact.createdAt,
  status: mapStatusToUI(contact.status)
})

export function MarcasLista({ requests = [], onUpdateStatus = () => {}, onContactBrand = () => {} }: MarcasListaProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<BrandRequest | null>(null)
  const [brandRequests, setBrandRequests] = useState<BrandRequest[]>(requests)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  
  // ✅ Usar ref para evitar múltiples llamadas simultáneas
  const isFetchingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // ✅ Cargar datos iniciales SOLO UNA VEZ
  useEffect(() => {
    if (requests.length === 0 && !isFetchingRef.current) {
      fetchBrandContacts()
    } else if (requests.length > 0) {
      setBrandRequests(requests)
    }
  }, []) // ⚠️ Array vacío - solo se ejecuta al montar

  // ✅ Actualización automática cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isFetchingRef.current) {
        fetchBrandContacts(true)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchBrandContacts = useCallback(async (silent = false) => {
    // Prevenir múltiples llamadas simultáneas
    if (isFetchingRef.current) {
      console.log('Fetch ya en progreso, saltando...')
      return
    }

    isFetchingRef.current = true

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    if (!silent) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/brand-contact?t=${timestamp}`, {
        signal: abortControllerRef.current.signal,
        cache: 'no-store', // ✅ Evitar cache del navegador
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const transformedData = data.data.map(transformBrandContactToRequest)
        setBrandRequests(transformedData)
        setLastUpdated(new Date())
      } else {
        console.error('Error fetching brand contacts')
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch cancelado')
      } else {
        console.error('Error fetching brand contacts:', error)
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
      isFetchingRef.current = false
    }
  }, [])

  const handleUpdateStatus = useCallback(async (requestId: string, newStatus: UIBrandStatus) => {
    try {
      const dbStatus = mapStatusToDB(newStatus)
      
      // ✅ Actualizar UI inmediatamente (optimistic update)
      setBrandRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      )

      const response = await fetch(`/api/brand-contact/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: dbStatus }),
      })

      if (response.ok) {
        onUpdateStatus(requestId, newStatus)
        // ✅ NO hacer fetch inmediato - confiar en el optimistic update
        // La actualización automática se encargará del resto
      } else {
        // ✅ Si falla, revertir el cambio
        console.error('Error updating status')
        await fetchBrandContacts(true)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      // ✅ Revertir en caso de error
      await fetchBrandContacts(true)
    }
  }, [onUpdateStatus, fetchBrandContacts])

  const handleContactBrand = useCallback((requestId: string) => {
    const request = brandRequests.find(req => req.id === requestId)
    if (request) {
      const subject = `Colaboración con Babalu - ${request.brandName}`
      const body = `Hola ${request.brandName},\n\nMe pongo en contacto con ustedes respecto a su solicitud de colaboración.`
      
      window.open(`mailto:${request.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
      onContactBrand(requestId)
      
      // ✅ Auto-marcar como "contacted" si no lo está
      if (request.status !== "contacted") {
        handleUpdateStatus(requestId, "contacted")
      }
    }
  }, [brandRequests, onContactBrand, handleUpdateStatus])

  const getStatusIcon = (status: UIBrandStatus) => {
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

  const getStatusColor = (status: UIBrandStatus) => {
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

  const getStatusText = (status: UIBrandStatus) => {
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

  const filteredRequests = useMemo(() => {
    return brandRequests.filter((request) => {
      const matchesSearch =
        request.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.message.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || request.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [brandRequests, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const total = brandRequests.length
    const pending = brandRequests.filter((r) => r.status === "pending").length
    const contacted = brandRequests.filter((r) => r.status === "contacted").length
    const approved = brandRequests.filter((r) => r.status === "approved").length
    const rejected = brandRequests.filter((r) => r.status === "rejected").length
    
    return { total, pending, contacted, approved, rejected }
  }, [brandRequests])

  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Marcas</h1>
            <p className="text-gray-600 mt-1">Gestiona las marcas que quieren trabajar contigo</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-babalu-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando solicitudes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Marcas</h1>
            {isRefreshing && (
              <RefreshCw className="w-5 h-5 text-babalu-primary animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Gestiona las marcas que quieren trabajar contigo</p>
            <Badge variant="outline" className="text-xs">
              Actualizado: {formatLastUpdated()}
            </Badge>
          </div>
        </div>
        <Button 
          onClick={() => fetchBrandContacts()}
          variant="outline"
          className="bg-babalu-primary text-white hover:bg-babalu-medium flex items-center gap-2"
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isLoading ? "Cargando..." : "Actualizar"}
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
                <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por marca, email, tipo de producto o mensaje..."
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
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4"
              style={{ borderLeftColor: getStatusColor(request.status).split(' ')[0].replace('bg-', '') }}
              onClick={() => setSelectedRequest(request)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 line-clamp-1">{request.brandName}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${request.email}`}
                      className="text-babalu-primary hover:underline line-clamp-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {request.email}
                    </a>
                  </div>
                  {request.phone && (
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
                  )}
                  {request.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={request.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-babalu-primary hover:underline flex items-center gap-1 line-clamp-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {request.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-babalu-light rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Tipo de Producto</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{request.productType}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">Mensaje</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{request.message}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Select
                    value={request.status}
                    onValueChange={(value) => handleUpdateStatus(request.id, value as UIBrandStatus)}
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
                      handleContactBrand(request.id)
                    }}
                    className="bg-babalu-primary hover:bg-babalu-medium text-white flex items-center gap-1"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">Contactar</span>
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
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{selectedRequest.brandName}</CardTitle>
                  <div className="flex items-center gap-3 flex-wrap">
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
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Información de Contacto</h3>
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
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
                  {selectedRequest.phone && (
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
                  )}
                  {selectedRequest.website && (
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
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tipo de Producto</h3>
                <div className="p-4 bg-babalu-light rounded-lg">
                  <p className="text-gray-900">{selectedRequest.productType}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Mensaje</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.message}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Select
                  value={selectedRequest.status}
                  onValueChange={(value) => handleUpdateStatus(selectedRequest.id, value as UIBrandStatus)}
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
                  onClick={() => handleContactBrand(selectedRequest.id)}
                  className="bg-babalu-primary hover:bg-babalu-medium text-white flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
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