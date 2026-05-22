# API Error Handling with Toast Notifications

This document explains how error handling is implemented in the application, particularly focusing on displaying toast notifications for API errors.

## Overview

The application uses a centralized approach to handle API errors and display them to users through toast notifications. This is implemented in two main utilities:

1. `api.ts` - Handles API requests and error detection
2. `toast-utils.ts` - Provides utilities for displaying toast notifications

## Features

- Automatic toast notifications for all API errors
- Customizable error messages based on error type
- Options to skip toast notifications for specific requests
- Support for custom error handlers
- Consistent error message extraction from different error types

## Usage

### Basic API Calls

All API calls made through the API utility will automatically show toast notifications for errors:

```typescript
import api from "@/utils/api";

try {
  const data = await api.get("/api/endpoint");
  // Handle successful response
} catch (error) {
  // Error is already displayed in a toast notification
  // Additional error handling if needed
}
```

### Customizing Error Handling

You can customize error handling for specific API calls:

```typescript
import api from "@/utils/api";

// Skip toast notification for this specific request
const data = await api.get("/api/endpoint", { skipErrorToast: true });

// Provide a custom error handler
const data = await api.post("/api/endpoint", body, {
  customErrorHandler: (error) => {
    // Custom error handling logic
  },
});
```

### Direct Usage of Toast Utilities

You can also use the toast utilities directly in your components:

```typescript
import {
  showErrorToast,
  showSuccessToast,
  handleApiError,
} from "@/utils/toast-utils";

// Show a success message
showSuccessToast("Operation completed successfully");

// Show an error message
showErrorToast("Something went wrong");

// Handle an API error
try {
  // Some operation that might fail
} catch (error) {
  handleApiError(error);
}
```

## Error Types Handled

The system can extract meaningful error messages from various error types:

1. Standard JavaScript `Error` objects
2. String error messages
3. Objects with a `message` property
4. Unknown error types (fallback to generic message)

## Toast Configuration

Toast notifications are configured with sensible defaults:

- Position: Top right
- Auto close: After 5 seconds
- Close on click: Enabled
- Pause on hover: Enabled
- Draggable: Enabled

These settings can be customized when calling the toast functions directly.

## Implementation Details

### Error Detection

The API utility detects errors in two ways:

1. HTTP error status codes (non-2xx responses)
2. Exceptions thrown during the request

### Message Extraction

The `getErrorMessage` function in `toast-utils.ts` extracts user-friendly messages from different error types.

### Toast Display

Toast notifications are displayed using the `react-toastify` library, which is configured in the application's layout.
