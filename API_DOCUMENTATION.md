# 📚 Autonomise API Documentation

Complete API reference for the Autonomise Task Management Platform backend.

**Base URL**: `http://localhost:5000/api` (development)  
**API Version**: 1.0  
**Authentication**: JWT Bearer Token

---

## 🔑 Authentication

### Login (Get JWT Token)

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "manager"
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

### Register (Create Account)

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "employee"
  }
}
```

**Error Response** (400):
```json
{
  "message": "Email already exists",
  "error": "ValidationError"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

### Verify Token

**Endpoint**: `GET /auth/verify`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200):
```json
{
  "valid": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "manager"
  }
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📋 Tasks API

### Create Task

**Endpoint**: `POST /tasks`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Implement user dashboard",
  "description": "Build the main dashboard with charts",
  "priority": "high",
  "status": "todo",
  "dueDate": "2026-02-28",
  "assignees": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
}
```

**Response** (201):
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "title": "Implement user dashboard",
  "description": "Build the main dashboard with charts",
  "priority": "high",
  "status": "todo",
  "dueDate": "2026-02-28",
  "assignees": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Bob Wilson",
      "email": "bob@example.com"
    }
  ],
  "createdBy": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe"
  },
  "files": [],
  "comments": [],
  "createdAt": "2026-02-03T10:30:00.000Z",
  "updatedAt": "2026-02-03T10:30:00.000Z"
}
```

**Validation Rules**:
- `title` (required): String, min 3 chars
- `description`: String, optional
- `priority`: enum [low, medium, high], default: medium
- `status`: enum [todo, in-progress, done], default: todo
- `dueDate`: ISO date string, optional
- `assignees`: Array of user IDs (MongoDB ObjectId), optional

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user dashboard",
    "description": "Build the main dashboard with charts",
    "priority": "high",
    "assignees": ["507f1f77bcf86cd799439012"]
  }'
```

---

### Get All Tasks

**Endpoint**: `GET /tasks`

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `status` | string | Filter by status (todo, in-progress, done) | - |
| `priority` | string | Filter by priority (low, medium, high) | - |
| `assigneeId` | string | Filter by assignee ID | - |
| `page` | number | Page number for pagination | 1 |
| `limit` | number | Items per page | 20 |
| `search` | string | Search in title and description | - |

**Response** (200):
```json
{
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Implement user dashboard",
      "description": "Build the main dashboard with charts",
      "priority": "high",
      "status": "todo",
      "dueDate": "2026-02-28",
      "assignees": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      ],
      "createdBy": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "files": [],
      "comments": 5,
      "createdAt": "2026-02-03T10:30:00.000Z",
      "updatedAt": "2026-02-03T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/tasks?status=todo&priority=high&page=1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Get Task Details

**Endpoint**: `GET /tasks/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "title": "Implement user dashboard",
  "description": "Build the main dashboard with charts",
  "priority": "high",
  "status": "todo",
  "dueDate": "2026-02-28",
  "assignees": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "employee"
    }
  ],
  "createdBy": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "role": "manager"
  },
  "files": [
    {
      "_id": "607f1f77bcf86cd799439020",
      "filename": "design.jpg",
      "size": 2048576,
      "url": "https://res.cloudinary.com/.../design.jpg",
      "uploadedAt": "2026-02-03T09:00:00.000Z"
    }
  ],
  "comments": [
    {
      "_id": "707f1f77bcf86cd799439030",
      "text": "Great design approach!",
      "author": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith"
      },
      "createdAt": "2026-02-03T11:00:00.000Z",
      "updatedAt": "2026-02-03T11:00:00.000Z"
    }
  ],
  "createdAt": "2026-02-03T10:30:00.000Z",
  "updatedAt": "2026-02-03T10:30:00.000Z"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:5000/api/tasks/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Update Task

**Endpoint**: `PUT /tasks/:id`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "medium",
  "status": "in-progress",
  "dueDate": "2026-03-15",
  "assignees": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
}
```

**Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "medium",
  "status": "in-progress",
  "dueDate": "2026-03-15",
  "assignees": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Bob Wilson",
      "email": "bob@example.com"
    }
  ],
  "createdAt": "2026-02-03T10:30:00.000Z",
  "updatedAt": "2026-02-03T12:45:00.000Z"
}
```

**Email Notification**:
- Email sent to newly assigned employees only
- Not sent to previously assigned employees
- Contains task title, ID, and link

**cURL Example**:
```bash
curl -X PUT http://localhost:5000/api/tasks/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "priority": "medium"
  }'
```

---

### Delete Task

**Endpoint**: `DELETE /tasks/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Task deleted successfully",
  "taskId": "507f1f77bcf86cd799439014"
}
```

