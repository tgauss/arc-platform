-- ARC Platform - Seed Data
-- Initial data for testing and demonstration

-- ============ ADMIN USERS ============
-- Create super admin user (password: admin123)
INSERT INTO admin_users (id, email, name, role, password_hash, is_active) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@perk.studio',
  'Super Admin',
  'SUPER_ADMIN',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
  true
);

-- Create demo content creator (password: creator123)  
INSERT INTO admin_users (id, email, name, role, password_hash, is_active) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'creator@perk.studio',
  'Content Creator',
  'CONTENT_CREATOR',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- creator123
  true
);

-- ============ DEMO PROGRAMS ============
-- Game Face Grooming Program
INSERT INTO programs (id, handle, name, perk_program_id, api_key, branding, is_active) VALUES (
  '00000000-0000-0000-0001-000000000001',
  'gameface',
  'Game Face Grooming',
  'pgm_gameface_123',
  'demo_api_key_gameface_encrypted',
  '{
    "primaryColor": "#1a1a1a",
    "secondaryColor": "#333333", 
    "fontFamily": "Inter, sans-serif",
    "logoUrl": "/logos/gameface-logo.png"
  }',
  true
);

-- Beauty Brand Program  
INSERT INTO programs (id, handle, name, perk_program_id, api_key, branding, is_active) VALUES (
  '00000000-0000-0000-0001-000000000002',
  'beautybrand',
  'Beauty Brand Rewards',
  'pgm_beauty_456',
  'demo_api_key_beauty_encrypted',
  '{
    "primaryColor": "#f472b6",
    "secondaryColor": "#ec4899",
    "fontFamily": "Poppins, sans-serif", 
    "logoUrl": "/logos/beauty-logo.png"
  }',
  true
);

-- Fashion Co Program
INSERT INTO programs (id, handle, name, perk_program_id, api_key, branding, is_active) VALUES (
  '00000000-0000-0000-0001-000000000003',
  'fashionco',
  'Fashion Co VIP',
  'pgm_fashion_789',
  'demo_api_key_fashion_encrypted', 
  '{
    "primaryColor": "#8b5cf6",
    "secondaryColor": "#7c3aed",
    "fontFamily": "Montserrat, sans-serif",
    "logoUrl": "/logos/fashion-logo.png"
  }',
  true
);

-- ============ SAMPLE ACTIVITIES ============
-- Game Face - Welcome Quiz
INSERT INTO activities (id, program_id, type, slug, title, description, config, points_value, action_title, status, published_at) VALUES (
  '00000000-0000-0001-0001-000000000001',
  '00000000-0000-0000-0001-000000000001', -- Game Face program
  'QUIZ',
  'welcome-quiz',
  'Grooming Mastery Quiz',
  'Test your grooming knowledge and earn 50 points!',
  '{
    "questions": [
      {
        "id": "q1",
        "question": "How often should you replace your razor blade for optimal performance?",
        "options": ["After every shave", "Once a month", "Every 5-7 shaves", "When it starts to rust"],
        "correct": 2,
        "explanation": "Most experts recommend replacing razor blades every 5-7 shaves for best results."
      },
      {
        "id": "q2", 
        "question": "What is the best time to apply moisturizer?",
        "options": ["Before bed", "Right after showering while skin is damp", "First thing in the morning", "Whenever skin feels dry"],
        "correct": 1,
        "explanation": "Applying moisturizer to damp skin helps lock in hydration."
      },
      {
        "id": "q3",
        "question": "Which Game Face product is best for on-the-go freshness?",
        "options": ["The Lotion", "Shower Mist", "All The Wipes", "Foot Spray Serum"],
        "correct": 2,
        "explanation": "All The Wipes are perfect for quick freshening up anywhere."
      }
    ],
    "passingScore": 2,
    "timeLimit": 300
  }',
  50,
  'Completed Grooming Mastery Quiz',
  'PUBLISHED',
  NOW()
);

-- Beauty Brand - Product Survey
INSERT INTO activities (id, program_id, type, slug, title, description, config, points_value, action_title, status, published_at) VALUES (
  '00000000-0000-0001-0001-000000000002', 
  '00000000-0000-0000-0001-000000000002', -- Beauty Brand program
  'SURVEY',
  'product-feedback',
  'Product Feedback Survey',
  'Help us improve our products and earn 25 points!',
  '{
    "questions": [
      {
        "id": "q1",
        "question": "How would you rate our new foundation?",
        "type": "rating",
        "scale": 5
      },
      {
        "id": "q2",
        "question": "What is your biggest skincare concern?",
        "type": "multiple_choice",
        "options": ["Dryness", "Acne", "Aging", "Sensitivity", "Oiliness"]
      },
      {
        "id": "q3",
        "question": "Any additional feedback?",
        "type": "text",
        "required": false
      }
    ]
  }',
  25,
  'Completed Product Feedback Survey',
  'PUBLISHED',
  NOW()
);

-- Fashion Co - Style Quiz
INSERT INTO activities (id, program_id, type, slug, title, description, config, points_value, action_title, status) VALUES (
  '00000000-0000-0001-0001-000000000003',
  '00000000-0000-0000-0001-000000000003', -- Fashion Co program  
  'QUIZ',
  'style-personality',
  'Style Personality Quiz',
  'Discover your fashion style and unlock exclusive rewards!',
  '{
    "questions": [
      {
        "id": "q1",
        "question": "Your go-to weekend outfit is:",
        "options": ["Jeans and a comfy tee", "A flowy dress", "Athleisure wear", "Something trendy I just bought"],
        "correct": -1
      }
    ],
    "isPersonality": true
  }',
  75,
  'Completed Style Personality Quiz',
  'DRAFT'
);

-- ============ INITIAL USAGE TRACKING ============
-- Current month usage records
INSERT INTO program_usage (program_id, month, views, starts, completions, points_awarded) VALUES 
  ('00000000-0000-0000-0001-000000000001', DATE_TRUNC('month', NOW()), 1247, 892, 445, 22250),
  ('00000000-0000-0000-0001-000000000002', DATE_TRUNC('month', NOW()), 856, 623, 287, 7175),
  ('00000000-0000-0000-0001-000000000003', DATE_TRUNC('month', NOW()), 1034, 721, 156, 11700);

-- ============ AUDIT LOG ============
-- Initial setup audit entry
INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, changes) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'seed_database',
  'system',
  '00000000-0000-0000-0000-000000000000',
  '{
    "programs_created": 3,
    "activities_created": 3, 
    "admin_users_created": 2,
    "seed_version": "1.0.0"
  }'
);