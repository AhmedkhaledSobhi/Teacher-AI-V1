"use server";

// Server Actions for thread operations

import apiServer from "@/app/server/utils/ApiServer";
import { authOptions } from "@/libs/auth";
import { getServerSession } from "next-auth";

export interface StrategyPrice {
  id: string;
  priceTypeId: string;
  strategyId: string;
  salePrice: number;
  profit: number;
  profitPercent: number;
  priceTypeName: string | null;
  strategyName: string | null;
}

interface Thread {
  thread_id: string;
  thread_name: string | null;
  created_at?: string;
  updated_at?: string;
  subject?: string;
  display_name?: string;
  subject_name?: string;
}

// The API may return threads as a flat array OR as a pre-grouped object
// { Today: [...], Yesterday: [...], "Last Week": [...], Older: [...] }
type GroupedThreads = {
  Today?: Thread[];
  Yesterday?: Thread[];
  "Last Week"?: Thread[];
  Older?: Thread[];
};

interface ApiThreadResponse {
  operation_status: string;
  message: string;
  // Flat list (legacy)
  threads?: Thread[] | GroupedThreads;
  data?: {
    threads?: Thread[] | GroupedThreads;
  };
  errors?: any;
  errorsMap?: any;
}

interface SingleThreadApiResponse {
  success: boolean;
  message: string;
  errors: any;
  errorsMap: any;
  data: Thread;
}

/**
 * Server action to get all threads for a user
 * @param userId - User ID to fetch threads for
 * @returns Promise<Thread[]> - Array of threads
 */
/**
 * Flatten a grouped threads object (Today/Yesterday/Last Week/Older) into a flat array,
 * preserving a synthetic `_group` field so the UI can re-group without date math.
 */
function flattenGroupedThreads(grouped: GroupedThreads): Thread[] {
  const order: Array<keyof GroupedThreads> = ["Today", "Yesterday", "Last Week", "Older"];
  const flat: Thread[] = [];
  for (const key of order) {
    const group = grouped[key];
    if (Array.isArray(group)) {
      group.forEach((t) => flat.push({ ...t, _group: key } as any));
    }
  }
  return flat;
}

export async function getThreadsList(): Promise<Thread[]> {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    // Get user ID and access token from session with fallbacks
    const userId = session?.user?.id || "";
    // Make API call to get all threads for the user - token and locale are automatically included
    const response = await apiServer.post(
      "/api/v1/rag/user_threads",
      { user_id: userId },
      { next: { tags: ["threads"] } as any }
    );

    const apiResponse = response.data as ApiThreadResponse;

    // Check if the response has the expected structure
    if (apiResponse.operation_status === "success") {
      const raw = apiResponse.threads ?? apiResponse.data?.threads;

      if (raw) {
        // New API: grouped object { Today: [...], Yesterday: [...], ... }
        if (!Array.isArray(raw) && typeof raw === "object") {
          return flattenGroupedThreads(raw as GroupedThreads);
        }
        // Legacy API: flat array
        if (Array.isArray(raw)) {
          return raw as Thread[];
        }
      }
    }

    // If we couldn't find threads in the expected locations, log the error and return empty array
    console.error("Could not find threads in API response:", apiResponse);
    return [];
  } catch (error) {
    console.error("Error fetching threads:", error);
    // Return empty array instead of throwing to prevent cascading failures
    return [];
  }
}

export interface SearchedThread {
  thread_id: string;
  thread_name: string | null;
  [key: string]: any;
}

/**
 * Server action to search through user's chat conversations
 * POST /api/v1/rag/search-chats  { "keyword": string }
 * Returns matched threads whose name/content matches the keyword.
 */
export async function searchThreads(
  keyword: string
): Promise<SearchedThread[]> {
  try {
    const response = await apiServer.post("/api/v1/rag/search-chats", {
      keyword,
    });

    const data = response.data as any;

    // Normalise: the endpoint may return a plain array or { threads: [] }
    if (Array.isArray(data)) {
      return data as SearchedThread[];
    }
    if (Array.isArray(data?.threads)) {
      return data.threads as SearchedThread[];
    }

    return [];
  } catch (error) {
    console.error("[searchThreads] error:", error);
    return [];
  }
}

/**
 * Server action to get a single service by ID
 * @param id - Service ID
 * @returns Promise<Service | null> - Service object or null if not found
 */
// export async function getServiceById(id: string): Promise<Service | null> {
//   try {
//     // Make API call to get service by ID
//     const response = await apiServer.get(`api/ServicesDashboard/${id}`, undefined, {
//       next: { tags: ['services', `service-${id}`] } as any
//     })

//     // Extract service from the response structure
//     const apiResponse = response.data as SingleServiceApiResponse
//     const service = apiResponse.data

//     return service
//   } catch (error) {
//     console.error('Error fetching service:', error)
//     return null
//   }
// }
