# API Testing Guide for Quiz Form

## Overview

This guide helps you test the client-side API integration for the quiz form, specifically the subject details API call.

## Testing Steps

### 1. **Check Browser Console**

Open your browser's Developer Tools (F12) and go to the Console tab. You should see detailed logging when the API is called.

### 2. **Test API Call Manually**

1. Navigate to the quiz form page
2. Look for the "Test API Call (Subject ID: 1)" button
3. Click the button to manually trigger the API call
4. Check the console for detailed logs

### 3. **Test Subject Selection**

1. Select a subject from the dropdown
2. The API should automatically be called
3. Check console logs for the API request and response

## Expected Console Output

### Successful API Call:
```
🔗 Making API request to: /api/v1/subjects/1/details
📋 Request options: {method: "GET"}
📊 Response status: 200
📋 Response headers: {content-type: "application/json", ...}
✅ API Response data: {
  operation_status: "success",
  message: "Successfully retrieved units and lessons.",
  data: [...]
}
```

### Failed API Call:
```
🔗 Making API request to: /api/v1/subjects/1/details
📋 Request options: {method: "GET"}
📊 Response status: 404
❌ API Error Response: {"error": "Subject not found"}
💥 API Request failed: Error: Subject not found
```

## Common Issues and Solutions

### 1. **CORS Error**
**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**: 
- Check if your backend API has CORS enabled
- Ensure the API endpoint is accessible from your frontend domain

### 2. **404 Not Found**
**Error**: `HTTP error! Status: 404`

**Solution**:
- Verify the API endpoint exists: `/api/v1/subjects/{subject_id}/details`
- Check if the subject ID exists in your database
- Ensure the API route is properly configured

### 3. **Network Error**
**Error**: `Failed to fetch`

**Solution**:
- Check if the backend server is running
- Verify the API base URL configuration
- Check network connectivity

### 4. **Authentication Error**
**Error**: `HTTP error! Status: 401` or `403`

**Solution**:
- Check if the API requires authentication
- Verify if authentication headers are being sent
- Check if the user session is valid

## Environment Configuration

### Check API Base URL
The API base URL is configured in `src/services/quiz.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
```

### Environment Variables
Make sure you have the correct environment variables set:

```env
NEXT_PUBLIC_API_URL=/api
# or
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## API Endpoint Testing

### Test the API directly in browser:
1. Open browser and go to: `http://localhost:3000/api/v1/subjects/1/details`
2. You should see the API response directly

### Test with curl:
```bash
curl -X GET "http://localhost:3000/api/v1/subjects/1/details" \
  -H "Content-Type: application/json"
```

## Debugging Checklist

- [ ] Check browser console for errors
- [ ] Verify API endpoint is accessible
- [ ] Check network tab in DevTools for failed requests
- [ ] Verify environment variables
- [ ] Test API endpoint directly
- [ ] Check backend server logs
- [ ] Verify CORS configuration
- [ ] Check authentication requirements

## Expected Behavior

1. **On Page Load**: No API call should be made
2. **On Subject Selection**: API call should be made with the selected subject ID
3. **On Test Button Click**: API call should be made with subject ID 1
4. **During Loading**: Units field should be disabled with loading indicator
5. **On Success**: Units should be populated with data from API
6. **On Error**: Error message should be shown, fallback to default units

## Remove Test Code

Once testing is complete, remove the test button and console logs:

1. Remove the test button from the form
2. Remove console.log statements
3. Remove the testApiCall function
4. Clean up any debugging code

## Production Checklist

- [ ] Remove test button
- [ ] Remove console.log statements
- [ ] Remove testApiCall function
- [ ] Verify error handling works properly
- [ ] Test with real subject IDs
- [ ] Verify loading states work correctly
- [ ] Test error scenarios
