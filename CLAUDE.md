# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fishbowl (AI Collaborators) is an Electron-based desktop application for multi-agent AI conversations. The project is currently in the specification phase with comprehensive documentation in `docs/specifications/`.

## Key Architecture

### Process Separation
- **Main Process**: Handles system operations, database (SQLite), secure storage (keytar), file system access
- **Renderer Process**: React 18+ UI with TypeScript, Zustand state management, AI provider integration
- **IPC Bridge**: Type-safe communication between processes using defined channel interfaces

### Technology Stack
- **Framework**: Electron with Vite build system
- **Frontend**: React 18+, TypeScript (strict mode), Zustand
- **Database**: SQLite via better-sqlite3
- **AI Integration**: Vercel AI SDK
- **Styling**: CSS Modules with CSS Variables for theming
- **Security**: keytar for API key storage

## Development Commands

```bash
# Initial setup
npm install
npm rebuild better-sqlite3  # If SQLite issues

# Development (hot reload)
npm run dev               # Start both processes
npm run dev:main         # Main process only  
npm run dev:renderer     # Renderer process only

# Testing
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage

# Code quality
npm run lint            # Run ESLint
npm run lint:fix       # Auto-fix issues
npm run type-check     # TypeScript check

# Building
npm run build          # Production build
npm run dist           # Package for current platform
npm run preview        # Preview production build

# Database
npm run db:migrate     # Run migrations
```

## Project Structure

```
src/
├── main/                    # Electron main process
│   ├── database/           # SQLite operations
│   ├── config/            # Config file management
│   ├── security/          # Keytar integration
│   └── ipc/              # IPC handlers
├── renderer/               # React application
│   ├── components/        # Feature-based components
│   ├── store/            # Zustand stores
│   ├── hooks/            # Custom React hooks
│   └── services/         # AI provider services
└── shared/                # Shared types/utils
    └── types/            # TypeScript interfaces
```

## Key Implementation Patterns

### Feature-Based Components
Components are organized by feature:
```
components/ChatRoom/
├── ChatRoom.tsx
├── ChatRoom.module.css
├── MessageList.tsx
└── index.ts
```

### Type-Safe IPC
All IPC communication uses typed channels defined in `shared/types/ipc.ts`.

### State Management
Zustand stores with persistence middleware handle application state. Access via hooks:
```typescript
const { agents, addAgent } = useAgentStore();
```

### AI Provider Integration
Providers implement a common interface and are registered in the provider factory. New providers require:
1. Service implementation in `services/ai/providers/`
2. Configuration in `config/models.json`
3. Registration in provider factory

## Important Notes

- The project uses strict TypeScript - no implicit any types
- All database operations go through the main process
- API keys are stored securely via keytar, never in plain text
- Configuration files in `/config` are JSON-based and user-editable
- CSS Modules handle component styling with theme support via CSS Variables
- The application supports multiple AI providers (OpenAI, Anthropic, Google, Groq, Ollama)

## Current Status

The project has comprehensive specifications but no implementation yet. Start by:
1. Setting up the basic Electron + React + TypeScript structure
2. Implementing the IPC bridge with type safety
3. Creating the database schema and migrations
4. Building the core UI components
5. Integrating AI providers via Vercel AI SDK