# Instructions for working in the Fishbowl Monorepo

A desktop and mobile application for creating conversations with multiple AI agents simultaneously. Configure agents with unique personalities, roles, and AI models to enable dynamic brainstorming, problem-solving, and creative exploration.

## Development

See [Architecture Guide](docs/architecture/monorepo.md) for the overall structure and guidelines.

### Quality checks

**IMPORTANT** Run the following commands to ensure code quality after every change. Fix all issues as soon as possible.

- `pnpm quality` - Run linting, formatting, and type checks
- `pnpm test` - Run unit tests to ensure functionality

**CRITICAL** When modifying shared package types or interfaces:

- `pnpm build:libs` - **MUST** rebuild shared packages after adding new types/interfaces
- Apps cannot import from `@fishbowl-ai/shared` until the shared package is built
- Type errors like "Module has no exported member" indicate shared package needs rebuilding

### Commands

#### Development

Don't run the `dev` or `start` commands because you lock up processes doing that. If you need those to be tested let me know and I'll do it and share the results with you. Otherwise execute other ways of verifying such as with playwright or with end-to-end tests.

| Command             | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `pnpm dev:desktop`  | Start development server for desktop app only (do not run) |
| `pnpm dev:mobile`   | Start development server for mobile app only (do not run)  |
| `pnpm start:mobile` | Start Expo development server for mobile app (do not run)  |

#### Building

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

For full architecture details, see: [Monorepo Architecture](docs/architecture/monorepo.md)

---

## Clean‑Code Charter

> **Purpose** Guide large‑language‑model (LLM) coding agents toward the simplest **working** solution, written in the style of seasoned engineers (Kent Beck, Robert Martin, et al.).
> The charter is language‑agnostic but assumes most code is authored in **Python**.

### 1 Guiding Maxims (agents must echo these before coding)

| Maxim                                  | Practical test                                                      |
| -------------------------------------- | ------------------------------------------------------------------- |
| **KISS** - _Keep It Super Simple_      | Could a junior dev explain the design to a peer in ≤ 2 min?         |
| **YAGNI** - _You Aren't Gonna Need It_ | Is the abstraction used < 3 times? If so, inline it.                |
| **SRP / small units**                  | One concept per function; ≤ 20 logical LOC; cyclomatic ≤ 5.         |
| **DRY** - _Don't Repeat Yourself_      | Is the code repeated in ≥ 2 places? If so, extract it.              |
| **Simplicity**                         | Is the code simpler than the alternative? If not, refactor it.      |
| **Explicit is better than implicit**   | Is the code self‑documenting? If not, add comments.                 |
| **Fail fast**                          | Does the code handle errors gracefully? If not, add error handling. |

### 2 Architecture Heuristics

#### 2.1 File‑ & package‑level

- **≤ 400 LOC per file** (logical lines).
- No **"util" or "helpers" dumping grounds** - every module owns a domain noun/verb.
- **Naming convention:**
  - **tsx** files: PascalCasing - `ComponentName.tsx`
  - **ts** files: camelCasing - `moduleName.ts`
  - **css** files: camelCasing - `moduleName.css`
  - Do not use `kebab-casing` for TypeScript files.

#### 2.2 Module decomposition & dependency rules _(new)_

1. **Domain‑oriented modules.** Each module encapsulates **one** coherent business concept (noun) or service (verb).
2. **Explicit public surface.** Export `index.ts` only what callers need; everything else is private.
3. **Acyclic dependency graph.** Imports must not form cycles; prefer dependency‑inversion interfaces to break loops.
4. **Shallow import depth ≤ 3.** Deep chains signal hidden coupling.
5. **Rule of three for new layers.** Add a new package level only after three modules share the same concern.
6. **Composition over inheritance** unless ≥ 2 concrete subclasses are already required.
7. **Ports & Adapters pattern** for I/O: keep domain logic free of external frameworks (DB, HTTP, UI).
8. **Naming convention:** _package/module = noun_, _class = noun_, _function = verb + noun_.

### 3 Testing Policy

- **Goldilocks rule.** Exactly **one** happy‑path unit test per public function _unless_ complexity > 5.
- **Integration tests only at seams.** Use fakes/mocks internally.
- **Performance tests gated.** Only generate when the target class/function bears a `@PerfTest` decorator.

### 4 Agent Self‑Review Checklist (before emitting code)

1. Could this be **one function simpler**?
2. Did I introduce an abstraction used **only once**?
3. Did I write a performance test for a function or class without a `@PerfTest` decorator?
4. Can a junior dev grok each file in **< 5 min**?

### 5. Forbidden

- **NO any types** - Use specific, concrete types always
- **NO console.log in production code** - Use proper logging
- **NO keeping old and new code together** - Delete replaced code immediately
- **NO shared "kitchen-sink" modules** - One export per file!
- **NO hardcoded secrets or environment values**
- **NO direct DOM manipulation in React** - Use React patterns

---

## 🤔 When You're Unsure

1. **Stop** and ask a clear, single question.
2. Offer options (A / B / C) if helpful.
3. Wait for user guidance before proceeding.

## Troubleshooting

If you encounter issues:

- Use the debugging subagent
- Check the documentation in `docs/`
- Use the context7 MCP tool for up-to-date library documentation
- Use web for research (the current year is 2025)
- If you need clarification, ask specific questions with options
