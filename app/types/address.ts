// types/api.ts
export interface AddressResponse {
  success: boolean
  message?: string
  address?: {
    calle: string | null
    ciudad: string | null
    provincia: string | null
    codigoPostal: string | null
    pais: string | null
  }
  error?: string
}