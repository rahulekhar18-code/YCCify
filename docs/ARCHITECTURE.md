# YCCify Architecture & Engineering Specification

> **Platform:** YCCify  
> **Tagline:** Everything Your Academics Need.  
> **Institution:** Yeshwantrao Chavan College of Engineering (YCCE), Nagpur  
> **Target Platforms:** Desktop Web (React + TypeScript + Tailwind) and Mobile Android/iOS (React Native + Expo)

---

## 1. High-Level System Architecture

Both the Web Application and the Mobile Application share a single, unified backend architecture.

```
┌─────────────────────────────────┐       ┌────────────────────────────────┐
│      Desktop Web Application    │       │     Android / iOS Mobile App   │
│   (React + TypeScript + Vite)   │       │     (React Native + Expo)      │
│  - Tailwind CSS Responsive UI   │       │  - 5-Tab Dedicated UX          │
│  - Lucide React Icon System     │       │  - Touch-Optimized PDF Viewer  │
└────────────────┬────────────────┘       └───────────────┬────────────────┘
                 │                                        │
                 ▼                                        ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                 Shared Client Layer (@yccify/api)            │
    │  - Official @insforge/sdk client initialization              │
    │  - Unified Token & Session Management                        │
    │  - Type-safe Academic, Resource, Approval, Bookmark Services │
    └──────────────────────────────┬───────────────────────────────┘
                                   │
                                   ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                InsForge Backend Infrastructure               │
    │                                                              │
    │  ├── Authentication Engine: JWT sessions, Role RBAC          │
    │  ├── PostgreSQL Database: PostgREST relational CRUD          │
    │  ├── S3-Compatible File Storage: PDF lecture storage         │
    │  └── Approval Pipeline: Community submission review          │
    └──────────────────────────────────────────────────────────────┘
```

---

## 2. Academic Hierarchy

The platform strictly enforces the academic organization required for Yeshwantrao Chavan College of Engineering:

```
COLLEGE (YCCE Nagpur)
  └── BRANCH (Information Technology, CSE, ETC, Mechanical, Civil)
        └── SEMESTER (Sem 1 to Sem 8)
              └── COURSE (e.g. IT701 Machine Learning)
                    └── RESOURCE CATEGORY (Notes, PYQs, Practicals, Assignments)
                          └── FILES (Multi-page verified PDF documents)
```

---

## 3. Security & Access Control (RBAC)

1. **Role Enforcement:**
   - `Student`: Read access to all approved courses, lecture notes, PYQs, practicals, and assignments. Ability to upload submissions (which start in `pending` status), toggle bookmarks, and view notifications. Cannot alter or access admin controls.
   - `Admin`: Full supervisory control over branches, semesters, courses, faculty directories, upload approvals, student profiles, and system settings.
2. **Database Level Policies:**
   - Public read allowed only on resources with `approval_status = 'approved'`.
   - `upload_approvals` management restricted strictly to administrative tokens.
   - Bookmarks private to the authenticated student owner.
3. **Storage Security:**
   - Multi-file uploads validated for size (max 50MB per file) and MIME type (`application/pdf`, `application/vnd.openxmlformats-officedocument...`).

