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

### Logging

Use the `logger` utility from `@fishbowl-ai/shared` for consistent logging across the application. See `packages/shared/src/logging/README.md` for usage details.

### Quality checks

**IMPORTANT** Run the following commands to ensure code quality after every change. Fix all issues as soon as possible.

- `pnpm quality` - Run linting, formatting, and type checks
- `pnpm test` - Run unit tests to ensure functionality (use format `pnpm test <args>`, not `pnpm <args> test`)

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

| Command                          | Description                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm test`                      | Run tests for all packages (use format `pnpm test <args>`, not `pnpm <args> test`) |
| `pnpm test:e2e:desktop`          | Run end-to-end tests for desktop app                                               |
| `pnpm test:e2e:desktop:headless` | Run E2E tests in headless mode                                                     |
| `pnpm test:e2e:mobile`           | Run mobile E2E tests                                                               |
| `pnpm lint`                      | Run linting for all packages                                                       |
| `pnpm format`                    | Format all TypeScript, JavaScript, and Markdown files                              |
| `pnpm type-check`                | Run TypeScript type checks for all packages                                        |
| `pnpm quality`                   | Run all quality checks (lint, format, type-check)                                  |

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

### 5. Platform Abstraction Pattern

For platform-specific functionality, use the established abstraction pattern. This ensures clean separation between business logic and platform-specific implementations.

#### Platform Architecture

The monorepo supports **three distinct execution environments:**

1. **Desktop Main Process** (Node.js) - File system, native APIs, Electron main
2. **Desktop Renderer Process** (Browser) - Web APIs only, Electron renderer
3. **Mobile** (React Native/Expo) - Mobile-specific APIs and storage

Each environment requires different platform implementations due to different available APIs.

#### Pattern Overview

1. **Define Interfaces in Shared Package** (`packages/shared/src/services/`)
2. **Implement in Platform Apps** (`apps/desktop/src/main/`, `apps/desktop/src/renderer/`, `apps/mobile/src/`)
3. **Inject via Dependency Injection** (constructor injection)
4. **Keep All Business Logic in Shared** (no platform-specific code in shared)

#### Step-by-Step Implementation

**1. Define Interface in Shared Package**

```typescript
// packages/shared/src/services/storage/MyServiceBridge.ts
export interface MyServiceBridge {
  doSomething(param: string): Promise<Result>;
}
```

**2. Implement in Each Platform Folder**

```typescript
// apps/desktop/src/main/utils/NodeMyService.ts (Main Process)
import { MyServiceBridge } from "@fishbowl-ai/shared";

export class NodeMyService implements MyServiceBridge {
  async doSomething(param: string): Promise<Result> {
    // Node.js/Electron main process implementation
    // Uses fs, path, native APIs
  }
}

// apps/desktop/src/renderer/utils/BrowserMyService.ts (Renderer Process)
import { MyServiceBridge } from "@fishbowl-ai/shared";

export class BrowserMyService implements MyServiceBridge {
  async doSomething(param: string): Promise<Result> {
    // Browser/Web APIs implementation
    // Uses Web Crypto, localStorage, etc.
  }
}

// apps/mobile/src/utils/ExpoMyService.ts (Mobile)
import { MyServiceBridge } from "@fishbowl-ai/shared";

export class ExpoMyService implements MyServiceBridge {
  async doSomething(param: string): Promise<Result> {
    // React Native/Expo-specific implementation
  }
}
```

**3. Use in Shared Services via Dependency Injection**

```typescript
// packages/shared/src/services/MyBusinessService.ts
export class MyBusinessService {
  constructor(private bridge: MyServiceBridge) {}

  async performBusinessLogic(input: Input): Promise<Output> {
    // All business logic here - no platform-specific code
    const result = await this.bridge.doSomething(input.value);
    return this.processResult(result);
  }
}
```

**4. Wire Up in Platform Services**

```typescript
// apps/desktop/src/main/services/MainProcessServices.ts (Node.js)
export class MainProcessServices {
  readonly myService: MyBusinessService;

  constructor() {
    const bridge = new NodeMyService();
    this.myService = new MyBusinessService(bridge);
  }
}

// apps/desktop/src/renderer/services/RendererProcessServices.ts (Browser)
export class RendererProcessServices {
  readonly myService: MyBusinessService;

  constructor() {
    const bridge = new BrowserMyService();
    this.myService = new MyBusinessService(bridge);
  }
}

// apps/mobile/src/services/MobileServices.ts (React Native/Expo)
export class MobileServices {
  readonly myService: MyBusinessService;

  constructor() {
    const bridge = new ExpoMyService();
    this.myService = new MyBusinessService(bridge);
  }
}
```

#### Existing Bridge Examples

- **File System**: `FileSystemBridge` → `NodeFileSystemBridge` (main process only)
- **Secure Storage**: `SecureStorageInterface` → `LlmSecureStorage`/`TestSecureStorage` (main process only)
- **Crypto Utils**: `CryptoUtilsInterface` → `NodeCryptoUtils` (main) / `BrowserCryptoUtils` (renderer)
- **Device Info**: Platform detection → `NodeDeviceInfo` (main) / `BrowserDeviceInfo` (renderer)

**Note**: Some services like file system and secure storage are only available in the main process due to security restrictions in the renderer process.

#### Platform-Specific Service Instantiation

Each platform naturally uses its own implementation:

```typescript
// Main Process - uses Node.js implementations
export class MainProcessServices {
  constructor() {
    this.cryptoUtils = new NodeCryptoUtils();
    this.deviceInfo = new NodeDeviceInfo();
    this.fileSystemBridge = new NodeFileSystemBridge();
  }
}

// Renderer Process - uses Browser implementations
export class RendererProcessServices {
  constructor() {
    this.cryptoUtils = new BrowserCryptoUtils();
    this.deviceInfo = new BrowserDeviceInfo();
    // No file system bridge - not available in renderer
  }
}
```

#### Best Practices

- ✅ **All business logic in shared package**
- ✅ **Platform-specific APIs abstracted via interfaces**
- ✅ **Dependency injection for testability**
- ✅ **Implementations in platform folders** (not in shared)
- ✅ **Error handling at implementation level** (convert platform errors to shared types)
- ❌ **No platform imports in shared package**
- ❌ **No conditional platform code in business logic**

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

## Personality

Role: Rigorous, cooperative thought-partner

Core Directives:

1. Truthfulness and evidence > usefulness > agreement
2. Never accept premises at face value - validate first
3. Prefer "I don't know" over speculation
4. Challenge flawed assumptions before answering

Response Process (internal):

1. Extract user's assumptions (≤3)
2. Evaluate each for validity
3. Identify strongest counterargument
4. Decide challenge strategy
5. Construct balanced response

Output Format:

- Assumptions identified
- Challenges/clarifications (0-2, tied to user's goal)
- Answer with evidence
- Confidence score (0-1) with rationale
- Alternative perspective (2-3 sentences)

Style: Direct, neutral, no flattery
