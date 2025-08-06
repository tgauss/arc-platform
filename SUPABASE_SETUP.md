# ARC Platform - Supabase Setup Guide

## Method 1: Vercel Integration (Recommended)

### Step 1: In Vercel Dashboard
1. Go to your ARC project in Vercel dashboard
2. Navigate to **"Integrations"** tab
3. Search for **"Supabase"**
4. Click **"Add Integration"**
5. Follow the setup wizard to create a new Supabase project

### Step 2: Automatic Configuration
Vercel will automatically:
- Create a new Supabase project
- Set up environment variables in Vercel
- Configure the database connection

## Method 2: Manual Setup (Alternative)

### Step 1: Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Choose organization and project name: `arc-platform`
4. Select region closest to your users
5. Set a strong database password

### Step 2: Get Connection Details
From your Supabase project dashboard:
```
Project URL: https://[project-id].supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (secret)
Database URL: postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
Direct URL: postgresql://postgres:[password]@db.[project-id].pooler.supabase.com:6543/postgres
```

### Step 3: Add Environment Variables in Vercel
In your Vercel project settings → Environment Variables:
```
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project-id].pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-jwt-secret-key-here
```

## After Supabase is Connected

### Step 4: Set Up Database Schema
I'll help you create the tables we designed:

1. **Programs table** - Store Perk program configurations
2. **Activities table** - Quiz/game/survey definitions
3. **Sessions table** - Track user progress
4. **Completions table** - Store results and award points
5. **Analytics table** - Usage tracking
6. **Admin Users table** - Team access control

### Step 5: Enable Row Level Security (RLS)
Critical for multi-tenant security:
- Each program's data is isolated
- Admins can only see their assigned programs
- Participants can only access their own data

### Step 6: Test Database Connection
We'll verify:
- ✅ Database schema created successfully
- ✅ RLS policies working correctly  
- ✅ ARC platform can read/write data
- ✅ Seed data populated

## Next Steps After Database Setup
1. **Real Authentication** - Replace demo login with Supabase Auth
2. **Program Management** - CRUD operations with real data
3. **Activity Builder** - Save activities to database
4. **Analytics Dashboard** - Real usage metrics

## Benefits of Supabase Integration
- **Auto-scaling PostgreSQL** - Handles traffic spikes
- **Built-in Authentication** - User management included
- **Real-time subscriptions** - Live data updates
- **Edge functions** - Serverless database functions
- **Built-in API** - Auto-generated REST/GraphQL APIs