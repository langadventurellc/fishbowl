---
kind: task
id: T-initialize-monorepo-with
status: done
title: Initialize monorepo with TurboRepo and basic project structure
priority: high
prerequisites: []
created: "2025-07-21T17:32:28.717806"
updated: "2025-07-21T17:39:59.519800"
schema_version: "1.1"
worktree: null
---

# Initialize Fishbowl Monorepo with TurboRepo

## Context

Initialize the fishbowl repository as a monorepo using TurboRepo following the architecture specified in `/Users/zach/code/fishbowl/docs/architecture/monorepo.md`. This is the foundational setup task that creates the complete directory structure, configuration files, and basic scaffolding without implementing actual application features.

## Detailed Implementation Requirements

### 1. Install Core Dependencies

- Install additional root dev dependencies: `typescript @types/node prettier eslint`
- Update package.json with proper scripts and configuration

### 2. Create Root Configuration Files

#### package.json Updates

- Add all turbo scripts from the architecture document
- Configure engines for Node >=22.0.0 and pnpm >=10.0.0
- Set up package manager field
- Add workspace protocol configurations

#### turbo.json

- Create complete turbo.json with pipeline configuration
- Include all build, dev, test, lint, and e2e pipeline definitions
- Configure proper dependencies and caching strategies
- Set up global dependencies for env files

#### pnpm-workspace.yaml

- Configure workspace packages for apps/_, packages/_, tests/\*

### 3. Create Complete Directory Structure

Create the full directory tree as specified in the architecture document:

```
apps/
├── desktop/                 # Tauri desktop app scaffold
│   ├── src/
│   │   ├── __tests__/
│   │   ├── App.tsx (basic scaffold)
│   │   ├── main.tsx (basic scaffold)
│   │   └── pages/
│   ├── src-tauri/
│   │   ├── src/
│   │   └── Cargo.toml
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── mobile/                  # React Native app scaffold
    ├── android/
    ├── ios/
    ├── src/
    │   ├── __tests__/
    │   ├── App.tsx (basic scaffold)
    │   └── screens/
    ├── index.js
    ├── metro.config.js
    ├── package.json
    └── tsconfig.json

packages/
├── shared/                  # Shared business logic
│   ├── src/
│   │   ├── api/
│   │   │   └── __tests__/
│   │   ├── db/
│   │   │   └── __tests__/
│   │   ├── hooks/
│   │   │   └── __tests__/
│   │   ├── services/
│   │   │   └── __tests__/
│   │   ├── store/
│   │   │   └── __tests__/
│   │   ├── types/
│   │   │   └── __tests__/
│   │   └── utils/
│   │       └── __tests__/
│   ├── package.json
│   └── tsconfig.json
│
├── ui-theme/               # Shared design tokens
│   ├── src/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   └── package.json
│
└── eslint-config/          # Shared ESLint config
    ├── index.js
    └── package.json

tests/                      # End-to-end tests
├── desktop/               # WebdriverIO tests
│   ├── features/
│   ├── support/
│   └── wdio.conf.ts
│
└── mobile/                # Detox tests
    ├── features/
    ├── support/
    └── detox.config.js

migrations/                 # Directory for future SQL migrations
└── README.md              # Explains migration structure for future use
```

### 4. Create Basic Package.json Files

Create package.json for each workspace with:

- Correct naming following @fishbowl-ai/\* pattern
- Workspace dependencies using `workspace:*` protocol
- Proper scripts for each platform
- TypeScript and testing configurations

### 5. Create Basic Configuration Files

- TypeScript configs for each workspace
- Basic Vite config for desktop
- Basic Metro config for mobile
- ESLint configuration package
- Empty migrations directory with README explaining future use

### 6. Create Basic Scaffold Files

- Minimal App.tsx for both platforms (just "Hello World" level)
- Basic index files
- Empty test directories with README files
- Gitignore updates for new structure

## Acceptance Criteria

### Functional Requirements

- [ ] Root package.json has all turbo scripts and proper configuration
- [ ] turbo.json is properly configured with all pipelines
- [ ] pnpm-workspace.yaml includes all workspace packages
- [ ] Complete directory structure matches architecture document exactly
- [ ] All workspace package.json files have correct naming and dependencies
- [ ] Basic TypeScript configurations are in place
- [ ] `pnpm install` runs successfully from root
- [ ] `pnpm turbo lint` runs without errors (even if no-op)
- [ ] `pnpm turbo build` attempts to run (may fail due to missing deps, but should find the commands)

### Technical Requirements

- [ ] All workspace dependencies use `workspace:*` protocol
- [ ] Package names follow @fishbowl-ai/\* convention
- [ ] TypeScript strict mode enabled in all configs
- [ ] Proper engines restrictions in package.json
- [ ] Basic .gitignore patterns for each platform

### Documentation Requirements

- [ ] README files in empty directories explaining their purpose
- [ ] Basic comments in configuration files
- [ ] migrations/README.md explains migration structure for future implementation

## Dependencies

None - this is the foundational setup task

## Security Considerations

- Ensure no sensitive data is committed
- Use proper .gitignore patterns
- Follow workspace protocol security best practices

## Testing Requirements

- Verify `pnpm install` works from root
- Verify basic turbo commands recognize all workspaces
- Test that TypeScript compilation finds all packages
- Ensure no circular dependencies between packages

## Implementation Notes

- Create minimal but functional scaffold files
- Focus on structure and configuration, not feature implementation
- Ensure all paths and imports use workspace protocol
- Follow exact directory structure from architecture document
- Add placeholder content where files need to exist but features aren't implemented yet

### Log

**2025-07-21T22:52:36.222407Z** - Successfully initialized fishbowl monorepo with TurboRepo and complete project structure. Created full directory tree with apps (desktop/mobile), packages (shared/ui-theme/eslint-config), tests, and migrations directories. Configured all workspace packages with proper @fishbowl-ai/\* naming, workspace dependencies, and TypeScript. Setup verified with pnpm discovering all 5 workspaces and turbo recognizing complete dependency graph.

- filesChanged: ["package.json", "pnpm-workspace.yaml", "turbo.json", "tsconfig.json", "apps/desktop/package.json", "apps/desktop/tsconfig.json", "apps/desktop/index.html", "apps/desktop/src/App.tsx", "apps/desktop/src/main.tsx", "apps/mobile/package.json", "apps/mobile/tsconfig.json", "apps/mobile/index.js", "apps/mobile/src/App.tsx", "packages/shared/package.json", "packages/shared/tsconfig.json", "packages/shared/src/index.ts", "packages/ui-theme/package.json", "packages/ui-theme/tsconfig.json", "packages/ui-theme/src/index.ts", "packages/ui-theme/src/colors.ts", "packages/ui-theme/src/spacing.ts", "packages/ui-theme/src/typography.ts", "packages/eslint-config/package.json", "packages/eslint-config/index.js", "migrations/README.md", "tests/desktop/README.md", "tests/mobile/README.md"]
