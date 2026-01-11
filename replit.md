# AI Medical Legal Opinion System

## Overview

This is a medical-legal opinion generation system that processes PDF medical documents through a multi-agent AI pipeline to produce professional legal opinions. The application is built for Hebrew-speaking users (RTL interface) and uses Google's Gemini AI models through Replit's AI Integrations service.

The system processes medical files through four sequential AI agents:
1. **Architect** - Extracts and structures data from medical PDFs
2. **Miner** - Mines clinical data for legal opinion writing
3. **Adjudicator** - Generates the legal medical opinion
4. **Formatter** - Produces the final formatted HTML report

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state with polling support for case status updates
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and UI animations
- **Direction**: RTL (Right-to-Left) for Hebrew language support
- **Fonts**: Heebo (sans), Frank Ruhl Libre (serif), IBM Plex Mono (mono)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **File Upload**: Multer with memory storage for PDF processing
- **PDF Parsing**: pdf-parse library for text extraction
- **Build Tool**: Vite for frontend, esbuild for server bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with `db:push` command
- **Tables**: 
  - `cases` - Medical case records with AI agent outputs
  - `conversations` - Chat history for AI conversations
  - `messages` - Individual chat messages

### AI Integration
- **Provider**: Google Gemini via Replit AI Integrations
- **Models Available**: gemini-2.5-flash, gemini-2.5-pro, gemini-2.5-flash-image
- **Configuration**: Uses `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL` environment variables
- **Pattern**: Multi-agent pipeline with specialized prompts for each processing stage

### API Structure
- `POST /api/cases` - Create new case with PDF upload (multipart/form-data)
- `GET /api/cases` - List all cases
- `GET /api/cases/:id` - Get single case with polling for status updates
- `POST /api/cases/:id/process` - Trigger case processing
- Chat and image generation endpoints via Replit integrations

## External Dependencies

### AI Services
- **Replit AI Integrations**: Provides Gemini API access without requiring separate API keys. Configured through environment variables `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL`.

### Database
- **PostgreSQL**: Required database. Connection via `DATABASE_URL` environment variable. Uses Drizzle ORM for type-safe queries and schema management.

### Key NPM Packages
- `@google/genai` - Google Generative AI SDK
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `pdf-parse` - PDF text extraction
- `@tanstack/react-query` - Data fetching and caching
- `framer-motion` - Animations
- `date-fns` - Date formatting with Hebrew locale support
- Full shadcn/ui component set via Radix UI primitives