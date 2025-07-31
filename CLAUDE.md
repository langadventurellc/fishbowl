# Instructions for working in the Fishbowl Monorepo

A desktop and mobile application for creating conversations with multiple AI agents simultaneously. Configure agents with unique personalities, roles, and AI models to enable dynamic brainstorming, problem-solving, and creative exploration.

## Repository Structure

**Applications:**

- `apps/desktop/` - Electron desktop application with React UI
- `apps/mobile/` - React Native mobile application with Expo

**Shared Code:**

- `packages/shared/` - Business logic, state management, types, and utilities shared between platforms
- `packages/ui-shared/` - UI types, component props, hooks, and utilities shared between desktop and mobile
- `packages/eslint-config/` - Shared ESLint configuration
- `packages/ui-theme/` - Shared theme and styling utilities

**Development & Documentation:**

- `docs/` - Architecture guides, specifications, and documentation
- `tests/` - End-to-end testing suites for desktop and mobile
- `migrations/` - Database migration scripts
- `planning/` - Project planning and task management using Trellis MCP

## Development

See [Architecture Guide](docs/architecture/monorepo.md) for the overall structure and guidelines.

### Quality checks

**IMPORTANT** Run the following commands to ensure code quality after every change. Fix all issues as soon as possible.

- `pnpm quality` - Run linting, formatting, and type checks
- `pnpm test` - Run unit tests to ensure functionality

Our quality checks will not allow files that have multiple exported types such as functions or classes in a single file. And if you do that, you will have to separate them into their own files. It's much easier if you create separate files to begin with. And where it makes sense, put them in their own folder with a barrel file.

**CRITICAL** When modifying shared package types or interfaces:

- `pnpm build:libs` - **MUST** rebuild shared packages after adding new types/interfaces
- Apps cannot import from `@fishbowl-ai/shared` or `@fishbowl-ai/ui-shared` until the shared package is built
- Type errors like "Module has no exported member" indicate shared package needs rebuilding

### Commands

All of these commands are commands available in the project root. The most effective way to execute these commands is to ensure that you are executing them from the context of the project root. Since this is a monorepo, it is very common to find yourself in another folder. And attempting to execute these commands from another folder will result in failure, which will often confuse you. If you always execute these commands from the context of the project root, then you won't have that problem.

If you see `Command "quality" not found` or similar errors, it means you are not in the project root directory. Always run commands from the root of the monorepo.

#### Development

Don't run the `dev` or `start` commands because you lock up processes doing that. If you need those to be tested let me know and I'll do it and share the results with you. Otherwise execute other ways of verifying such as with playwright or with end-to-end tests.

| Command             | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `pnpm dev:desktop`  | Start development server for desktop app only (do not run) |
| `pnpm dev:mobile`   | Start development server for mobile app only (do not run)  |
| `pnpm start:mobile` | Start Expo development server for mobile app (do not run)  |

#### Building

<important>
**DO NOT** build the applications unless specifically requested by the user.
</important>

| Command                         | Description                                       |
| ------------------------------- | ------------------------------------------------- |
| `pnpm build`                    | Build all packages and apps                       |
| `pnpm build:desktop`            | Build desktop app and dependencies                |
| `pnpm build:mobile`             | Export mobile app for production                  |
| `pnpm prebuild:mobile`          | Generate native iOS/Android projects              |
| `pnpm build:mobile:development` | Build development version (internal distribution) |
| `pnpm build:mobile:preview`     | Build preview version (internal testing)          |
| `pnpm build:mobile:production`  | Build production version (app store ready)        |

#### Testing & Quality

| Command                          | Description                                           |
| -------------------------------- | ----------------------------------------------------- |
| `pnpm test`                      | Run tests for all packages                            |
| `pnpm test:e2e:desktop`          | Run end-to-end tests for desktop app                  |
| `pnpm test:e2e:desktop:headless` | Run E2E tests in headless mode                        |
| `pnpm test:e2e:mobile`           | Run mobile E2E tests                                  |
| `pnpm lint`                      | Run linting for all packages                          |
| `pnpm format`                    | Format all TypeScript, JavaScript, and Markdown files |
| `pnpm type-check`                | Run TypeScript type checks for all packages           |
| `pnpm quality`                   | Run all quality checks (lint, format, type-check)     |

#### Utilities

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `pnpm clean`      | Clean all build outputs and node_modules |
| `pnpm db:migrate` | Run database migrations for all apps     |

## Architecture

How to structure code across shared packages and platform-specific applications. It is designed to ensure clean separations of concerns, maintainability, and reusability of code. The monorepo contains a desktop (Electron) project with shared logic in a common package. A mobile platform may be added in the future.

### Technology Stack

#### Shared

- **Package Manager**: pnpm (10.0+)
- **Shared Logic**: TypeScript (5.8+), Zustand (5.0+)
- **Unit Testing**: Jest (30.0+)
- **Validation**: Zod (4.0+)

#### Desktop

