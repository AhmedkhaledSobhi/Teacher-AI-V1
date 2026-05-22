// utils/api/ApiServer.ts

// IMPORTANT: This file is intended ONLY for the Next.js App Router server environment.
// Do NOT import this file into Client Components or files processed by the Pages Router.

import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from 'next-auth'
import type { FetchApiResponse, FetchApiErrorResponse, FetchRequestConfig } from './types'
import { authOptions } from '@/libs/auth'
import { baseURL } from './api-constants'

function isCancelServer(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

class ApiServer {
  baseURL: string

  constructor() {
    this.baseURL = baseURL
  }

  // Method to get the current auth token
  private async getAuthToken(): Promise<string | undefined> {
    try {
      const session = await getServerSession(authOptions)
      return session?.accessToken || undefined
    } catch (error) {
      console.warn('[ApiServer] Failed to get auth token:', error)
      return undefined
    }
  }

  // Method to get the current locale from headers
  private async getLocale(): Promise<string | undefined> {
    try {
      const incomingHeaders = await nextHeaders()

      // Try to get locale from referer header (which contains the full URL)
      const referer = incomingHeaders.get('referer') || incomingHeaders.get('x-forwarded-host') || ''
      const localeMatch = referer.match(/\/([a-z]{2})(\/|$)/) // Extract locale like /en/, /fr/, etc.
      const locale = localeMatch ? localeMatch[1] : undefined

      // Fallback to Accept-Language header if referer doesn't have locale
      if (!locale) {
        const acceptLanguage = incomingHeaders.get('accept-language')
        if (acceptLanguage) {
          // Extract the first language code from Accept-Language header
          const langMatch = acceptLanguage.match(/^([a-z]{2})/)
          return langMatch ? langMatch[1] : undefined
        }
      }

      return locale
    } catch (error) {
      console.warn('[ApiServer] Failed to get locale:', error)
      return undefined
    }
  }

  // Modified to accept locale and authToken as arguments
  private async _getHeaders(
    method: string,
    configHeaders: HeadersInit = {},
    authToken?: string, // Added authToken argument
    locale?: string // Added locale argument
  ): Promise<Record<string, string>> {
    let mergedConfigHeaders: Record<string, string> = {}

    if (configHeaders instanceof Headers) {
      mergedConfigHeaders = Object.fromEntries(configHeaders.entries())
    } else if (Array.isArray(configHeaders)) {
      mergedConfigHeaders = Object.fromEntries(configHeaders)
    } else {
      mergedConfigHeaders = configHeaders as Record<string, string>
    }

    const requestHeaders: Record<string, string> = {
      ...mergedConfigHeaders
    }

    // Set Accept-Language from the passed-in locale
    if (locale) {
      requestHeaders['Accept-Language'] = locale
    }

    // Set Authorization header from the passed-in token
    if (authToken) {
      const isPrefixed = /^Bearer\s+/i.test(authToken)
      requestHeaders['Authorization'] = isPrefixed ? authToken : `Bearer ${authToken}`
    }

    const incomingHeaders = await nextHeaders()
    let browserOriginToForward: string | null = null
    const originalOrigin = incomingHeaders.get('origin')

    if (originalOrigin) {
      browserOriginToForward = originalOrigin
    } else {
      const forwardedProto = incomingHeaders.get('x-forwarded-proto')
      const forwardedHost = incomingHeaders.get('x-forwarded-host')
      if (forwardedProto && forwardedHost) {
        browserOriginToForward = `${forwardedProto}://${forwardedHost}`
      }
    }

    requestHeaders['X-Requested-From'] = 'NextjsServer'
    if (browserOriginToForward) {
      requestHeaders['X-Forwarded-Origin'] = browserOriginToForward
    }

    if (
      (requestHeaders['Content-Type'] as string)?.includes('multipart/form-data') &&
      ['post', 'put', 'patch'].includes(method.toLowerCase())
    ) {
      delete requestHeaders['Content-Type']
    }

    return requestHeaders
  }

  // accept authToken and locale as arguments
  public async request<T = unknown>(
    method: string,
    url: string,
    data: FormData | object | null | boolean = null,
    config: FetchRequestConfig = {},
    authToken?: string,
    locale?: string
  ): Promise<FetchApiResponse<T>> {
    try {
      if (!authToken) {
        authToken = await this.getAuthToken()
      }

      if (!locale) {
        locale = await this.getLocale()
      }

      const requestHeaders = await this._getHeaders(method, config.headers, authToken, locale)

      if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
        if (!(data instanceof FormData)) {
          requestHeaders['Content-Type'] = 'application/json'
        }
      }

      const fullUrl = `${this.baseURL}${url}`

      const fetchOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: requestHeaders,
        body: ['post', 'put', 'patch'].includes(method.toLowerCase())
          ? data instanceof FormData
            ? data
            : JSON.stringify(data)
          : undefined,
        signal: config.signal,
        ...config
      }

      const finalUrl =
        ['get', 'delete'].includes(method.toLowerCase()) &&
        data &&
        !(data instanceof FormData) &&
        typeof data === 'object' &&
        data !== null
          ? `${fullUrl}?${new URLSearchParams(data as Record<string, string>).toString()}`
          : fullUrl

      const response = await fetch(finalUrl, fetchOptions)

      let responseData: T | string | null = null
      let rawResponseText: string | null = null
      const contentType = response.headers.get('content-type')

      try {
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json()
        } else {
          rawResponseText = await response.text()
          responseData = rawResponseText as T | string
        }
      } catch (parseError: unknown) {
        console.warn(
          `[ApiServer] Failed to parse response for ${method.toUpperCase()} ${finalUrl}. Content-Type: ${contentType}. Error:`,
          parseError
        )
        if (responseData === null) {
          try {
            rawResponseText = rawResponseText || (await response.text())
            responseData = rawResponseText as T | string
          } catch (textError: unknown) {
            console.warn('[ApiServer] Failed to read raw text after parse error:', textError)
            responseData = null
          }
        }
      }

      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, name) => {
        responseHeaders[name] = value
      })

      if (!response.ok) {
        const error: FetchApiErrorResponse = new Error(
          `HTTP error! Status: ${response.status} ${response.statusText}`
        ) as FetchApiErrorResponse

        error.response = {
          data: responseData || rawResponseText,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          config: { ...config, method, url: finalUrl, headers: requestHeaders },
          request: null
        }
        error.config = error.response.config
        throw error
      }

      return {
        data: responseData as T,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        config: { ...config, method, url: finalUrl, headers: requestHeaders },
        request: null
      }
    } catch (error: unknown) {
      const apiError = error as FetchApiErrorResponse

      if (isCancelServer(apiError)) {
        throw apiError
      }

      if (apiError.response) {
        console.error(
          `[ApiServer] API Error Response (${apiError.response.config?.method?.toUpperCase()} ${
            apiError.response.config?.url
          }):`,
          `Status: ${apiError.response.status}`,
          `StatusText: ${apiError.response.statusText}`,
          `Data:`,
          apiError.response.data
        )
      } else {
        console.error(
          `[ApiServer] API Request Failed (${method.toUpperCase()} ${url}):`,
          error instanceof Error ? error.message : 'An unknown error occurred',
          error
        )
      }

      throw error
    }
  }

  // Updated public methods to automatically include auth token and locale
  public get<T = unknown>(
    url: string,
    params?: object,
    config?: FetchRequestConfig,
    authToken?: string,
    locale?: string
  ): Promise<FetchApiResponse<T>> {
    return this.request<T>('get', url, params, config, authToken, locale)
  }
  public post<T = unknown>(
    url: string,
    data?: FormData | object | null | boolean,
    config?: FetchRequestConfig,
    authToken?: string,
    locale?: string
  ): Promise<FetchApiResponse<T>> {
    return this.request<T>('post', url, data, config, authToken, locale)
  }
  public put<T = unknown>(
    url: string,
    data?: FormData | object | null | boolean,
    config?: FetchRequestConfig,
    authToken?: string,
    locale?: string
  ): Promise<FetchApiResponse<T>> {
    return this.request<T>('put', url, data, config, authToken, locale)
  }
  public delete<T = unknown>(
    url: string,
    config?: FetchRequestConfig,
    authToken?: string,
    locale?: string
  ): Promise<FetchApiResponse<T>> {
    return this.request<T>('delete', url, null, config, authToken, locale)
  }
  public patch<T = unknown>(
    url: string,
    data?: FormData | object | null | boolean,
    config?: FetchRequestConfig,
    authToken?: string,
    locale?: string
  ): Promise<FetchApiResponse<T>> {
    return this.request<T>('patch', url, data, config, authToken, locale)
  }
}

const apiServer = new ApiServer()
export default apiServer

export { isCancelServer }