**Permission**:
- Only managers and admins can delete tasks
- Soft delete (marks as deleted, doesn't remove from DB)

**cURL Example**:
```bash
curl -X DELETE http://localhost:5000/api/tasks/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Bulk Create Tasks

**Endpoint**: `POST /tasks/bulk`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "tasks": [
    {
      "title": "Task 1",
      "description": "Description 1",
      "priority": "high",
      "status": "todo",
      "dueDate": "2026-02-28",
      "assignees": ["507f1f77bcf86cd799439012"]
    },
    {
      "title": "Task 2",
      "description": "Description 2",
      "priority": "medium",
      "status": "todo",
      "dueDate": "2026-03-10",
      "assignees": ["507f1f77bcf86cd799439013"]
    }
  ]
}
```

**Response** (201):
```json
{
  "message": "2 tasks created successfully",
  "count": 2,
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Task 1",
      "description": "Description 1",
      "priority": "high",
      "status": "todo",
      "assignees": [{"_id": "507f1f77bcf86cd799439012", "name": "Jane Smith"}],
      "createdAt": "2026-02-03T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Task 2",
      "description": "Description 2",
      "priority": "medium",
      "status": "todo",
      "assignees": [{"_id": "507f1f77bcf86cd799439013", "name": "Bob Wilson"}],
      "createdAt": "2026-02-03T10:30:05.000Z"
    }
  ]
}
```

**Email Notifications**:
- One email per task per assignee
- All assignees notified automatically
- Sent asynchronously

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/tasks/bulk \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      {
        "title": "Task 1",
        "description": "Description 1",
        "priority": "high",
        "assignees": ["507f1f77bcf86cd799439012"]
      }
    ]
  }'
```

---

## 💬 Comments API

### Add Comment

**Endpoint**: `POST /comments`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "taskId": "507f1f77bcf86cd799439014",
  "text": "This task looks good, let's proceed with implementation!"
}
```

**Response** (201):
```json
{
  "_id": "707f1f77bcf86cd799439030",
  "taskId": "507f1f77bcf86cd799439014",
  "text": "This task looks good, let's proceed with implementation!",
  "author": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "createdAt": "2026-02-03T11:00:00.000Z",
  "updatedAt": "2026-02-03T11:00:00.000Z"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/comments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "507f1f77bcf86cd799439014",
    "text": "This task looks good, let'"'"'s proceed!"
  }'
```

---

### Get Comments by Task

**Endpoint**: `GET /comments/task/:taskId`

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Comments per page | 10 |

**Response** (200):
```json
{
  "comments": [
    {
      "_id": "707f1f77bcf86cd799439030",
      "taskId": "507f1f77bcf86cd799439014",
      "text": "This task looks good, let's proceed with implementation!",
      "author": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "user@example.com"
      },
      "createdAt": "2026-02-03T11:00:00.000Z",
      "updatedAt": "2026-02-03T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/comments/task/507f1f77bcf86cd799439014?page=1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Update Comment

**Endpoint**: `PUT /comments/:id`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "text": "Updated comment text with new information"
}
```

**Response** (200):
```json
{
  "_id": "707f1f77bcf86cd799439030",
  "taskId": "507f1f77bcf86cd799439014",
  "text": "Updated comment text with new information",
  "author": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe"
  },
  "createdAt": "2026-02-03T11:00:00.000Z",
  "updatedAt": "2026-02-03T11:15:00.000Z"
}
```

**Permission**:
- Comment author can always edit
- Managers and admins can edit any comment

**cURL Example**:
```bash
curl -X PUT http://localhost:5000/api/comments/707f1f77bcf86cd799439030 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Updated comment text with new information"
  }'
```

---

### Delete Comment

**Endpoint**: `DELETE /comments/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Comment deleted successfully",
  "commentId": "707f1f77bcf86cd799439030"
}
```

**Permission**:
- Comment author can always delete
- Managers and admins can delete any comment

**cURL Example**:
```bash
curl -X DELETE http://localhost:5000/api/comments/707f1f77bcf86cd799439030 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📁 Files API

### Upload File

**Endpoint**: `POST /files/upload`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data**:
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `taskId` | string | Task ID to attach file | Yes |
| `file` | file | File to upload (max 5MB) | Yes |

**Response** (201):
```json
{
  "_id": "607f1f77bcf86cd799439020",
  "taskId": "507f1f77bcf86cd799439014",
  "filename": "design.jpg",
  "originalName": "design.jpg",
  "size": 2048576,
  "mimeType": "image/jpeg",
  "url": "https://res.cloudinary.com/demo/image/upload/v1/design.jpg",
  "uploadedBy": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe"
  },
  "uploadedAt": "2026-02-03T10:30:00.000Z"
}
```

**Supported File Types**:
- Images: jpg, jpeg, png, gif, webp
- Documents: pdf, doc, docx, xls, xlsx, ppt, pptx
- Archives: zip, rar, 7z
- Max size: 5MB

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "taskId=507f1f77bcf86cd799439014" \
  -F "file=@/path/to/design.jpg"
```

---

### Download File

**Endpoint**: `GET /files/:id/download`

**Headers**:
```
Authorization: Bearer <token>
```

**Response**: Binary file data with headers:
```
Content-Type: <file-mime-type>
Content-Disposition: attachment; filename="<filename>"
```