- **Desktop**: Electron (37.2+) with React (19.1+)
- **BDD Testing**: Playwright (1.54+) with Jest (E2E tests)
- **Database**: SQLite with Electron SQLite integration
- **Styling**: Tailwind and shadcn/ui

#### Mobile

- **Mobile**: React Native with Expo (React Native 0.80+, Expo SDK 53.0+)
- **BDD Testing**: Detox (20.40+) with Jest (E2E tests)
- **Database**: SQLite with Expo SQLite integration
- **Styling**: NativeWind (4.1+) and Tamagui (1.132+)

### 1. Code Placement Rules

- **Shared Package (`@fishbowl-ai/shared`)**: Business logic, API clients, hooks, stores, types, utils
- **Platform Apps**: ONLY UI components and platform-specific code
- **No UI in shared packages**: React Native and web React components are incompatible

### 2. What Can Be Shared

✅ **CAN Share:**

- Business logic and algorithms
- API clients and network code
- State management (Zustand stores)
- Custom hooks (logic only)
- TypeScript types/interfaces
- Utility functions
- Constants and configuration

❌ **CANNOT Share:**

- UI components (different rendering systems)
- Styles (platform-specific styling systems)
- Navigation (platform-specific routing)
- Platform-specific APIs

### 4. Import Rules

- Always use workspace protocol: `"@fishbowl-ai/shared": "workspace:*"`
- Import from package names, not relative paths across packages
- Use barrel exports in shared packages

### 5. Platform Bridges

For platform-specific features, use the bridge pattern:

```typescript
// In shared package - define interface
export interface StorageBridge {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
}

// In platform apps - implement
// Desktop: uses Electron secure storage
// Mobile: uses Expo SecureStore
```

### 7. Testing Strategy

- **Shared package**: Unit tests for business logic (Jest)
- **Platform apps**: Component/integration tests
- **E2E Testing**: WebdriverIO in Linux dev container
- **Cross-platform**: Use dev container for consistent testing environment
- Keep platform-specific test utilities separate

### 8. Environment Variables

- Desktop: Use Vite env vars (`VITE_API_URL`)
- Mobile: Use Expo env vars (`EXPO_PUBLIC_API_URL`)
- Abstract in shared config module

## Quick Reference for AI Agents

When adding features:

Use the implementation planner subagent to plan the implementation of new features.

1. **Business logic** → `packages/shared/src/`
2. **Desktop UI** → `apps/desktop/src/`
3. **Mobile UI** → `apps/mobile/src/`
4. **Shared types** → `packages/shared/src/types/`
5. **API calls** → `packages/shared/src/api/`

Never put UI components in shared packages. Always keep platform-specific code in the respective app directories.

When working with shadcn/ui components, always use `shadcn-ui` MCP tools to get the latest updates and best practices.

---

# Clean‑Code Charter

**Purpose** Steer LLM coding agents toward the **simplest working solution**, in the spirit of Kent Beck & Robert C. Martin.

## 1  Guiding Maxims – echo before coding

| Maxim                   | Practical test                         |
| ----------------------- | -------------------------------------- |
| **KISS**                | Junior dev explains in ≤ 2 min         |
| **YAGNI**               | Abstraction < 3 uses? Inline           |
| **SRP**                 | One concept/function; ≤ 20 LOC; CC ≤ 5 |
| **DRY**                 | Duplication? Extract                   |
| **Simplicity**          | Choose the simpler path                |
| **Explicit > Implicit** | Self‑documenting, or add comments      |
| **Fail fast**           | Clear, early error handling            |

## 2  Architecture

### Files / Packages

- ≤ 400 logical LOC
- No “util” dumping grounds
- Naming:
  - `ComponentName.tsx` (PascalCase)
  - `moduleName.ts` / `moduleName.css` (camelCase)

### Modules & Dependencies

1. Each module owns **one** domain concept.
2. Export only what callers need (`index.ts`).
3. No import cycles – break with interfaces.
4. Import depth ≤ 3.
5. Prefer composition; inherit only if ≥ 2 real subclasses.
6. Keep domain pure; use **Ports & Adapters** for I/O.
7. Names: packages/modules = nouns; functions = verb + noun.

## 3  Testing

- **One** happy‑path unit test per public function (unless CC > 5).
- Integration tests only at service seams; mock internals.

## 4  Self‑Review Checklist

1. Could this be one function simpler?

## 5  Forbidden

- `any` types
- `console.log` in production
- Dead code kept around
- Shared “kitchen‑sink” modules
- Hard‑coded secrets or env values
- Direct DOM manipulation in React

---

## 🤔 When You're Unsure

1. **Stop** and ask a clear, single question.
2. Offer options (A / B / C) if helpful.
3. Wait for user guidance before proceeding.

## Troubleshooting

If you encounter issues:

- Check the documentation in `docs/`
- Use the context7 MCP tool for up-to-date library documentation
- Use web for research (the current year is 2025)
- If you need clarification, ask specific questions with options
