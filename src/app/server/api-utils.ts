/**
 * Server-side API utilities
 * This file provides utility functions for server-side API calls
 */

'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

/**
 * Handles API response status codes
 * @param response - Fetch Response object
 * @returns boolean - true if handled, false otherwise
 */
export async function handleApiResponse(response: Response): Promise<boolean> {
  if (response.status === 401) {
    // For server actions, we need to handle 401 by redirecting
    // Clear any auth cookies
    const cookieStore = await cookies()
    cookieStore.getAll().forEach(cookie => {
      if (cookie.name.includes('next-auth') || cookie.name.includes('session')) {
        cookieStore.delete(cookie.name)
      }
    })
    
    // Redirect to login page
    redirect('/login')
  }
  
  return false
}

/**
 * Wrapper for fetch that handles authentication errors
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Response object
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, options)
  
  // Handle 401 responses
  if (response.status === 401) {
    await handleApiResponse(response)
  }
  
  return response
}

// In 'use server' files, we can only export async functions
// Individual exports are already available above