**cURL Example**:
```bash
curl -X GET http://localhost:5000/api/files/607f1f77bcf86cd799439020/download \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -o downloaded_file.jpg
```

---

### Delete File

**Endpoint**: `DELETE /files/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "File deleted successfully",
  "fileId": "607f1f77bcf86cd799439020"
}
```

**Permission**:
- File uploader can delete their files
- Task managers can delete any file
- Admins can delete any file

**cURL Example**:
```bash
curl -X DELETE http://localhost:5000/api/files/607f1f77bcf86cd799439020 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 👥 Users API

### Get All Users

**Endpoint**: `GET /users`

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `role` | string | Filter by role (employee, manager, admin) | - |
| `search` | string | Search by name or email | - |
| `limit` | number | Max results | 1000 |

**Response** (200):
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "manager",
      "createdAt": "2026-01-15T08:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "employee",
      "createdAt": "2026-01-20T09:30:00.000Z"
    }
  ]
}
```

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/users?role=employee" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Change User Role

**Endpoint**: `PATCH /users/:id/role`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "role": "manager"
}
```

**Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "manager",
  "updatedAt": "2026-02-03T12:00:00.000Z"
}
```

**Valid Roles**:
- `employee` — Limited permissions (can't create tasks)
- `manager` — Can create and assign tasks
- `admin` — Full system access

**Permission**:
- Only admins can change user roles

**cURL Example**:
```bash
curl -X PATCH http://localhost:5000/api/users/507f1f77bcf86cd799439012/role \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "role": "manager"
  }'
```

---

## 📊 Analytics API

### Get Statistics

**Endpoint**: `GET /analytics/stats`

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `startDate` | string | Start date (ISO format) | 30 days ago |
| `endDate` | string | End date (ISO format) | Today |

**Response** (200):
```json
{
  "overview": {
    "totalTasks": 45,
    "completedTasks": 18,
    "inProgressTasks": 15,
    "todoTasks": 12,
    "completionRate": "40%"
  },
  "byPriority": {
    "high": {
      "total": 10,
      "completed": 4,
      "percentage": "40%"
    },
    "medium": {
      "total": 20,
      "completed": 9,
      "percentage": "45%"
    },
    "low": {
      "total": 15,
      "completed": 5,
      "percentage": "33%"
    }
  },
  "byAssignee": [
    {
      "userId": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "totalTasks": 15,
      "completedTasks": 10,
      "completionRate": "67%"
    },
    {
      "userId": "507f1f77bcf86cd799439013",
      "name": "Bob Wilson",
      "totalTasks": 12,
      "completedTasks": 5,
      "completionRate": "42%"
    }
  ],
  "dueToday": 3,
  "overdue": 2,
  "dateRange": {
    "startDate": "2026-01-04",
    "endDate": "2026-02-03"
  }
}
```

**Permission**:
- Managers and admins can see all statistics
- Employees can only see their own statistics

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/analytics/stats?startDate=2026-01-01&endDate=2026-02-03" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "message": "Error description",
  "error": "ErrorType",
  "statusCode": 400
}
```

### Common Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | BadRequest | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Permission denied |
| 404 | NotFound | Resource not found |
| 422 | ValidationError | Validation failed |
| 429 | TooManyRequests | Rate limit exceeded |
| 500 | InternalError | Server error |

### Example Error Response

```json
{
  "message": "Validation failed: title is required",
  "error": "ValidationError",
  "statusCode": 422
}
```

---

## 🔄 Rate Limiting

**Limits** (Development):
- **10,000 requests** per 60 minutes
- Development mode: Bypass enabled (can be configured)

**Rate Limit Headers**:
```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9999
X-RateLimit-Reset: 1675350600
```

**Error on Limit Exceeded** (429):
```json
{
  "message": "Too many requests, please try again later",
  "error": "TooManyRequests",
  "retryAfter": 3600
}
```

---

## 📝 Pagination

### Request Format
```
GET /api/tasks?page=2&limit=20
```

### Response Format
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## 🧪 Testing with Postman

1. **Import Collection**: Use `postman_collection.json` in root directory
2. **Set Environment**:
   - `{{baseUrl}}` = http://localhost:5000/api
   - `{{token}}` = JWT token from login
3. **Run Requests**: Click "Send"

**Common Setup**:
```
POST {{baseUrl}}/auth/login
{
  "email": "test@example.com",
  "password": "test123"
}
```

Copy the returned `token` and set it in Postman environment or use in requests:
```
Authorization: Bearer {{token}}
```

---

## 📞 Support & Troubleshooting

### Common Issues

**401 Unauthorized**
- Verify token is valid and not expired
- Check Authorization header format: `Bearer <token>`

**422 Validation Error**
- Check required fields in request body
- Verify data types match documentation

**429 Too Many Requests**
- Wait before retrying (see X-RateLimit-Reset header)
- In production, implement exponential backoff

**500 Internal Server**
- Check backend logs
- Verify MongoDB connection
- Check email service configuration

---

**Last Updated**: February 3, 2026  
**API Version**: 1.0  
**Documentation Version**: 1.0
