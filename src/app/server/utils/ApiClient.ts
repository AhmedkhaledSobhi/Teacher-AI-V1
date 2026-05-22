// utils/api/ApiClient.ts
"use client";

import axios, { isAxiosError, isCancel } from "axios";
import type {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import type { ClientAxiosApiResponse } from "./types";
import { i18n } from "@/configs/i18n";
import { baseURL } from "./api-constants";

function isAxiosErrorTypeGuard(error: unknown): error is AxiosError {
  return isAxiosError(error);
}

class ApiClient {
  baseURL: string;
  axiosInstance: AxiosInstance;
  private _locale: string | null = null;
  private _authToken: string | null = null; // Private property to store the auth token
  private _onUnauthorized: (() => void) | null = null; // Callback for 403 responses

  constructor() {
    this.baseURL = baseURL;

    this._locale = i18n.defaultLocale; // Simplified initialization

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {},
      withCredentials: true,
    });

    // Response Interceptor: Handle 403 Forbidden by triggering logout
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 403 && this._onUnauthorized) {
          this._onUnauthorized();
        }
        return Promise.reject(error);
      }
    );

    // Request Interceptor: Add common headers and dynamically set Accept-Language and Authorization
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (config.headers) {
          config.headers["X-Requested-From"] = "NextjsClient";
          if (typeof window !== "undefined") {
            config.headers["X-Forwarded-Origin"] = window.location.origin;
          }

          if (this._locale) {
            config.headers["Accept-Language"] = this._locale;
          }

          // --- ADD AUTHORIZATION HEADER HERE ---
          if (this._authToken) {
            config.headers.Authorization = `Bearer ${this._authToken}`;
          }
          // --- END AUTHORIZATION HEADER ---

          if (
            (config.headers["Content-Type"] as string)?.includes(
              "multipart/form-data"
            ) &&
            ["post", "put", "patch"].includes(
              config.method?.toLowerCase() || ""
            )
          ) {
            delete config.headers["Content-Type"];
          }
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
  }

  public setLocale(locale: string) {
    this._locale = locale;
  }

  public setUnauthorizedHandler(handler: (() => void) | null) {
    this._onUnauthorized = handler;
  }

  public setAuthToken(token: string | null) {
    this._authToken = token;
  }

  public async request<T = unknown>(
    method: string,
    url: string,
    data: unknown = null,
    config: AxiosRequestConfig = {}
  ): Promise<ClientAxiosApiResponse<T>> {
    const axiosConfig: AxiosRequestConfig = {
      method: method.toLowerCase(),
      url: url,
      data: ["post", "put", "patch"].includes(method.toLowerCase())
        ? data
        : undefined,
      params: ["get", "delete"].includes(method.toLowerCase())
        ? data
        : undefined,
      signal: config.signal,
      ...config,
    };

    try {
      const response: AxiosResponse<T> =
        await this.axiosInstance.request(axiosConfig);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        config: response.config,
        request: response.request,
      };
    } catch (error: unknown) {
      if (isCancel(error)) {
        return Promise.reject(error);
      }
      const apiError = error as AxiosError<object | string | null>;

      if (apiError.response) {
        console.error(
          `[ApiClient] API Error Response (${apiError.config?.method?.toUpperCase()} ${apiError.config?.url}):`,
          `Status: ${apiError.response.status}`,
          `StatusText: ${apiError.response.statusText}`,
          `Data:`,
          apiError.response.data
        );
      } else {
        console.error(
          `[ApiClient] API Request Failed (${axiosConfig.method?.toUpperCase()} ${axiosConfig.url}):`,
          apiError.message,
          apiError
        );
      }

      return Promise.reject(apiError);
    }
  }

  public get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ClientAxiosApiResponse<T>> {
    return this.request<T>("get", url, undefined, config);
  }
  public post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ClientAxiosApiResponse<T>> {
    return this.request<T>("post", url, data, config);
  }
  public put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ClientAxiosApiResponse<T>> {
    return this.request<T>("put", url, data, config);
  }
  public delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ClientAxiosApiResponse<T>> {
    return this.request<T>("delete", url, undefined, config);
  }
  public patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ClientAxiosApiResponse<T>> {
    return this.request<T>("patch", url, data, config);
  }
}

const apiClient = new ApiClient();
export default apiClient;

export { isAxiosErrorTypeGuard as isAxiosErrorClient };
