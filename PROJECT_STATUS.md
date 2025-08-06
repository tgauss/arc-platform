# ARC Platform - Project Status

## Overview
ARC (Activity Reward Channel) is a multi-tenant platform for building custom experiences that integrate with Perk loyalty programs. This is an internal tool for Perk team members to create activities for client programs.

## Architecture Completed ✅

### 1. Monorepo Structure
- **Root**: npm workspaces configuration
- **apps/web**: Next.js admin dashboard
- **apps/player**: Next.js player experience (pending)
- **apps/api**: Backend API service (pending)
- **packages/database**: Prisma schema with multi-tenant design
- **packages/types**: Shared TypeScript types
- **packages/ui**: Shared UI components (pending)
- **services/**: Auth, Perk API, AI integrations (pending)

### 2. Database Schema (PostgreSQL/Supabase)
- Multi-tenant design with `program_id` on all tables
- Programs, Activities, Sessions, Completions tracking
- Analytics and usage tracking
- Admin users with role-based access
- Audit logging for compliance

### 3. Admin Dashboard (apps/web)
- ✅ Basic Next.js 14 setup with App Router
- ✅ Login page (demo auth)
- ✅ Dashboard with stats overview
- ✅ Programs listing page
- ✅ Tailwind CSS styling
- 🚧 Activities builder
- 🚧 Analytics dashboard

## Next Steps

### Immediate Priorities

1. **Complete Authentication System**
   ```typescript
   // Implement JWT auth with Supabase
   - Create auth middleware
   - Secure API routes
   - Add session management
   ```

2. **Build Player App** (`apps/player`)
   ```typescript
   // Multi-tenant player experience
   - Wildcard subdomain routing
   - Dynamic theming per program
   - Activity renderer (quiz, game, etc.)
   - JWT validation from Perk redirect
   ```

3. **Create API Service** (`apps/api`)
   ```typescript
   // Fastify/NestJS backend
   - Program CRUD endpoints
   - Activity management
   - Perk API integration
   - Analytics collection
   ```

4. **AI Activity Builder**
   ```typescript
   // Claude integration for content generation
   - Quiz generator
   - Survey builder
   - Game template system
   ```

## How to Run

```bash
# Install dependencies
cd /Users/tgauss/Projects/Claude Code/ARC
npm install

# Run database migrations (once Supabase is connected)
npm run db:migrate

# Start admin dashboard
npm run dev

# Access at http://localhost:3000
# Demo login: admin@perk.studio / admin123
```

## Environment Setup Needed

1. Create `.env.local` from `.env.example`
2. Add Supabase credentials
3. Add Perk API key
4. Add Claude API key
5. Generate JWT secret

## Technical Decisions Made

1. **Next.js 14**: Latest App Router for both admin and player apps
2. **Supabase**: Managed PostgreSQL with built-in auth
3. **Prisma**: Type-safe ORM with migrations
4. **Tailwind CSS**: Utility-first styling
5. **TypeScript**: Full type safety across monorepo
6. **Vercel**: Deployment with wildcard domains

## Key Features to Implement

- [ ] JWT token validation from Perk redirects
- [ ] Wildcard subdomain routing (`*.perk.ooo`)
- [ ] Dynamic theming per program
- [ ] AI-powered activity generation
- [ ] Real-time analytics
- [ ] Webhook support for Perk events
- [ ] Rate limiting and security
- [ ] Comprehensive audit logging

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐
│   Perk Program  │────▶│   ARC Player    │
│  (redirect with │     │ ({handle}.perk.ooo)│
│   ?pid=123)     │     └────────┬────────┘
└─────────────────┘              │
                                 ▼
                        ┌─────────────────┐
                        │   ARC Backend   │
                        │  (API Service)  │
                        └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
           ┌─────────────────┐       ┌─────────────────┐
           │    Supabase     │       │    Perk API     │
           │   (Database)    │       │ (Points/Actions)│
           └─────────────────┘       └─────────────────┘
```

This foundation provides a solid base for building the complete ARC platform!