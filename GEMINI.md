This file provides guidance to AI coding agents when working with code in this repository.

<rules>
  <critical>NEVER bypass git pre-commit hooks, unit tests or quality checks.</critical>
  <critical>NEVER finish a task with failing unit tests or quality checks.</critical>
  <critical>NEVER, NEVER commit code with failing unit tests or quality checks.</critical>
  <critical>Execute only the next single incomplete task from $ARGUMENTS. Complete the task, update the task list, then STOP immediately for user review.</critical>
  <critical>ALWAYS run quality checks (npm run lint, npm run format, npm run type-check) after making ANY code changes. Fix all issues before proceeding.</critical>
  <critical>ALWAYS follow Research → Plan → Implement workflow. NEVER jump straight to coding!</critical>
</rules>

# Development Partnership

We're building production-quality code together. Your role is to create maintainable, efficient solutions while catching potential issues early.

When you seem stuck or overly complex, I'll redirect you - my guidance helps you stay on track.

## 🚨 AUTOMATED CHECKS ARE MANDATORY

**ALL quality check failures are BLOCKING - EVERYTHING must be ✅ GREEN!**
No errors. No formatting issues. No linting problems. Zero tolerance.
These are not suggestions. Fix ALL issues before continuing.

## CRITICAL WORKFLOW - ALWAYS FOLLOW THIS!

### Research → Plan → Implement

**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:

1. **Research**: Explore the codebase, understand existing patterns
2. **Plan**: Create a detailed implementation plan and verify it with me
3. **Implement**: Execute the plan with validation checkpoints

When asked to implement any feature, you'll first say: "Let me research the codebase and create a plan before implementing."

For complex architectural decisions or challenging problems, use **"ultrathink"** to engage maximum reasoning capacity. Say: "Let me ultrathink about this architecture before proposing a solution."

### USE MULTIPLE AGENTS!

_Leverage subagents aggressively_ for better results:

- Spawn agents to explore different parts of the codebase in parallel
- Use one agent to write tests while another implements features
- Delegate research tasks: "I'll have an agent investigate the database schema while I analyze the API structure"
- For complex refactors: One agent identifies changes, another implements them

Say: "I'll spawn agents to tackle different aspects of this problem" whenever a task has multiple independent parts.

### Reality Checkpoints

**Stop and validate** at these moments:

- After implementing a complete feature
- Before starting a new major component
- When something feels wrong
- Before declaring "done"
- **WHEN QUALITY CHECKS FAIL** ❌

Run: `npm run lint && npm run format && npm run type-check && npm test`

> Why: You can lose track of what's actually working. These checkpoints prevent cascading failures.

### 🚨 CRITICAL: Quality Check Failures Are BLOCKING

**When quality checks report ANY issues, you MUST:**

1. **STOP IMMEDIATELY** - Do not continue with other tasks
2. **FIX ALL ISSUES** - Address every ❌ issue until everything is ✅ GREEN
3. **VERIFY THE FIX** - Re-run the failed command to confirm it's fixed
4. **CONTINUE ORIGINAL TASK** - Return to what you were doing before the interrupt
5. **NEVER IGNORE** - There are NO warnings, only requirements

This includes:

- ESLint violations
- Prettier formatting issues
- TypeScript type errors
- Failing tests
- Build errors

Your code must be 100% clean. No exceptions.

## Project Overview

Fishbowl is an Electron-based desktop application for multi-agent AI conversations. The project is currently in the specification phase with comprehensive documentation in `docs/specifications/`.

## Key Architecture

### Process Separation

- **Main Process**: Handles system operations, database (SQLite), secure storage (keytar), file system access
- **Renderer Process**: React 18+ UI with TypeScript, Zustand state management, AI provider integration
- **IPC Bridge**: Type-safe communication between processes using defined channel interfaces

### Technology Stack

- **Framework**: Electron with Vite build system
- **Testing**: Vitest for unit tests, Playwright for end-to-end tests
- **Frontend**: React 18+, TypeScript (strict mode), Zustand
- **Database**: SQLite via better-sqlite3
- **AI Integration**: Vercel AI SDK
- **Styling**: Tailwind CSS and Shadcn UI
- **Security**: keytar for API key storage
- **Validation**: Zod schemas for all IPC operations
- **IPC**: Type-safe communication with comprehensive error handling

## TypeScript/JavaScript-Specific Rules

### FORBIDDEN - NEVER DO THESE:

