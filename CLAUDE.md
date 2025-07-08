# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fishbowl is an Electron-based desktop application for multi-agent AI conversations. The project is currently in the specification phase with comprehensive documentation in `docs/specifications/`.

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
npm audit              # Security audit
npx audit-ci --moderate # Dependency vulnerability check

# Building
npm run build          # Production build
npm run dist           # Package for current platform
npm run preview        # Preview production build

# Database
npm run db:migrate     # Run migrations

# CI/CD
# GitHub Actions automatically runs:
# - Linting and type checking
# - Unit tests with coverage
# - Cross-platform builds (Ubuntu, Windows, macOS)
# - Security audits
# - Dependency vulnerability scans
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

## Documentation Structure

The project follows a comprehensive documentation structure:

```
docs/
├── README.md              # Documentation overview
├── blackboard.md          # Agent collaboration knowledge base
├── specifications/        # Technical specifications
│   ├── core-architecture-spec.md
│   ├── agent-model-spec.md
│   ├── ux-specification.md
│   └── implementation-plan.md
├── guides/                # User and developer guides
│   └── README.md
└── technical/             # Technical documentation
    ├── coding-standards.md
    └── README.md
```

Key documentation files:
- `CONTRIBUTING.md`: Contribution guidelines and workflow
- `docs/blackboard.md`: Shared knowledge base for agent collaboration
- `docs/specifications/`: Complete technical specifications
- `docs/technical/coding-standards.md`: Code quality and style guidelines

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

## Contributing

The project follows established contribution guidelines and coding standards:

### Code Standards
- **TypeScript**: Strict mode enabled, no implicit any types
- **ESLint**: Configured with strict rules for code quality
- **Prettier**: Automated code formatting
- **Testing**: Unit tests required for all new features
- **Documentation**: JSDoc comments for public APIs

### Contribution Workflow
1. Fork the repository and create a feature branch
2. Follow coding standards in `docs/technical/coding-standards.md`
3. Write tests for new functionality
4. Run `npm run lint` and `npm run type-check` before committing
5. Submit a pull request with clear description

See `CONTRIBUTING.md` for detailed guidelines.

## Important Notes

- The project uses strict TypeScript - no implicit any types
- All database operations go through the main process
- API keys are stored securely via keytar, never in plain text
- Configuration files in `/config` are JSON-based and user-editable
- CSS Modules handle component styling with theme support via CSS Variables
- The application supports multiple AI providers (OpenAI, Anthropic, Google, Groq, Ollama)

## Current Status

**Phase 0 Complete**: Project foundation has been established with comprehensive documentation, contribution guidelines, coding standards, and CI/CD pipeline setup.

**Completed**:
- ✅ Project documentation structure (`docs/` with specifications, guides, technical docs)
- ✅ Contribution guidelines (`CONTRIBUTING.md`)  
- ✅ Coding standards and conventions (`docs/technical/coding-standards.md`)
- ✅ Initial README with project overview and setup instructions
- ✅ GitHub Actions CI/CD pipeline configuration
- ✅ License file (MIT)
- ✅ Agent collaboration blackboard (`docs/blackboard.md`)

**Next Steps (Phase 1)**:
1. Setting up the basic Electron + React + TypeScript structure
2. Implementing the IPC bridge with type safety
3. Creating the database schema and migrations
4. Building the core UI components
5. Integrating AI providers via Vercel AI SDK