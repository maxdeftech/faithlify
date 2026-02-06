# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Build & Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

## Environment Variables

Required in `.env.local`:
- `GEMINI_API_KEY` - Google Gemini API for AI-powered reading plan generation
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` - Supabase backend
- `VITE_AUTH0_DOMAIN` / `VITE_AUTH0_CLIENT_ID` - Auth0 (optional, falls back to mock auth)

## Architecture Overview

**Stack**: React 19 + Vite + TypeScript, Supabase (PostgreSQL), Auth0, Google Gemini AI

### Data Flow
```
App.tsx (UI) → useSupabase hooks → service layer → Supabase client
                     ↓
              AuthContext (user state)
```

### Key Directories
- `App.tsx` - Main application with all UI components (single-file architecture)
- `src/services/` - Supabase CRUD operations (postService, userService, churchService, messageService, readingPlanService, bookmarkService)
- `src/hooks/useSupabase.ts` - React hooks that wrap services and manage state/refetching
- `src/contexts/AuthContext.tsx` - Authentication state with Auth0/mock fallback
- `src/types/database.types.ts` - TypeScript types matching Supabase schema
- `supabase/schema.sql` - Database schema with RLS policies
- `types.ts` - Frontend domain types (AppView, User, Post, Church, etc.)
- `constants.tsx` - Mock data and constants (BIBLE_BOOKS, etc.)

### Import Alias
`@/*` maps to project root (see `tsconfig.json` paths)

### Auth Pattern
Auth0 is optional; when not configured (`VITE_AUTH0_DOMAIN` not set), the app uses mock authentication with `MOCK_USER` for local development.

### Real-time Messaging
Messages use Supabase real-time subscriptions via `messageService.subscribeToMessages()`.

### Database
Run `supabase/schema.sql` in Supabase SQL Editor to initialize tables. Row Level Security (RLS) policies control data access.
