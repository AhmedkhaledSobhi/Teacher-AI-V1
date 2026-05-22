import type { AxiosRequestConfig } from 'axios'

// --- Server-side (Fetch API) Types ---
export interface FetchRequestConfig extends RequestInit {
  method?: string
  url?: string
  headers?: HeadersInit
}

export interface FetchApiResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: FetchRequestConfig // Uses FetchRequestConfig
  request: Request | null
}

// ApiErrorResponse for Fetch API
export interface FetchApiErrorResponse extends Error {
  response?: {
    data: object | string | null
    status: number
    statusText: string
    headers: Record<string, string>
    config: FetchRequestConfig // Uses FetchRequestConfig
    request: Request | null
  }
  config?: FetchRequestConfig // Uses FetchRequestConfig
}

// --- Client-side (Axios) Types ---

export interface ClientAxiosApiResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: AxiosRequestConfig
  request: unknown
}
