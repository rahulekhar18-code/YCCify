# YCCify Normalized PostgreSQL Database Schema

> **Platform:** YCCify  
> **Database:** PostgreSQL (with InsForge / PostgREST)  
> **Institution:** Yeshwantrao Chavan College of Engineering (YCCE), Nagpur

---

## Entity Relationship Overview

```
colleges (1) ────< branches (N) ────< semesters (N) ────< courses (N)
                                                               │ (1)
                                                               ├────< course_faculty (N) >──── faculty (1)
                                                               │
                                                               └────< resources (N)
                                                                         │ (1)
                                                                         ├────< resource_files (N)
                                                                         ├────< bookmarks (N) >──── profiles (1)
                                                                         └────< upload_approvals (N)
```

---

## 12 Normalized Core Tables

### 1. `colleges`
Stores institution profile and location details.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `name` (VARCHAR, e.g. "Yeshwantrao Chavan College of Engineering")
- `code` (VARCHAR, e.g. "YCCE")
- `city` (VARCHAR, "Nagpur")
- `state` (VARCHAR, "Maharashtra")
- `logo_url` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 2. `branches`
Academic departments and engineering disciplines.
- `id` (UUID, Primary Key)
- `college_id` (UUID, Foreign Key -> `colleges.id` ON DELETE CASCADE)
- `name` (VARCHAR, e.g. "Information Technology")
- `code` (VARCHAR, e.g. "IT", "CSE", "ETC", "ME", "CE")
- `icon` (VARCHAR, e.g. "Cpu", "Code", "Radio")
- `semesters_count` (INT, Default: 8)
- `courses_count` (INT)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

### 3. `semesters`
Semesters 1 through 8 linked to each branch.
- `id` (UUID, Primary Key)
- `branch_id` (UUID, Foreign Key -> `branches.id` ON DELETE CASCADE)
- `semester_number` (INT, 1 to 8)
- `academic_year` (VARCHAR, "2025-2026")
- `courses_count` (INT)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

### 4. `faculty`
Professors, Associate Professors, and Lecturers.
- `id` (UUID, Primary Key)
- `college_id` (UUID, Foreign Key -> `colleges.id`)
- `branch_id` (UUID, Foreign Key -> `branches.id`)
- `name` (VARCHAR, e.g. "Dr. S. S. Khedkar")
- `designation` (VARCHAR, e.g. "Professor")
- `department` (VARCHAR, e.g. "Information Technology")
- `specialization` (TEXT, e.g. "Machine Learning, Artificial Intelligence")
- `email` (VARCHAR, UNIQUE)
- `phone` (VARCHAR)
- `avatar_url` (TEXT)
- `is_active` (BOOLEAN)

### 5. `courses`
Academic subjects mapped to branch and semester.
- `id` (UUID, Primary Key)
- `semester_id` (UUID, Foreign Key -> `semesters.id` ON DELETE CASCADE)
- `branch_id` (UUID, Foreign Key -> `branches.id` ON DELETE CASCADE)
- `name` (VARCHAR, e.g. "Machine Learning")
- `code` (VARCHAR, e.g. "IT701")
- `credits` (INT, e.g. 4)
- `description` (TEXT)
- `icon` (VARCHAR)
- `is_active` (BOOLEAN)

### 6. `course_faculty`
Junction table mapping professors to courses.
- `id` (UUID, Primary Key)
- `course_id` (UUID, Foreign Key -> `courses.id` ON DELETE CASCADE)
- `faculty_id` (UUID, Foreign Key -> `faculty.id` ON DELETE CASCADE)

### 7. `profiles`
User accounts mapped to InsForge Auth UUIDs.
- `id` (UUID, Primary Key -> InsForge `auth.users.id`)
- `email` (VARCHAR, UNIQUE)
- `name` (VARCHAR)
- `roll_number` (VARCHAR, e.g. "IT2022045")
- `college_id` (UUID)
- `branch_id` (UUID)
- `semester_id` (UUID)
- `role` (VARCHAR, 'student' | 'faculty' | 'admin')
- `avatar_url` (TEXT)

### 8. `resources`
Academic files repository entries.
- `id` (UUID, Primary Key)
- `course_id` (UUID, Foreign Key -> `courses.id` ON DELETE CASCADE)
- `category` (VARCHAR, 'notes' | 'pyqs' | 'practicals' | 'assignments')
- `title` (VARCHAR)
- `description` (TEXT)
- `unit_topic` (VARCHAR)
- `academic_year` (VARCHAR)
- `uploader_id` (UUID, Foreign Key -> `profiles.id`)
- `approval_status` (VARCHAR, 'pending' | 'approved' | 'rejected')
- `rejection_reason` (TEXT)
- `downloads_count` (INT, Default 0)
- `views_count` (INT, Default 0)

### 9. `resource_files`
InsForge Storage object references.
- `id` (UUID, Primary Key)
- `resource_id` (UUID, Foreign Key -> `resources.id` ON DELETE CASCADE)
- `file_name` (VARCHAR)
- `file_url` (TEXT)
- `storage_path` (TEXT)
- `file_size_bytes` (BIGINT)
- `mime_type` (VARCHAR, Default 'application/pdf')
- `page_count` (INT)

### 10. `bookmarks`
Saved resources for quick retrieval.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `profiles.id` ON DELETE CASCADE)
- `resource_id` (UUID, Foreign Key -> `resources.id` ON DELETE CASCADE)
- `created_at` (TIMESTAMPTZ)

### 11. `upload_approvals`
Administrative moderation audit queue.
- `id` (UUID, Primary Key)
- `resource_id` (UUID, Foreign Key -> `resources.id` ON DELETE CASCADE)
- `reviewed_by` (UUID, Foreign Key -> `profiles.id`)
- `status` (VARCHAR, 'pending' | 'approved' | 'rejected')
- `remarks` (TEXT)
- `reviewed_at` (TIMESTAMPTZ)

### 12. `notifications`
System alerts for students and professors.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `profiles.id` ON DELETE CASCADE)
- `title` (VARCHAR)
- `message` (TEXT)
- `type` (VARCHAR, 'info' | 'success' | 'alert')
- `is_read` (BOOLEAN)