- **NO any types** - Use specific, concrete types always
- **NO unhandled promises** - Always use try/catch or .catch()
- **NO console.log in production code** - Use proper logging
- **NO magic numbers/strings** - Use named constants
- **NO keeping old and new code together** - Delete replaced code immediately
- **NO migration functions or compatibility layers**
- **NO versioned function names** (processV2, handleNew)
- **NO TODOs in final code**
- **NO shared "kitchen-sink" modules** - One export per file!
- **NO hardcoded secrets or environment values**
- **NO direct DOM manipulation in React** - Use React patterns
- **NO import aliases** - Use relative paths only - import aliases do not compile correctly in Electron scripts

> **AUTOMATED ENFORCEMENT**: ESLint will BLOCK commits that violate these rules.
> When you see `❌ ESLint error`, you MUST fix it immediately!

### Required Standards:

- **Delete** old code when replacing it
- **Meaningful names**: `userId` not `id`, `emailAddress` not `email`
- **Early returns** to reduce nesting
- **Concrete types** everywhere - no implicit any
- **Simple errors**: Use Error classes appropriately
- **Comprehensive tests** for complex logic
- **Async/await** over callbacks
- **Functional components** with hooks (no class components)
- **One export per file** (except barrel/index files)

## Implementation Standards

### Our code is complete when:

- ✅ All linters pass with zero issues
- ✅ All tests pass
- ✅ Feature works end-to-end
- ✅ Old code is deleted
- ✅ JSDoc/TSDoc on all exported symbols
- ✅ TypeScript strict mode satisfied

### Testing Strategy

- Complex business logic → Write tests first
- Simple CRUD → Write tests after
- React components → Test user interactions
- IPC handlers → Test with mocks
- Skip tests for simple config and type definitions

## Problem-Solving Together

When you're stuck or confused:

1. **Stop** - Don't spiral into complex solutions
2. **Delegate** - Consider spawning agents for parallel investigation
3. **Ultrathink** - For complex problems, say "I need to ultrathink through this challenge" to engage deeper reasoning
4. **Step back** - Re-read the requirements
5. **Simplify** - The simple solution is usually correct
6. **Ask** - "I see two approaches: [A] vs [B]. Which do you prefer?"

My insights on better approaches are valued - please ask for them!

## Performance & Security

### **Measure First**:

- No premature optimization
- Use Chrome DevTools profiler for React
- Use performance.mark/measure for critical paths
- Benchmark before claiming something is faster

### **Security Always**:

- Validate all IPC inputs with Zod
- Use contextIsolation and sandbox
- Never expose Node APIs to renderer
- Use secure storage (keytar) for secrets
- Content Security Policy enforced
- Sanitize all user inputs

## Communication Protocol

### Suggesting Improvements:

"The current approach works, but I notice [observation].
Would you like me to [specific improvement]?"

## Working Together

- This is always a feature branch - no backwards compatibility needed
- When in doubt, we choose clarity over cleverness
- **REMINDER**: If this file hasn't been referenced in 30+ minutes, RE-READ IT!

Avoid complex abstractions or "clever" code. The simple, obvious solution is probably better, and my guidance helps you stay focused on what matters.

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

