// JWT Token Types
export interface JWTPayload {
  userId: string;
  programId: string;
  exp: number;
  iat: number;
}

// API Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Session Types
export interface SessionData {
  sessionId: string;
  perkUserId: string;
  programId: string;
  activityId: string;
  expiresAt: Date;
}

// Activity Config Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface QuizConfig {
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // seconds
  randomize?: boolean;
}

export interface GameConfig {
  type: 'memory' | 'spin-wheel' | 'scratch-card';
  rules: Record<string, any>;
  prizes: Array<{
    id: string;
    name: string;
    probability: number;
    points: number;
  }>;
}

// Branding Types
export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl?: string;
  favicon?: string;
  customCss?: string;
}

// Analytics Event Types
export type AnalyticsEvent = 
  | 'page_view'
  | 'activity_start'
  | 'activity_complete'
  | 'activity_abandon'
  | 'points_earned'
  | 'error';

export interface AnalyticsPayload {
  event: AnalyticsEvent;
  programId: string;
  activityId?: string;
  perkUserId?: string;
  metadata?: Record<string, any>;
}

// AI Generation Types
export interface AIGenerationRequest {
  type: 'quiz' | 'survey' | 'game';
  prompt: string;
  context?: {
    programName: string;
    brandVoice?: string;
    targetAudience?: string;
  };
  options?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    questionCount?: number;
    pointValue?: number;
  };
}

export interface AIGenerationResponse {
  success: boolean;
  activity?: {
    title: string;
    description: string;
    config: QuizConfig | GameConfig | Record<string, any>;
  };
  error?: string;
}

// Perk API Types
export interface PerkPointsRequest {
  participant_id: string;
  points: number;
  action_title: string;
  action_source: string;
  action_completion_limit?: number;
}

export interface PerkParticipant {
  id: string;
  email: string;
  name?: string;
  points_balance: number;
  tier?: string;
}