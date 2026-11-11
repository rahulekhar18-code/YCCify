-- ==============================================================================
-- 003_settings_tables.sql
-- YCCify Student Settings Center & Support Module
-- ==============================================================================

-- 1. Profiles Table Extension
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;

-- 2. User Preferences (Theme, UI settings)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme VARCHAR(20) NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_pref_user UNIQUE (user_id)
);

-- 3. Notification Preferences (Category & Channel granular controls)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notes_uploaded BOOLEAN NOT NULL DEFAULT true,
  pyqs_available BOOLEAN NOT NULL DEFAULT true,
  faculty_announcements BOOLEAN NOT NULL DEFAULT true,
  assignment_updates BOOLEAN NOT NULL DEFAULT true,
  academic_notices BOOLEAN NOT NULL DEFAULT true,
  community_replies BOOLEAN NOT NULL DEFAULT true,
  resource_replies BOOLEAN NOT NULL DEFAULT true,
  channel_in_app BOOLEAN NOT NULL DEFAULT true,
  channel_push BOOLEAN NOT NULL DEFAULT true,
  channel_email BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_notif_pref_user UNIQUE (user_id)
);

-- 4. Academic History (Tracking semester and branch progression)
CREATE TABLE IF NOT EXISTS academic_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  previous_semester INT NOT NULL,
  new_semester INT NOT NULL,
  previous_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  new_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  academic_year VARCHAR(20) NOT NULL DEFAULT '2025-26',
  change_reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending_approval', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Support Tickets & Problem Reports
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  assigned_to VARCHAR(255) DEFAULT 'rahulekhar18@gmail.com',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. User Active Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  device_info TEXT,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Student Verifications (For mobile OTP verification & identity confirmation)
CREATE TABLE IF NOT EXISTS student_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mobile VARCHAR(20) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Configuration
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_verifications ENABLE ROW LEVEL SECURITY;

-- User Preferences RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own preferences') THEN
    CREATE POLICY "Users manage own preferences" ON user_preferences
      FOR ALL USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Notification Preferences RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own notification preferences') THEN
    CREATE POLICY "Users manage own notification preferences" ON notification_preferences
      FOR ALL USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Academic History RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own academic history') THEN
    CREATE POLICY "Users view own academic history" ON academic_history
      FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
  END IF;
END $$;

-- Support Tickets RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own support tickets, admins view all') THEN
    CREATE POLICY "Users manage own support tickets, admins view all" ON support_tickets
      FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
      WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
  END IF;
END $$;

