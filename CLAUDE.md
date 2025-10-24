# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start Next.js development server with Turbopack
- `npm run dev:supabase` - Start local Supabase instance
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

### Development Workflow
Always run `npm run dev:supabase` first before starting the main development server to ensure the database is available locally.

## Architecture Overview

### Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL database, authentication, API)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack React Query for server state, React Hook Form for forms
- **Charts**: Recharts for data visualization

### Application Structure
This is a client metrics tracking application with the following core entities:

#### Database Schema
- **clients**: Main client records (fitness/training clients)
  - Includes personal info, client type (online/inPerson/hybrid), status
  - Related to specific users via `user_id`
- **metric_definitions**: Defines available metrics to track
  - Supports different unit types: weight, distance, length, percentage, count
  - Can be user-specific or default metrics
- **client_metrics**: Historical metric values for clients
  - Links clients to metric definitions with timestamped values
  - Supports both metric and imperial unit systems
- **client_metric_preferences**: Controls which metrics are visible and their display order per client
- **user_preferences**: User-level preferences for unit systems

#### Key Features
1. **Client Management**: Add, view, edit, archive clients
2. **Metric Tracking**: Record and visualize client progress over time
3. **Flexible Metrics**: Support for various metric types with unit conversion
4. **Customizable Display**: Per-client metric visibility and ordering
5. **Charts**: Historical data visualization with percentage change calculations

### File Structure Patterns
- `/src/app/(app)/` - Main application pages (protected routes)
- `/src/app/(auth)/` - Authentication pages (login, register, etc.)
- `/src/app/api/` - API route handlers
- `/src/components/` - Reusable React components organized by feature
- `/src/hooks/` - Custom React hooks for data fetching and state
- `/src/lib/` - Utility functions, Supabase clients, and type definitions

### Authentication & Authorization
- Uses Supabase Auth with middleware-based session management
- Protected routes use Row Level Security (RLS) policies
- Client data is scoped to individual users via `user_id` foreign keys

### Database Functions
The schema includes helper functions for unit conversion:
- `convert_metric_value()` - Converts between metric and imperial units
- `get_unit_display()` - Returns appropriate unit labels based on preferences

### State Management Patterns
- Server state managed via TanStack React Query with custom hooks in `/src/hooks/`
- Database queries abstracted into `/src/lib/queries/` modules
- Forms use React Hook Form with Zod validation

## Common Development Patterns

### Adding New Metrics
1. Insert into `metric_definitions` table
2. Update frontend components to handle the new metric type
3. Ensure unit conversion functions support the metric if needed

### Client Route Structure
- `/clients` - Client list view
- `/clients/[id]` - Individual client dashboard
- `/clients/[id]/metrics` - Client metrics detail view

### API Route Conventions
- GET endpoints return data with proper authentication checks
- POST endpoints handle both data creation and updates
- All routes verify client ownership via RLS policies

### Component Organization
- UI components in `/src/components/ui/` (shadcn/ui)
- Feature-specific components grouped by domain (clients, auth, etc.)
- Shared layout components in `/src/components/navigation/`

## Development Notes

### Supabase Configuration
- Local development uses Supabase CLI with configuration in `/supabase/config.toml`
- Database schema migrations in `/supabase/migrations/`
- Environment variables required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### TypeScript Setup
- Strict mode enabled with absolute imports via `@/*` path mapping
- Database types should be generated using: `supabase gen types typescript --linked > lib/types.ts`
- Current types.ts is a placeholder and should be replaced with actual generated types

### Styling Conventions
- Uses Tailwind CSS with shadcn/ui component system
- Component variants managed via `class-variance-authority`
- Consistent spacing and styling patterns throughout

### Testing Considerations
- No test framework currently configured
- When adding tests, check existing patterns and setup appropriate test scripts