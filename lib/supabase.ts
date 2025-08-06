import { createClient } from '@supabase/supabase-js'

// Types for our database schema
export interface Program {
  id: string
  handle: string
  name: string
  perk_program_id: string
  api_key: string
  branding: {
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
    logoUrl?: string
  }
  custom_domain?: string
  is_active: boolean
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  program_id: string
  type: 'QUIZ' | 'SURVEY' | 'GAME' | 'DEMO' | 'CUSTOM'
  slug: string
  title: string
  description?: string
  config: Record<string, any>
  styling: Record<string, any>
  ai_generated: boolean
  ai_prompt?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  published_at?: string
  archived_at?: string
  points_value: number
  action_title: string
  completion_limit: number
  created_at: string
  updated_at: string
}

export interface ProgramUsage {
  id: string
  program_id: string
  month: string
  views: number
  starts: number
  completions: number
  points_awarded: number
  programs?: Program
}

export interface Session {
  id: string
  program_id: string
  activity_id: string
  perk_user_id: string
  jwt_token?: string
  started_at: string
  expires_at: string
  completed_at?: string
  progress: Record<string, any>
  score?: number
}

export interface Completion {
  id: string
  session_id: string
  activity_id: string
  perk_user_id: string
  score?: number
  answers?: Record<string, any>
  data?: Record<string, any>
  points_awarded: number
  perk_api_response?: Record<string, any>
  completed_at: string
}

// Create Supabase client for client-side usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create Supabase client for server-side usage (with service role key)
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Utility functions for common queries
export const programQueries = {
  getAll: () => supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false }),
    
  getById: (id: string) => supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single(),
    
  getByHandle: (handle: string) => supabase
    .from('programs')
    .select('*')
    .eq('handle', handle)
    .single()
}

export const activityQueries = {
  getAll: () => supabase
    .from('activities')
    .select(`
      *,
      programs!inner(name, handle)
    `)
    .order('created_at', { ascending: false }),
    
  getByProgram: (programId: string) => supabase
    .from('activities')
    .select('*')
    .eq('program_id', programId)
    .order('created_at', { ascending: false }),
    
  getById: (id: string) => supabase
    .from('activities')
    .select(`
      *,
      programs!inner(name, handle)
    `)
    .eq('id', id)
    .single()
}

export const usageQueries = {
  getCurrentMonth: () => supabase
    .from('program_usage')
    .select(`
      *,
      programs!inner(name, handle)
    `)
    .gte('month', new Date().toISOString().slice(0, 7) + '-01'),
    
  getByProgram: (programId: string) => supabase
    .from('program_usage')
    .select('*')
    .eq('program_id', programId)
    .order('month', { ascending: false })
    .limit(12)
}