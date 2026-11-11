-- ==============================================================================
-- YCCify Database Schema - PostgreSQL Migration
-- Institution: Yeshwantrao Chavan College of Engineering (YCCE), Nagpur
-- Description: Normalized academic resource-sharing schema with RLS policies
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Colleges Table
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Layers',
    semesters_count INT DEFAULT 8,
    courses_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_college_branch_code UNIQUE(college_id, code)
);

CREATE INDEX IF NOT EXISTS idx_branches_college_id ON branches(college_id);
CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(code);

-- 3. Semesters Table
CREATE TABLE IF NOT EXISTS semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    semester_number INT NOT NULL CHECK (semester_number BETWEEN 1 AND 8),
    academic_year VARCHAR(50) DEFAULT '2025-2026',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_branch_semester UNIQUE(branch_id, semester_number)
);

CREATE INDEX IF NOT EXISTS idx_semesters_branch_id ON semesters(branch_id);

-- 4. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    specialization TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faculty_branch_id ON faculty(branch_id);
CREATE INDEX IF NOT EXISTS idx_faculty_email ON faculty(email);

-- 5. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    credits INT DEFAULT 4 CHECK (credits >= 0),
    description TEXT,
    icon VARCHAR(50) DEFAULT 'BookOpen',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_semester_course_code UNIQUE(semester_id, code)
);

CREATE INDEX IF NOT EXISTS idx_courses_semester_id ON courses(semester_id);
CREATE INDEX IF NOT EXISTS idx_courses_branch_id ON courses(branch_id);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);

-- 6. Course Faculty Junction Table
CREATE TABLE IF NOT EXISTS course_faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_course_faculty UNIQUE(course_id, faculty_id)
);

CREATE INDEX IF NOT EXISTS idx_cf_course_id ON course_faculty(course_id);
CREATE INDEX IF NOT EXISTS idx_cf_faculty_id ON course_faculty(faculty_id);

-- 7. User Profiles Table (Linked with InsForge Auth user UUID)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(100),
    college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_branch_id ON profiles(branch_id);

-- 8. Academic Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('notes', 'pyqs', 'practicals', 'assignments')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    unit_topic VARCHAR(100),
    academic_year VARCHAR(50) DEFAULT '2025-2026',
    uploader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approval_status VARCHAR(50) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    downloads_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_course_id ON resources(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_approval ON resources(approval_status);
CREATE INDEX IF NOT EXISTS idx_resources_uploader ON resources(uploader_id);

-- 9. Resource Files Table (S3/InsForge Storage metadata)
CREATE TABLE IF NOT EXISTS resource_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    page_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rf_resource_id ON resource_files(resource_id);

-- 10. Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_resource_bookmark UNIQUE(user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_resource ON bookmarks(resource_id);

-- 11. Upload Approvals Audit Table
CREATE TABLE IF NOT EXISTS upload_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_approvals_resource ON upload_approvals(resource_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON upload_approvals(status);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER trg_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER trg_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can read; users update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Resources: Approved resources are viewable by everyone; uploaders and admins can view pending/rejected
CREATE POLICY "Approved resources viewable by all" ON resources FOR SELECT USING (approval_status = 'approved' OR auth.uid() = uploader_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Authenticated users can upload resources" ON resources FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can edit own pending resources, admins can edit all" ON resources FOR UPDATE USING (auth.uid() = uploader_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Bookmarks: Users can only see and manage their own bookmarks
CREATE POLICY "Users see own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- Upload Approvals: Only admins can manage approvals
CREATE POLICY "Admins manage approvals" ON upload_approvals FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Notifications: Users manage their own notifications
CREATE POLICY "Users access own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

