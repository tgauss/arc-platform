-- ============================================
-- ARC PLATFORM - COMPLETE DATABASE SETUP
-- ============================================
-- Run this in Supabase SQL Editor to set up everything

-- ============ PROGRAMS ============
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  perk_program_id TEXT UNIQUE NOT NULL,
  api_key TEXT NOT NULL,
  branding JSONB DEFAULT '{}',
  custom_domain TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_programs_handle ON programs(handle);
CREATE INDEX idx_programs_perk_id ON programs(perk_program_id);

-- ============ ACTIVITIES ============
CREATE TYPE activity_type AS ENUM ('QUIZ', 'SURVEY', 'GAME', 'DEMO', 'CUSTOM');
CREATE TYPE activity_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  styling JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  status activity_status DEFAULT 'DRAFT',
  published_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  points_value INTEGER DEFAULT 0,
  action_title TEXT NOT NULL,
  completion_limit INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(program_id, slug)
);

CREATE INDEX idx_activities_program_status ON activities(program_id, status);
CREATE INDEX idx_activities_type ON activities(type);

-- ============ SESSIONS ============
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  perk_user_id TEXT NOT NULL,
  jwt_token TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress JSONB DEFAULT '{}',
  score INTEGER
);

CREATE INDEX idx_sessions_program_user ON sessions(program_id, perk_user_id);
CREATE INDEX idx_sessions_activity_user ON sessions(activity_id, perk_user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============ COMPLETIONS ============
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  perk_user_id TEXT NOT NULL,
  score INTEGER,
  answers JSONB,
  data JSONB,
  points_awarded INTEGER NOT NULL,
  perk_api_response JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, perk_user_id, completed_at)
);

CREATE INDEX idx_completions_user ON completions(perk_user_id);
CREATE INDEX idx_completions_activity ON completions(activity_id);

-- ============ ANALYTICS ============
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  perk_user_id TEXT,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_program_event_time ON analytics(program_id, event, timestamp);
CREATE INDEX idx_analytics_activity_event_time ON analytics(activity_id, event, timestamp);

-- ============ PROGRAM USAGE ============
CREATE TABLE program_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  views INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  points_awarded INTEGER DEFAULT 0,
  UNIQUE(program_id, month)
);

CREATE INDEX idx_program_usage_month ON program_usage(month);

-- ============ ADMIN USERS ============
CREATE TYPE admin_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CONTENT_CREATOR', 'VIEWER');

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role admin_role DEFAULT 'ADMIN',
  password_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ AUDIT LOG ============
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_time ON audit_logs(admin_user_id, timestamp);

-- ============ FUNCTIONS ============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============ SEED DATA ============
-- Create super admin (password: admin123)
INSERT INTO admin_users (email, name, role, password_hash, is_active) VALUES 
('admin@perk.studio', 'Super Admin', 'SUPER_ADMIN', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true);

-- Create demo programs
INSERT INTO programs (handle, name, perk_program_id, api_key, branding, is_active) VALUES 
('gameface', 'Game Face Grooming', 'pgm_gameface_123', 'demo_api_key_gameface_encrypted', 
'{"primaryColor": "#1a1a1a", "secondaryColor": "#333333", "fontFamily": "Inter, sans-serif"}', true),

('beautybrand', 'Beauty Brand Rewards', 'pgm_beauty_456', 'demo_api_key_beauty_encrypted',
'{"primaryColor": "#f472b6", "secondaryColor": "#ec4899", "fontFamily": "Poppins, sans-serif"}', true),

('fashionco', 'Fashion Co VIP', 'pgm_fashion_789', 'demo_api_key_fashion_encrypted',
'{"primaryColor": "#8b5cf6", "secondaryColor": "#7c3aed", "fontFamily": "Montserrat, sans-serif"}', true);

-- Create sample activities
INSERT INTO activities (program_id, type, slug, title, description, config, points_value, action_title, status, published_at) 
SELECT p.id, 'QUIZ', 'welcome-quiz', 'Grooming Mastery Quiz', 'Test your grooming knowledge and earn 50 points!',
'{"questions": [{"id": "q1", "question": "How often should you replace your razor blade?", "options": ["After every shave", "Once a month", "Every 5-7 shaves", "When it starts to rust"], "correct": 2}], "passingScore": 1}',
50, 'Completed Grooming Mastery Quiz', 'PUBLISHED', NOW()
FROM programs p WHERE p.handle = 'gameface';

-- Create usage tracking for current month
INSERT INTO program_usage (program_id, month, views, starts, completions, points_awarded)
SELECT id, DATE_TRUNC('month', NOW()), 1000, 750, 400, 20000 FROM programs;

-- ============ ROW LEVEL SECURITY ============
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic policies (permissive for testing)
CREATE POLICY "Enable all access for testing" ON programs FOR ALL USING (true);
CREATE POLICY "Enable all access for testing" ON activities FOR ALL USING (true);
CREATE POLICY "Enable all access for testing" ON sessions FOR ALL USING (true);
CREATE POLICY "Enable all access for testing" ON completions FOR ALL USING (true);
CREATE POLICY "Enable all access for testing" ON analytics FOR ALL USING (true);
CREATE POLICY "Enable all access for testing" ON program_usage FOR ALL USING (true);
CREATE POLICY "Enable all access for testing" ON admin_users FOR ALL USING (true);
CREATE POLICY "Enable all access for testing" ON audit_logs FOR ALL USING (true);