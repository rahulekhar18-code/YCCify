# YCCify – Academic Resource-Sharing Platform

<p align="center">
  <img src="./shared/assets/logo.jpg" alt="YCCify Logo" width="120" style="border-radius: 24px;" />
</p>

<p align="center">
  <strong>Everything Your Academics Need.</strong><br>
  Centralized academic repository engineered for students and faculty of <strong>Yeshwantrao Chavan College of Engineering (YCCE), Nagpur</strong>.
</p>

---

## 🚀 Key Highlights

- **Desktop-First Web Application:** React, TypeScript, Tailwind CSS, Lucide React icons, and React Router DOM.
- **Mobile Experience (Android & iOS):** React Native + Expo with a dedicated 5-tab bottom navigation (`Home`, `Explore`, `Upload`, `Saved`, `Profile`).
- **InsForge BaaS Integration:** Built-in InsForge Authentication (`@insforge/sdk`), S3-compatible file storage, and PostgreSQL relational database.
- **Academic Hierarchy:** `College → Branch → Semester → Course → Category → Verified Multi-Page Files`.
- **Verified Categories:** Lecture Notes, Previous Year Questions (PYQs), Lab Practicals & Code, Assignments & Tutorials.
- **Interactive Multi-Page PDF Viewer:** Real multi-page rendering, slide zoom, thumbnail sidebar navigation, and instant downloads.
- **Multi-File Upload Pipeline:** Multi-file drag-and-drop, progress indicator, and automatic submission into the administrative approval queue.
- **Administrative Portal:** Complete 10-tab control panel for Branches, Semesters, Courses, Faculty, Resources, Upload Approvals, and Students.

---

## 📁 Project Structure

```
YCCify/
  ├── apps/
  │   ├── web/                     # React + Vite desktop web platform
  │   │   ├── src/
  │   │   │   ├── components/      # Reusable layout & UI components
  │   │   │   ├── context/         # Auth & Notification providers
  │   │   │   └── pages/           # Student & Admin pages
  │   │   └── vite.config.ts
  │   └── mobile/                  # React Native + Expo mobile application
  │       ├── assets/              # App icon & splash graphics
  │       └── src/
  │           ├── screens/         # Home, Explore, PDF Preview, Upload, etc.
  │           └── theme.ts         # Brand color system & typography
  ├── packages/
  │   ├── api/                     # Shared @insforge/sdk client & services
  │   └── types/                   # Shared TypeScript entity definitions
  ├── backend/
  │   ├── migrations/              # 001_initial_schema.sql (12 PostgreSQL tables)
  │   ├── seed/                    # 002_seed_ycce_data.sql (YCCE initial catalog)
  │   └── src/                     # Express & InsForge-compatible BaaS engine
  ├── shared/
  │   └── assets/                  # Official YCCify logo and branding
  ├── docs/                        # Architecture, DB Schema, API & Testing docs
  ├── .env.example                 # Environment variables template
  └── package.json                 # Monorepo workspaces definition
```

---

## 🛠️ Getting Started

### 1. Prerequisites

- **Node.js:** v18 or higher (v24.x recommended)
- **npm:** v10 or higher
- **Git**

### 2. Installation

Clone the repository and install all workspace dependencies:

```bash
cd Yccify
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default local variables:
```ini
PORT=7130
INSFORGE_BASE_URL=http://localhost:7130
INSFORGE_ANON_KEY=ycce_anon_public_key_2026
VITE_INSFORGE_URL=http://localhost:7130
VITE_INSFORGE_ANON_KEY=ycce_anon_public_key_2026
EXPO_PUBLIC_INSFORGE_URL=http://localhost:7130
EXPO_PUBLIC_INSFORGE_ANON_KEY=ycce_anon_public_key_2026
```

---

## 🏃 Running the Application

### A. Start the Backend Server (InsForge BaaS Engine)

In terminal 1:
```bash
npm run dev:backend
```
The backend initializes on `http://localhost:7130` with the YCCE catalog (Branches, Semesters, Courses, Faculty, and pre-generated valid sample PDFs).

### B. Start the Desktop Web Application

In terminal 2:
```bash
npm run dev:web
```
Open **`http://localhost:5173`** in your browser.

### C. Start the Mobile Application (Expo)

In terminal 3:
```bash
npm run dev:mobile
```
Press `a` to open in Android Emulator, `i` for iOS Simulator, or scan the QR code with **Expo Go** on your physical device.

---

## 🔑 Default Demo Accounts

| Role | Identifier / Email | Password | Access Level |
|---|---|---|---|
| **Student** | `IT2022045` or `rahul.sharma@ycce.edu` | `password123` | Student Dashboard, Explore, Uploads, Bookmarks |
| **Admin** | `admin@ycce.edu` | `password123` | Full Admin Portal, Approvals, Curriculum Control |

---

## 🗄️ Database Setup & Migrations

For a standalone PostgreSQL database or InsForge Cloud deployment:
1. Run `backend/migrations/001_initial_schema.sql` to generate all 12 normalized tables, unique constraints, and Row-Level Security (RLS) policies.
2. Run `backend/seed/002_seed_ycce_data.sql` to populate initial departments (IT, CSE, ETC, ME, CE), courses, professors, and syllabus files.

---

## 📖 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Database Schema & RLS Policies](docs/DATABASE_SCHEMA.md)
- [API & InsForge SDK Specification](docs/API_DOCUMENTATION.md)
- [Testing & Verification Scenarios](docs/TESTING_SCENARIOS.md)

---

## 📄 License

Licensed under the Apache-2.0 License. Designed for Yeshwantrao Chavan College of Engineering (YCCE), Nagpur.

