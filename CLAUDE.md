# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<rules>
  <critical>NEVER bypass git pre-commit hooks, unit tests or quality checks.</critical>
  <critical>NEVER finish a task with failing unit tests or quality checks.</critical>
  <critical>NEVER, NEVER commit code with failing unit tests or quality checks.</critical>
  <critical>Execute only the next single incomplete task from $ARGUMENTS. Complete the task, update the task list, then STOP immediately for user review.</critical>
</rules>

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
npm run dev               # Start both processes with nodemon
npm run dev:main         # Main process only
npm run dev:renderer     # Renderer process only
npm run dev:concurrent   # Concurrent development mode

# Code quality
npm run lint            # Run ESLint
npm run lint:fix       # Auto-fix issues
npm run type-check     # TypeScript check
npm run format          # Run Prettier
npm run format:check    # Check Prettier formatting

# Testing
npm run test            # Run tests in watch mode
npm run test:run        # Run tests once
npm run test:ui         # Run tests with UI

# Building
npm run build          # Production build
npm run build:verify   # Build with verification
npm run dist           # Package for current platform
npm run dist:all       # Package for all platforms
npm run preview        # Preview production build

# Database
npm run db:migrate     # Run migrations

# Security and analysis
npm run security:audit # Comprehensive security audit
npm audit              # Basic security audit

# Icon generation
npm run generate:icon  # Generate app icon from base64
npm run generate:icons # Generate all platform icons

# Note: Testing framework not yet implemented (Phase 2)
```

## Project Structure

```
src/
├── main/                    # Electron main process
│   ├── index.ts            # Main process entry point
│   ├── window.ts           # Window management with security
│   ├── menu.ts             # Application menu
│   └── ipc/               # IPC handlers and events
├── renderer/               # React application
│   ├── components/        # Feature-based components
│   │   ├── Home/          # Landing page
│   │   ├── Settings/      # Settings interface
│   │   ├── Chat/          # Chat interface
│   │   ├── UI/            # Reusable UI components
│   │   ├── DevTools/      # Development tools
│   │   ├── ErrorBoundary/ # Error handling
│   │   └── IpcTest/       # IPC testing component
│   ├── hooks/             # Custom React hooks
│   │   ├── useTheme.*     # Theme management
│   │   └── useIpc.*       # IPC communication
│   └── styles/            # CSS themes and globals
├── preload/               # Secure IPC bridge
│   └── index.ts           # Preload script
└── shared/                # Shared types/utils
    ├── types/             # TypeScript interfaces
    └── utils/             # Utility functions

assets/                    # Application assets
├── icon.png              # Main application icon
├── icon.svg              # Scalable vector icon
└── icon-*.svg            # Platform-specific icons

scripts/                   # Build and utility scripts
├── build-verify.js       # Build verification
├── security-audit.js     # Security auditing
├── generate-icon.js      # Icon generation
└── generate-all-icons.js # Multi-platform icons
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

Secure IPC communication with comprehensive type safety:

- Preload script with context isolation
- Input sanitization and validation
- Comprehensive API surface (window controls, system info, configuration)
- React hooks for IPC integration (`useIpc.*`)
- Performance monitoring and error handling

### State Management

Current implementation uses React Context for theme management:

- `ThemeProvider` with localStorage persistence
- `useTheme` hook for theme access
- CSS custom properties for theming
- Light/dark mode toggle functionality

Zustand integration planned for Phase 2.

### AI Provider Integration

AI provider integration planned for Phase 2. Current foundation includes:

- Configuration management through IPC
- Secure API key storage preparation
- Provider service architecture planning

## Contributing

The project follows established contribution guidelines and coding standards:

### Code Standards

- **TypeScript**: Strict mode enabled, no implicit any types
- **ESLint**: Custom @langadventurellc/tsla-linter with comprehensive rules
- **Prettier**: Automated code formatting with project standards
- **Pre-commit Hooks**: Husky + lint-staged for quality enforcement
- **Security**: Comprehensive security audit scripts
- **Build Verification**: Automated build quality checks

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

## Third-Party Library Documentation

When working with third-party libraries, use the context7 MCP tool to get up-to-date documentation and examples. This ensures you have access to the latest API changes and best practices for libraries like FastAPI, Pydantic, LangChain, Firebase, Google Cloud services, and others used in this project.

## Asking Questions

- **Ask one question at a time**
- **Provide options for each question**

_Example question_

```
In case of multiple variations, should metadata be generated for all variations or only the first one?
- **Options:**
  - A) Generate metadata for all variations
  - B) Generate metadata only for the first variation
  - C) Do not generate metadata at all
```

**Remember to ask one question at a time and provide options for each question.**

## Prohibited Actions

- ❌ Shared "kitchen-sink" modules
- ❌ Hardcoded secrets (including file paths outside project root)
- ❌ Scope expansion without approval

<rules>
  <critical>NEVER bypass git pre-commit hooks, unit tests or quality checks.</critical>
  <critical>NEVER finish a task with failing unit tests or quality checks.</critical>
  <critical>NEVER, NEVER commit code with failing unit tests or quality checks.</critical>
  <critical>Write tests for new or modified functionality. Do not write tests for style or formatting.</critical>
  <critical>Never hardcode secrets or environment values, including file paths outside project root.</critical>
  <critical>Ensure all quality checks pass before marking a task complete. Do not proceed if any checks or tests fail.</critical>
  <important>Each "public" class or function should be in its own file, unless otherwise approved.</important>
  <important>Use context7 MCP tool to get up-to-date documentation and best practices for all third-party libraries.</important>
  <important>Ask questions for implementation details, clarifications, or when requirements are ambiguous.</important>
  <rule>Do not write comments for obvious code. Use meaningful variable and function names instead.</rule>
</rules>
