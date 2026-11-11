# YCCify End-to-End Verification & Testing Scenarios

This document outlines the step-by-step verification procedures for each of the core workflows across the YCCify platform.

---

### Scenario 1: Admin Creates a Branch
1. Navigate to `http://localhost:5173/login`.
2. Select **Admin** tab and sign in using `admin@ycce.edu` / `password123`.
3. In the Admin Sidebar, click **Branches** (`/admin/branches`).
4. Click **Add New Branch**.
5. Input Name: `Artificial Intelligence & Data Science`, Code: `AIDS`, Semesters: `8`.
6. Click **Save Branch**.
7. **Verification:** The new branch appears in the database table and automatically initializes Semesters 1 through 8 in the database.

---

### Scenario 2: Admin Adds & Configures Semesters
1. In the Admin Sidebar, click **Semesters** (`/admin/semesters`).
2. Select the branch dropdown.
3. Review Semesters 1 through 8 associated with the department.
4. **Verification:** All 8 semesters are bound to the correct branch UUID.

---

### Scenario 3: Admin Creates a Course & Assigns Faculty
1. Click **Courses** in the Admin sidebar (`/admin/courses`).
2. Click **Add New Course**.
3. Name: `Distributed Computing`, Code: `IT706`, Branch: `Information Technology`, Semester: `7`, Credits: `4`.
4. Assign Faculty: `Dr. S. S. Khedkar`.
5. Click **Save Course**.
6. **Verification:** The course appears in the course registry and is instantly discoverable under IT Semester 7.

---

### Scenario 4: Student Registers & Logs In
1. Navigate to `/register`.
2. Input Name: `Ananya Verma`, Email: `ananya.verma@ycce.edu`, Roll Number: `IT2022088`, Branch: `IT`, Semester: `7`.
3. Click **Complete Student Registration**.
4. **Verification:** Profile is created in the database and the student lands on the personalized Student Dashboard.

---

### Scenario 5: Academic Exploration Hierarchy
1. Click **Explore** (`/explore`).
2. Select **Information Technology**.
3. Select **Semester 7** (highlighted blue card).
4. View course cards: **Machine Learning (IT701)**, **Cloud Computing (IT702)**, etc.
5. Click **Machine Learning**.
6. **Verification:** The Course Hub displays verified Notes (12 files), PYQs (5 files), Practicals (4 files), and Assignments (3 files).

---

### Scenario 6: Student Uploads Multiple Notes
1. Click **Upload** (`/upload`).
2. Branch: `Information Technology`, Semester: `7`, Course: `Machine Learning (IT701)`.
3. Category: `Notes`, Title: `Unit 6 - Deep Learning Notes.pdf`.
4. Attach files and click **Upload & Submit for Verification**.
5. **Verification:** Physical file is saved to InsForge Storage (`backend/src/uploads/`), a database record is created in `resources` with `approval_status = 'pending'`, and an audit record is added to `upload_approvals`.

---

### Scenario 7: Admin Approves the Upload
1. Log in as Admin (`admin@ycce.edu`).
2. Navigate to **Approvals** (`/admin/approvals`).
3. Click **Preview** to verify the document content.
4. Click **Approve**.
5. **Verification:** The resource status updates to `approved` in PostgreSQL, and an automated notification is created for the student.

---

### Scenario 8: Document Preview & Download
1. As a student, open `/preview/:resourceId` or click **Preview** on any verified file.
2. The high-fidelity PDF viewer renders page thumbnails, zoom controls, and formatted lecture slides.
3. Click **Download PDF**.
4. **Verification:** The file streams with `Content-Disposition: attachment` and the download counter increments in the database.

---

### Scenario 9: Bookmarking Resources
1. Click the bookmark icon on any resource card.
2. Navigate to **Saved** (`/saved`).
3. **Verification:** The bookmarked item appears under the active filter pills (All, Notes, PYQs, Practicals) and syncs across web and mobile.

---

### Scenario 10: Multi-Platform Sync (Web + Mobile)
1. Upload a resource or add a bookmark in the Web application.
2. Open the React Native mobile application.
3. **Verification:** The exact same files, bookmarks, courses, and notifications appear identically in both applications via the shared InsForge backend.

---

### Scenario 11: Security & Role-Based Access Control
1. Try accessing `/admin` as an unauthorized student.
2. **Verification:** The route guard and backend auth middleware intercept the request and return `403 Forbidden: Admin privileges required`.

