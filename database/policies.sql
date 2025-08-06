-- ARC Platform - Row Level Security Policies
-- Multi-tenant security ensuring program isolation

-- ============ PROGRAMS POLICIES ============
-- Admins can see all programs (for now - can be restricted later)
CREATE POLICY "Admins can view all programs" ON programs
  FOR SELECT USING (true);

CREATE POLICY "Admins can create programs" ON programs  
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update programs" ON programs
  FOR UPDATE USING (true);

CREATE POLICY "Super admins can delete programs" ON programs
  FOR DELETE USING (true);

-- ============ ACTIVITIES POLICIES ============  
-- Activities are scoped to their program
CREATE POLICY "Activities are scoped to program" ON activities
  FOR ALL USING (true); -- Will be restricted based on admin access later

-- ============ SESSIONS POLICIES ============
-- Sessions are private to the user and program
CREATE POLICY "Users can access own sessions" ON sessions
  FOR ALL USING (true); -- Will add proper user context later

-- ============ COMPLETIONS POLICIES ============  
-- Completions are private to the user
CREATE POLICY "Users can access own completions" ON completions
  FOR ALL USING (true); -- Will add proper user context later

-- ============ ANALYTICS POLICIES ============
-- Analytics are scoped to program (admins can see program analytics)
CREATE POLICY "Analytics are scoped to program" ON analytics
  FOR ALL USING (true); -- Will restrict based on admin program access

-- ============ PROGRAM USAGE POLICIES ============
-- Usage data is scoped to program
CREATE POLICY "Usage data is scoped to program" ON program_usage
  FOR ALL USING (true); -- Will restrict based on admin program access

-- ============ ADMIN USERS POLICIES ============
-- Admins can see other admins (for user management)
CREATE POLICY "Admins can view admin users" ON admin_users
  FOR SELECT USING (true);

-- Only super admins can create/update/delete admin users
CREATE POLICY "Super admins manage admin users" ON admin_users
  FOR ALL USING (true); -- Will add role check later

-- ============ AUDIT LOGS POLICIES ============
-- Audit logs are readable by admins, writable by system
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (true);

CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ============ HELPER FUNCTIONS FOR FUTURE USE ============
-- Function to get current admin user (placeholder for now)
CREATE OR REPLACE FUNCTION current_admin_user_id()
RETURNS UUID AS $$
BEGIN
  -- This will be implemented when we add proper auth
  -- For now, return the super admin ID for testing
  RETURN '00000000-0000-0000-0000-000000000001'::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to program (placeholder)
CREATE OR REPLACE FUNCTION user_has_program_access(program_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- For now, allow all access for testing
  -- Will implement proper role-based access later
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get programs accessible by current user
CREATE OR REPLACE FUNCTION accessible_program_ids()
RETURNS UUID[] AS $$
BEGIN
  -- For now, return all program IDs
  -- Will implement proper filtering later
  RETURN ARRAY(SELECT id FROM programs WHERE is_active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============ NOTES ============
-- Current policies are permissive for initial testing
-- Will be tightened as we implement:
-- 1. Proper admin authentication
-- 2. Role-based program access
-- 3. User session management
-- 4. API key validation