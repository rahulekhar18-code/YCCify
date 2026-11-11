# YCCify API & InsForge Integration Specification

> **Base URL:** `http://localhost:7130` (or `INSFORGE_BASE_URL` in production)  
> **Authentication Scheme:** Bearer Token (`Authorization: Bearer <JWT>`)

---

## 1. Authentication Endpoints

### Register Student / Admin
`POST /api/auth/sign-up`
```json
{
  "email": "student@ycce.edu",
  "password": "password123",
  "name": "Ananya Verma",
  "rollNumber": "IT2022088",
  "branchId": "b0000000-0000-0000-0000-000000000001",
  "semesterNumber": 7,
  "role": "student"
}
```
**Response (201 Created):**
```json
{
  "data": {
    "user": {
      "id": "u-uuid",
      "email": "student@ycce.edu",
      "name": "Ananya Verma",
      "role": "student",
      "branchName": "Information Technology",
      "semesterNumber": 7
    },
    "session": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "bearer"
    }
  },
  "error": null
}
```

### Sign In
`POST /api/auth/sign-in`
```json
{
  "email": "rahul.sharma@ycce.edu",
  "password": "password123",
  "role": "student"
}
```
*(Accepts either `email` or `rollNumber`)*

### Get Current Authenticated User
`GET /api/auth/current-user`  
Headers: `Authorization: Bearer <token>`

---

## 2. Academic Catalog Endpoints

### List Branches
`GET /api/database/branches`

### Add Branch (Admin Only)
`POST /api/database/branches`
```json
{
  "name": "Artificial Intelligence & Data Science",
  "code": "AIDS",
  "icon": "Cpu",
  "semestersCount": 8
}
```

### List Courses
`GET /api/database/courses?branchId=:id&semesterNumber=:semNum`

### Get Course Details
`GET /api/database/courses/:id`

### Add Course (Admin Only)
`POST /api/database/courses`
```json
{
  "name": "Distributed Computing",
  "code": "IT706",
  "branchId": "b-it-uuid",
  "semesterId": "s-it-7",
  "credits": 4,
  "facultyId": "f-khedkar-uuid"
}
```

### List Faculty Members
`GET /api/database/faculty?branchId=:branchId`

---

## 3. Academic Resources & Storage Endpoints

### List Resources
`GET /api/database/resources?courseId=:id&category=:cat&status=approved`

### Upload Physical File(s)
`POST /api/storage/upload`  
Content-Type: `multipart/form-data`  
Field: `files` (Array of PDF/DOCX/PPT files, max 50MB per file)

**Response:**
```json
{
  "data": [
    {
      "id": "rf-uuid",
      "fileName": "Unit 6 - Deep Learning Notes.pdf",
      "fileUrl": "/api/storage/files/unit6_notes_171500_200.pdf",
      "storagePath": "uploads/unit6_notes_171500_200.pdf",
      "fileSizeBytes": 3145728,
      "mimeType": "application/pdf",
      "pageCount": 20
    }
  ],
  "error": null
}
```

### Create Resource Entry
`POST /api/database/resources`  
Headers: `Authorization: Bearer <token>`
```json
{
  "courseId": "c-ml-uuid",
  "category": "notes",
  "title": "Unit 6 - Deep Learning Notes.pdf",
  "unitTopic": "Unit 6: Deep Learning Architectures",
  "academicYear": "2025-2026",
  "files": [ ... ]
}
```

### Stream / Download Physical File
`GET /api/storage/files/:filename?download=true`  
Streams physical PDF file with `Content-Type: application/pdf` and `Content-Disposition`.

---

## 4. Bookmarks & Approvals

### List Bookmarks
`GET /api/database/bookmarks` (Requires Auth)

### Toggle Bookmark
`POST /api/database/bookmarks`
```json
{ "resourceId": "r-ml-unit3-uuid" }
```

### View Pending Approvals Queue (Admin Only)
`GET /api/database/approvals`

### Review Approval (Admin Only)
`POST /api/database/approvals/:id/review`
```json
{
  "status": "approved",
  "remarks": "Verified against YCCE syllabus"
}
```

---

## 5. Global Search
`GET /api/database/search?q=:query`  
Returns unified academic matches across branches, courses, resources, and faculty.

