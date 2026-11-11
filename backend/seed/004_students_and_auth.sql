-- ==============================================================================
-- 004_students_and_auth.sql
-- YCCify Student Single Account Enforcement & Academic Details
-- ==============================================================================

-- 1. Create students table with strict database-level unique constraints
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prn VARCHAR(50) NOT NULL,
  normalized_email VARCHAR(255) NOT NULL,
  normalized_mobile VARCHAR(20) NOT NULL,
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  is_mobile_verified BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_students_profile UNIQUE (profile_id),
  CONSTRAINT uq_students_prn UNIQUE (prn),
  CONSTRAINT uq_students_email UNIQUE (normalized_email),
  CONSTRAINT uq_students_mobile UNIQUE (normalized_mobile)
);

CREATE INDEX IF NOT EXISTS idx_students_prn ON students(prn);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(normalized_email);
CREATE INDEX IF NOT EXISTS idx_students_mobile ON students(normalized_mobile);

-- 2. Create academic_details table
CREATE TABLE IF NOT EXISTS academic_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  semester_number INT NOT NULL CHECK (semester_number >= 1 AND semester_number <= 8),
  academic_year VARCHAR(20) NOT NULL DEFAULT '2025-26',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_academic_student UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_academic_student ON academic_details(student_id);

-- 3. Enhance student_verifications with dual OTP support
ALTER TABLE student_verifications
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS prn VARCHAR(50),
  ADD COLUMN IF NOT EXISTS email_otp VARCHAR(6),
  ADD COLUMN IF NOT EXISTS mobile_otp VARCHAR(6),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mobile_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cooldown_until TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS resend_count INT DEFAULT 0;

-- 4. Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_details ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students view own record') THEN
    CREATE POLICY "Students view own record" ON students
      FOR SELECT USING (auth.uid() = profile_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students view own academic details') THEN
    CREATE POLICY "Students view own academic details" ON academic_details
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM students WHERE students.id = academic_details.student_id AND students.profile_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
      );
  END IF;
END $$;

