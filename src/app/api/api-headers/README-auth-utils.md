# Server-Side Authentication Utilities

This document explains how to properly check authentication on the server side and redirect to login when needed.

## Overview

The authentication utilities provide safe and consistent ways to:

- Check if a user is authenticated
- Require authentication (with automatic redirect)
- Get session data and access tokens

## Functions

### `requireAuth(locale?: Locale)`

**Use this when you need to ensure a user is authenticated.**

This function will automatically redirect to the login page if no session exists. It's perfect for:

- Server components that need authentication
- Server actions that require authentication
- Protected API routes

**Parameters:**

- `locale` (optional): The locale for the redirect URL (defaults to `'ar'`)

**Returns:**

- The session object (guaranteed to exist, as it redirects if not)

**Throws:**

- Redirects to login page if no session exists

**Example 1: In a Server Component**

```tsx
// app/[lang]/(dashboard)/protected/page.tsx
import { requireAuth } from "@/app/api/api-headers/auth-server-utils";
import type { Locale } from "@configs/i18n";

export default async function ProtectedPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const session = await requireAuth(lang);

  // session is guaranteed to exist here
  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome, {session.user.email}!</p>
    </div>
  );
}
```

**Example 2: In a Server Action**

```tsx
// app/server/actions.ts
"use server";

import { requireAuth } from "@/app/api/api-headers/auth-server-utils";

export async function deleteUserData() {
  const session = await requireAuth("ar");

  // session is guaranteed to exist here
  // Your protected logic here
}
```

**Example 3: In a Route Handler**

```tsx
// app/api/protected/route.ts
import { requireAuth } from "@/app/api/api-headers/auth-server-utils";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireAuth("ar");

  return NextResponse.json({
    message: "Protected data",
    user: session.user,
  });
}
```

### `checkAuth()`

**Use this when you want to conditionally render based on auth status without redirecting.**

This function checks authentication status without redirecting. It's perfect for:

- Conditional rendering in server components
- Checking auth status before making decisions
- Public pages that show different content for authenticated users

**Returns:**

- `true` if authenticated, `false` otherwise

**Example:**

```tsx
// app/[lang]/public/page.tsx
import { checkAuth } from "@/app/api/api-headers/auth-server-utils";

export default async function PublicPage() {
  const isAuthenticated = await checkAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>You are logged in!</p>
      ) : (
        <p>Please log in to see more content.</p>
      )}
    </div>
  );
}
```

### `getAuthFullSessionServer()`

**Use this when you need the full session object without requiring authentication.**

This function returns the session or `null` if not authenticated. It does NOT redirect.

**Returns:**

- Session object or `null`

**Example:**

```tsx
import { getAuthFullSessionServer } from "@/app/api/api-headers/auth-server-utils";

export default async function MyComponent() {
  const session = await getAuthFullSessionServer();

  if (session) {
    // User is authenticated
    return <div>Welcome, {session.user.email}</div>;
  } else {
    // User is not authenticated
    return <div>Please log in</div>;
  }
}
```

### `getAuthTokenServer()`

**Use this when you need the access token for API calls.**

This function extracts the access token from the session.

**Returns:**

- Access token string or `null`

**Example:**

```tsx
import { getAuthTokenServer } from "@/app/api/api-headers/auth-server-utils";

export async function makeAuthenticatedRequest() {
  const token = await getAuthTokenServer();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch("https://api.example.com/data", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}
```

## Using AuthGuard Component

For layout-level protection, use the `AuthGuard` component:

```tsx
// app/[lang]/(dashboard)/layout.tsx
import AuthGuard from "@/hocs/AuthGuard";
import type { Locale } from "@configs/i18n";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  return <AuthGuard locale={lang}>{children}</AuthGuard>;
}
```

## Important Notes

1. **Always use `authOptions`**: Never call `getServerSession()` without passing `authOptions`. Always use the utility functions provided here.

2. **Locale-aware redirects**: The `requireAuth` function respects the locale and redirects to the correct localized login page.

3. **Server-side only**: These utilities are for server components, server actions, and route handlers only. For client-side, use `useSession()` from `next-auth/react`.

4. **Redirect behavior**: The `requireAuth` function uses Next.js `redirect()` which throws an error internally. This is expected behavior and should not be caught.

## Migration Guide

If you have existing code using `getServerSession()` without `authOptions`, update it:

**Before:**

```tsx
const session = await getServerSession();
if (!session) {
  redirect("/login");
}
```

**After:**

```tsx
import { requireAuth } from "@/app/api/api-headers/auth-server-utils";
const session = await requireAuth(locale);
```

## Best Practices

1. **Use `requireAuth` for protected routes**: It's the safest and most concise way to protect server components.

2. **Use `checkAuth` for conditional rendering**: When you need to show different content based on auth status.

3. **Use `getAuthTokenServer` for API calls**: When you need to make authenticated requests to your backend.

4. **Always pass locale**: When using `requireAuth`, always pass the locale from params to ensure correct redirect URLs.
