# Authentication Error Handling

This document explains how 401 Unauthorized responses are handled in the application, with automatic redirects to the login page.

## Overview

The application implements a consistent approach to handling authentication errors (401 responses) across both client-side and server-side code:

1. **Client-side API calls**: Automatically redirect to the login page when a 401 response is received
2. **Server-side API calls**: Handle 401 responses in server actions by redirecting to login

## Implementation Details

### Client-side Authentication Handling

For client components and hooks, we use the following approach:

1. The `api.ts` utility has been enhanced to detect 401 responses
2. When a 401 is detected, it uses the `auth-redirect.ts` utility to redirect to the login page
3. This happens automatically for all API calls made through the API utility

Example usage:
```typescript
// This will automatically redirect to login if a 401 response is received
const data = await api.get('/some-endpoint');
```

If you need to skip the automatic redirect for a specific call:
```typescript
// This will not redirect on 401
const data = await api.get('/some-endpoint', { skipAuthRedirect: true });
```

### Server-side Authentication Handling

For server actions, we use a different approach:

1. The `api-utils.ts` provides utilities for server-side API calls
2. The `fetchWithAuth` function handles 401 responses by redirecting to login
3. The `handleApiResponse` function can be used directly with any Response object

Example usage:
```typescript
// In a server action
import { fetchWithAuth } from '@/app/server/api-utils';

// This will automatically redirect to login if a 401 response is received
const response = await fetchWithAuth(url, options);
```

## How to Use

### For Client Components

Always use the API utility for making API calls:

```typescript
import api from '@/utils/api';

// In a component or custom hook
const fetchData = async () => {
  try {
    const data = await api.get('/api/endpoint');
    // Process data
  } catch (error) {
    // Handle other errors
    // 401 errors are already handled by redirecting
  }
};
```

### For Server Actions

Use the `fetchWithAuth` utility:

```typescript
import { fetchWithAuth } from '@/app/server/api-utils';

export async function serverAction() {
  // This will handle 401 responses
  const response = await fetchWithAuth(url, options);
  
  // Process response
  if (!response.ok) {
    // Handle other error status codes
    // 401 is already handled
  }
  
  return await response.json();
}
```

## Files

- `src/utils/auth-redirect.ts`: Client-side utilities for handling auth redirects
- `src/utils/api.ts`: Enhanced API utility with 401 handling
- `src/app/server/api-utils.ts`: Server-side utilities for API calls with auth handling