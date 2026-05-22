/**
 * API route handlers
 * This file provides utility functions for handling API requests in Next.js App Router
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthTokenServer } from "@/app/api/api-headers/auth-server-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// Backend API configuration
const BACKEND_URL = process.env.BACKEND_URL || "https://drsi.ai";

/**
 * Helper function to make authenticated API calls to backend
 * Automatically includes Bearer token from NextAuth session
 */
export const makeAuthenticatedAPICall = async (
  endpoint: string,
  options: RequestInit = {},
  authToken?: string
) => {
  try {
    const url = `${BACKEND_URL}${endpoint}`;

    // Get auth token from NextAuth session if not provided
    let token: string | null = authToken || null;
    if (!token) {
      const sessionToken = await getAuthTokenServer();
      token = sessionToken;
    }

    const headers: Record<string, string> = {};

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // Merge existing headers if they are an object
    if (
      options.headers &&
      typeof options.headers === "object" &&
      !Array.isArray(options.headers)
    ) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    // Add authorization header if token exists
    if (token) {
      // If caller passed a full header value like "Bearer abc", use as-is
      const isPrefixed = /^Bearer\s+/i.test(token);
      headers["Authorization"] = isPrefixed ? token : `Bearer ${token}`;
    } else {
      console.warn(`⚠️ No access token available for ${endpoint}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorData: any = { message: `HTTP ${response.status}` };

      if (contentType?.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch (e) {
          const errorText = await response.text();
          errorData = { message: errorText || `HTTP ${response.status}` };
        }
      } else {
        const errorText = await response.text();
        errorData = { message: errorText || `HTTP ${response.status}` };
      }

      console.error(`❌ API Error: ${JSON.stringify(errorData)}`);
      throw new Error(JSON.stringify(errorData));
    }

    return response;
  } catch (error) {
    console.error("💥 Authenticated API call error:", error);
    throw error;
  }
};

/**
 * Generic error handler for API routes
 */
export const handleApiError = (error: unknown) => {
  console.error("API error:", error);

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 }
  );
};

/**
 * Generic handler for GET requests to fetch all records
 */
export async function handleGetAll(
  request: NextRequest,
  model: string,
  options: {
    searchFields?: string[];
    filterFields?: string[];
    includeFields?: Record<string, boolean>;
  } = {}
) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);

    // Build query parameters for backend API
    const queryParams = new URLSearchParams();

    // Handle pagination
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    queryParams.set("page", page);
    queryParams.set("limit", limit);

    // Handle search
    const search = searchParams.get("search");
    if (search) {
      queryParams.set("search", search);
    }

    // Handle filters
    if (options.filterFields?.length) {
      options.filterFields.forEach((field) => {
        const value = searchParams.get(field);
        if (value) {
          queryParams.set(field, value);
        }
      });
    }

    // Execute API call
    const endpoint = `/${model}?${queryParams.toString()}`;
    const response = await makeAuthenticatedAPICall(
      endpoint,
      { method: "GET" },
      authHeader || undefined
    );

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Generic handler for GET requests to fetch a single record
 */
export async function handleGetById(
  request: NextRequest,
  model: string,
  id: string,
  options: {
    includeFields?: Record<string, boolean>;
  } = {}
) {
  try {
    const authHeader = request.headers.get("authorization");

    // Execute API call
    const endpoint = `/${model}/${id}`;
    const response = await makeAuthenticatedAPICall(
      endpoint,
      { method: "GET" },
      authHeader || undefined
    );

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json(
        { error: `${model} with ID ${id} not found` },
        { status: 404 }
      );
    }
    return handleApiError(error);
  }
}

/**
 * Generic handler for POST requests to create a record
 */
export async function handleCreate(
  request: NextRequest,
  model: string,
  options: {
    includeFields?: Record<string, boolean>;
    validateFn?: (data: any) => { isValid: boolean; errors?: any };
  } = {}
) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    // Validate request body if validation function is provided
    if (options.validateFn) {
      const validation = options.validateFn(body);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: "Validation failed", details: validation.errors },
          { status: 400 }
        );
      }
    }

    // Execute API call
    const endpoint = `/${model}`;
    const response = await makeAuthenticatedAPICall(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      authHeader || undefined
    );

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Generic handler for PUT/PATCH requests to update a record
 */
export async function handleUpdate(
  request: NextRequest,
  model: string,
  id: string,
  options: {
    includeFields?: Record<string, boolean>;
    validateFn?: (data: any) => { isValid: boolean; errors?: any };
  } = {}
) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    // Validate request body if validation function is provided
    if (options.validateFn) {
      const validation = options.validateFn(body);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: "Validation failed", details: validation.errors },
          { status: 400 }
        );
      }
    }

    // Execute API call
    const endpoint = `/${model}/${id}`;
    const response = await makeAuthenticatedAPICall(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
      authHeader || undefined
    );

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json(
        { error: `${model} with ID ${id} not found` },
        { status: 404 }
      );
    }
    return handleApiError(error);
  }
}

export async function handlePatch(
  request: NextRequest,
  endpoint: string,
  options: { isFormData?: boolean } = {}
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken =
      (session as any).accessToken || (session as any)?.session?.access_token;

    let requestOptions: RequestInit = {
      method: "PATCH",
    };

    if (options.isFormData) {
      // ✅ FormData
      const formData = await request.formData();
      requestOptions.body = formData;

      // ❗ لا تضف Content-Type
    } else {
      // ✅ JSON
      const body = await request.json();

      requestOptions.headers = {
        "Content-Type": "application/json",
      };

      requestOptions.body = JSON.stringify(body);
    }

    const res = await makeAuthenticatedAPICall(
      endpoint,
      requestOptions,
      accessToken
    );

    const contentType = res.headers.get("content-type");

    let data: any;

    if (contentType?.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("PATCH error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generic handler for DELETE requests to delete a record
 */
export async function handleDelete(
  request: NextRequest,
  model: string,
  id: string
) {
  try {
    const authHeader = request.headers.get("authorization");

    // Execute API call
    const endpoint = `/${model}/${id}`;
    const response = await makeAuthenticatedAPICall(
      endpoint,
      {
        method: "DELETE",
      },
      authHeader || undefined
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json(
        { error: `${model} with ID ${id} not found` },
        { status: 404 }
      );
    }
    return handleApiError(error);
  }
}

/**
 * Create a CRUD API route handler for a specific model
 */
export function createCrudHandlers(
  model: string,
  options: {
    searchFields?: string[];
    filterFields?: string[];
    includeFields?: Record<string, boolean>;
    validateCreate?: (data: any) => { isValid: boolean; errors?: any };
    validateUpdate?: (data: any) => { isValid: boolean; errors?: any };
  }
) {
  return {
    GET: (request: NextRequest) => handleGetAll(request, model, options),
    POST: (request: NextRequest) =>
      handleCreate(request, model, {
        includeFields: options.includeFields,
        validateFn: options.validateCreate,
      }),
    getById: (request: NextRequest, id: string) =>
      handleGetById(request, model, id, {
        includeFields: options.includeFields,
      }),
    updateById: (request: NextRequest, id: string) =>
      handleUpdate(request, model, id, {
        includeFields: options.includeFields,
        validateFn: options.validateUpdate,
      }),
    deleteById: (request: NextRequest, id: string) =>
      handleDelete(request, model, id),
  };
}
