-- ARC Platform Database Schema
-- Multi-tenant structure for Perk loyalty program experiences

-- ============ PROGRAMS ============
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL, -- subdomain handle (e.g., "gameface")
  name TEXT NOT NULL,
  perk_program_id TEXT UNIQUE NOT NULL, -- ID in Perk system
  api_key TEXT NOT NULL, -- Encrypted Perk API key
  
  -- Branding
  branding JSONB DEFAULT '{}', -- Colors, fonts, logo URL
  custom_domain TEXT, -- Future: custom domain support
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX idx_programs_handle ON programs(handle);
CREATE INDEX idx_programs_perk_id ON programs(perk_program_id);

-- ============ ACTIVITIES ============
CREATE TYPE activity_type AS ENUM ('QUIZ', 'SURVEY', 'GAME', 'DEMO', 'CUSTOM');
CREATE TYPE activity_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Basic info
  type activity_type NOT NULL,
  slug TEXT NOT NULL, -- URL slug (e.g., "quiz-grooming-101")
  title TEXT NOT NULL,
  description TEXT,
  
  -- Configuration
  config JSONB NOT NULL DEFAULT '{}', -- Activity-specific config
  styling JSONB DEFAULT '{}', -- Override program branding
  
  -- AI Generation
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT, -- Original prompt used to generate
  
  -- Status
  status activity_status DEFAULT 'DRAFT',
  published_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  
  -- Points & Rewards
  points_value INTEGER DEFAULT 0,
  action_title TEXT NOT NULL, -- For Perk API
  completion_limit INTEGER DEFAULT 1, -- How many times can complete
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(program_id, slug)
);

-- Create indexes
CREATE INDEX idx_activities_program_status ON activities(program_id, status);
CREATE INDEX idx_activities_type ON activities(type);

-- ============ SESSIONS ============
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  
  -- User identification
  perk_user_id TEXT NOT NULL, -- Perk participant ID
  jwt_token TEXT, -- JWT token if used
  
  -- Session data
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Progress tracking
  progress JSONB DEFAULT '{}', -- Current state
  score INTEGER
);

-- Create indexes
CREATE INDEX idx_sessions_program_user ON sessions(program_id, perk_user_id);
CREATE INDEX idx_sessions_activity_user ON sessions(activity_id, perk_user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============ COMPLETIONS ============
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  
  -- Results
  perk_user_id TEXT NOT NULL,
  score INTEGER,
  answers JSONB, -- Quiz/survey answers
  data JSONB, -- Other completion data
  
  -- Points awarded
  points_awarded INTEGER NOT NULL,
  perk_api_response JSONB, -- Response from Perk API
  
  -- Timestamps
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicates (user can complete same activity multiple times but tracked)
  UNIQUE(activity_id, perk_user_id, completed_at)
);

-- Create indexes
CREATE INDEX idx_completions_user ON completions(perk_user_id);
CREATE INDEX idx_completions_activity ON completions(activity_id);

-- ============ ANALYTICS ============
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  
  -- Event data
  event TEXT NOT NULL, -- "view", "start", "complete", "abandon", etc.
  perk_user_id TEXT,
  metadata JSONB,
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX idx_analytics_program_event_time ON analytics(program_id, event, timestamp);
CREATE INDEX idx_analytics_activity_event_time ON analytics(activity_id, event, timestamp);

-- ============ USAGE TRACKING ============
CREATE TABLE program_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Monthly aggregates
  month DATE NOT NULL, -- First day of month
  views INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  points_awarded INTEGER DEFAULT 0,
  
  UNIQUE(program_id, month)
);

-- Create index
CREATE INDEX idx_program_usage_month ON program_usage(month);

-- ============ ADMIN USERS ============
CREATE TYPE admin_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CONTENT_CREATOR', 'VIEWER');

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role admin_role DEFAULT 'ADMIN',
  
  -- Auth (can use Supabase Auth instead)
  password_hash TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ AUDIT LOG ============
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id),
  
  action TEXT NOT NULL, -- "create_program", "publish_activity", etc.
  entity_type TEXT NOT NULL, -- "program", "activity", etc.
  entity_id UUID NOT NULL,
  changes JSONB, -- What changed
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_time ON audit_logs(admin_user_id, timestamp);

-- ============ ROW LEVEL SECURITY ============
-- Enable RLS on all tables
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============ FUNCTIONS ============
-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();