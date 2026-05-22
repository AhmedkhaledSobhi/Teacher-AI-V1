# Quiz API Integration Documentation

## Overview

This document outlines the complete API integration for the quiz management system, including backend endpoints, validation, and frontend integration.

## API Endpoints

### 1. Create Quiz

- **Endpoint**: `POST /api/v1/quiz/create`
- **Description**: Creates a new quiz
- **Request Body**:
  ```typescript
  {
    grade_id: number;
    subject_id: number;
    term_id: number;
    quiz_type: number;
    course_id: number;
    unit_ids: number[];
    total_questions: number;
    title: string;
    description?: string;
  }
  ```
- **Response**:
  ```typescript
  {
    operation_status: 'success' | 'error';
    message: string;
    data?: Quiz;
    errors?: Record<string, string>;
  }
  ```

### 2. Get Quizzes List

- **Endpoint**: `GET /api/v1/quiz`
- **Description**: Retrieves a paginated list of quizzes
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `grade_id`: Filter by grade
  - `subject_id`: Filter by subject
  - `term_id`: Filter by term
  - `quiz_type`: Filter by quiz type
  - `course_id`: Filter by course
  - `status`: Filter by status
  - `search`: Search in title and description

### 3. Get Single Quiz

- **Endpoint**: `GET /api/v1/quiz/[id]`
- **Description**: Retrieves a single quiz by ID

### 4. Update Quiz

- **Endpoint**: `PUT /api/v1/quiz/[id]`
- **Description**: Updates an existing quiz

### 5. Delete Quiz

- **Endpoint**: `DELETE /api/v1/quiz/[id]`
- **Description**: Deletes a quiz

## File Structure

```
src/
├── app/api/
│   ├── v1/quiz/
│   │   ├── create/route.ts          # POST /api/v1/quiz/create
│   │   ├── [id]/route.ts            # GET, PUT, DELETE /api/v1/quiz/[id]
│   │   └── route.ts                 # GET /api/v1/quiz
│   ├── validations/
│   │   └── quiz.ts                  # Quiz validation schema
│   └── actions/server/
│       └── quiz.ts                  # Server-side quiz actions
├── services/
│   └── quiz.ts                      # Client-side quiz service
├── types/
│   └── quiz.ts                      # TypeScript interfaces
└── views/apps/quiz/add/
    └── index.tsx                    # Quiz form component
```

## Validation

The quiz creation includes comprehensive validation:

1. **Required Fields**: All fields are required except description
2. **Grade ID**: Must be at least 1
3. **Subject ID**: Must be at least 1
4. **Term ID**: Must be at least 1
5. **Quiz Type**: Must be at least 1
6. **Course ID**: Must be at least 1
7. **Unit IDs**: Must be an array with at least one unit
8. **Total Questions**: Must be between 5 and 10

## Error Handling

The system includes comprehensive error handling:

1. **Validation Errors**: Field-specific validation messages
2. **API Errors**: Server-side error responses
3. **Network Errors**: Connection and timeout handling
4. **User Feedback**: Toast notifications for success/error states

## Usage Examples

### Creating a Quiz (Frontend)

```typescript
import { QuizService } from "@/services/quiz";

const quizData = {
  grade_id: 3,
  subject_id: 1,
  term_id: 1,
  quiz_type: 1,
  course_id: 1,
  unit_ids: [101, 102],
  total_questions: 8,
  title: "Math Quiz - Grade 3",
  description: "Basic arithmetic quiz",
};

try {
  const response = await QuizService.createQuiz(quizData);
  if (response.operation_status === "success") {
  }
} catch (error) {
  console.error("Error creating quiz:", error);
}
```

### Server-Side Quiz Creation

```typescript
import { createQuiz } from "@/app/api/actions/server/quiz";

const quizData = {
  grade_id: 3,
  subject_id: 1,
  term_id: 1,
  quiz_type: 1,
  course_id: 1,
  unit_ids: [101, 102],
  total_questions: 8,
  title: "Math Quiz - Grade 3",
  description: "Basic arithmetic quiz",
};

const response = await createQuiz(quizData);
```

## Environment Variables

Make sure to set the following environment variables:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=/api
```

## Backend Integration

The API routes are designed to work with a backend that expects:

1. **Authentication**: Bearer token in Authorization header
2. **Content-Type**: application/json for requests
3. **Response Format**: Standardized response with operation_status
4. **Error Handling**: Consistent error response format

## Testing

To test the API integration:

1. Start the development server
2. Navigate to `/en/apps/quiz/add` or `/ar/apps/quiz/add`
3. Fill out the quiz form
4. Submit and check the network tab for API calls
5. Verify the response format matches the expected structure

## Localization

The quiz form supports both English and Arabic with RTL layout:

- **English**: `/en/apps/quiz/add`
- **Arabic**: `/ar/apps/quiz/add`

All form labels, validation messages, and notifications are localized.
