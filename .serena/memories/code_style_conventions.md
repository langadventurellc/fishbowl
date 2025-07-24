# Code Style and Conventions

## TypeScript Configuration

- **Target**: ES2022
- **Module**: ESNext with bundler resolution
- **Strict mode**: Enabled with `noUncheckedIndexedAccess`
- **Isolated modules**: Required for build performance
- **Declaration files**: Generated with source maps

## ESLint Rules

- **Base**: @eslint/js recommended + TypeScript ESLint
- **Key Rules**:
  - `@typescript-eslint/no-unused-vars`: error
  - `@typescript-eslint/no-explicit-any`: error
  - `turbo/no-undeclared-env-vars`: error
- **File Extensions**: `.ts`, `.tsx`, `.js`, `.mjs`, `.cjs`

## Code Organization

- **Import Rules**: Use workspace protocol (`workspace:*`) for internal packages
- **Barrel Exports**: Use `index.ts` files for clean public interfaces
- **No Cross-Package Relative Imports**: Always import via package names
- **Platform Bridges**: Use interface pattern for platform-specific features

## Naming Conventions

- **Packages**: kebab-case with `@fishbowl-ai/` scope
- **Files**: kebab-case for utilities, PascalCase for components
- **Variables/Functions**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: SCREAMING_SNAKE_CASE

## Forbidden Patterns

- **NO any types** - Use specific, concrete types
- **NO console.log in production** - Use proper logging
- **NO keeping old/new code together** - Delete replaced code immediately
- **NO shared "kitchen-sink" modules** - One export per file
- **NO hardcoded secrets** - Use environment variables
- **NO direct DOM manipulation in React** - Use React patterns