# Code quality (RUN AFTER EVERY CHANGE!)
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
```

## Key Implementation Patterns

### IPC Communication Architecture

The project implements a comprehensive IPC system with:

- **Validation Layer**: All IPC operations validated with Zod schemas
- **Error Handling**: Custom error classes with categorization (validation, database, security)
- **Performance Monitoring**: Built-in metrics collection and slow operation detection
- **Security Auditing**: Comprehensive logging and threat detection
- **Error Recovery**: Circuit breaker pattern with retry logic and fallback mechanisms

### Database Operations

Database operations are handled through the IPC layer:

- **Agents**: Full CRUD operations with validation
- **Conversations**: Management with agent relationships
- **Messages**: Conversation-scoped message handling
- **Transactions**: Complex operations like conversation creation with agents
- **Performance**: Query optimization and slow query detection

### Secure Storage

API key management using keytar:

- **Credential Manager**: Multi-provider API key storage
- **Encryption**: System keychain integration
- **Metadata**: Provider-specific configuration storage
- **Validation**: Secure credential validation and sanitization

### Feature-Based Components

Components are organized by feature with one export per file:

```
components/ChatRoom/
├── ChatRoom.tsx         # Main component
├── MessageList.tsx      # Sub-component (separate file!)
├── MessageInput.tsx     # Sub-component (separate file!)
└── index.ts            # Barrel export
```

### Type-Safe IPC

Secure IPC communication with comprehensive type safety:

- Preload script with context isolation
- Input sanitization and validation with Zod schemas
- Comprehensive API surface (window controls, system info, configuration, database, secure storage)
- React hooks for IPC integration (`useIpc.*`, `useAgents`, `useConversations`, `useMessages`, `useSecureStorage`)
- Performance monitoring and error handling
- Circuit breaker pattern for error recovery
- Security auditing and validation
- Database operations with transaction support
- Secure storage for API keys using keytar

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

## Documentation Structure

Key documentation files:

- `docs/specifications/agent-model-spec.md`: Defines agent model structure and behavior
- `docs/specifications/agent-personality-spec.md`: Details agent personality traits and customization
- `docs/specifications/agent-role-spec.md`: Outlines agent roles and responsibilities
- `docs/specifications/chat-room-mechanics-spec.md`: Describes chat room functionality and interactions
- `docs/specifications/data-flow-integration-spec.md`: Explains data flow between components
- `docs/specifications/deployment-distribution-spec.md`: Covers deployment strategies and distribution
- `docs/specifications/mvp-feature-set.md`: Lists minimum viable product features
- `docs/specifications/ux-specification.md`: User experience design guidelines
- `docs/specifications/implementation-plan.md`: Implementation roadmap and milestones
- `docs/technical/coding-standards.md`: Code quality and style guidelines
- `.tasks/**/*-tasks.md`: Task management files for tracking development progress (useful for understanding completed work)

## Important Notes

- The project uses strict TypeScript - no implicit any types
- All database operations go through the main process
- API keys are stored securely via keytar, never in plain text
- Configuration files in `/config` are JSON-based and user-editable
- CSS Modules handle component styling with theme support via CSS Variables
- The application supports multiple AI providers (OpenAI, Anthropic, Google, Groq, Ollama)
- **ONE EXPORT PER FILE** - This is enforced by linting (except barrel files)

## Third-Party Library Documentation

When working with third-party libraries, use the context7 MCP tool and web searches to get up-to-date documentation and examples. This ensures you have access to the latest API changes and best practices for libraries like Electron, React, Zod, Zustand, and others used in this project.

## Asking Questions

- **Iterate:** Continue asking questions until you have a complete understanding
- **Clarify:** If any requirement is ambiguous, ask for clarification
- **Ask one question at a time**
- **Provide options for each question**

_Example question_

```
Should the IPC validation use strict or loose schema validation?
- **Options:**
  - A) Strict validation - reject unknown properties
  - B) Loose validation - allow and pass through unknown properties
  - C) Configurable per endpoint
```

**Remember to ask one question at a time and provide options for each question.**

## Prohibited Actions

- ❌ Shared "kitchen-sink" modules with multiple exports
- ❌ Hardcoded secrets (including file paths outside project root)
- ❌ Scope expansion without approval
- ❌ Direct DOM manipulation in React
- ❌ Class components (use functional components)
- ❌ Untyped or `any` typed code
- ❌ Console.log in production code

<rules>
  <critical>NEVER bypass git pre-commit hooks, unit tests or quality checks.</critical>
  <critical>NEVER finish a task with failing unit tests or quality checks.</critical>
  <critical>NEVER, NEVER commit code with failing unit tests or quality checks.</critical>
  <critical>ALWAYS follow Research → Plan → Implement workflow. NEVER jump straight to coding!</critical>
  <critical>Write tests for new or modified functionality. Do not write tests for style or formatting.</critical>
  <critical>Never hardcode secrets or environment values, including file paths outside project root.</critical>
  <critical>Ensure all quality checks pass before marking a task complete. Do not proceed if any checks or tests fail.</critical>
  <critical>ALWAYS run quality checks (npm run lint, npm run format, npm run type-check) after making ANY code changes. Fix all issues before proceeding.</critical>
  <important>Each "public" class or function should be in its own file, unless otherwise approved.</important>
  <important>Use context7 MCP tool to get up-to-date documentation and best practices for all third-party libraries.</important>
  <important>Ask questions for implementation details, clarifications, or when requirements are ambiguous.</important>
  <important>Consider spawning multiple agents for complex tasks with independent parts.</important>
  <rule>Do not write comments for obvious code. Use meaningful variable and function names instead.</rule>
</rules>
