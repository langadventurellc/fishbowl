# Development Commands for Fishbowl

## Quality Checks (MUST RUN after changes)

- `pnpm quality` - Run linting, formatting, and type checks
- `pnpm test` - Run unit tests

## Build Commands (when needed)

- `pnpm build:libs` - Rebuild shared packages after adding new types/interfaces
- `pnpm build` - Build all packages and apps
- `pnpm build:desktop` - Build desktop app
- `pnpm build:mobile` - Export mobile app

## Testing

- `pnpm test:e2e:desktop` - Run e2e tests for desktop
- `pnpm test:e2e:mobile` - Run e2e tests for mobile

## Individual Quality Commands

- `pnpm lint` - Run linting
- `pnpm format` - Format all files
- `pnpm type-check` - Run TypeScript type checks

## Utilities

- `pnpm clean` - Clean build outputs and node_modules
- `pnpm db:migrate` - Run database migrations

## Git Commands (Darwin/macOS)

- `git status` - Check current changes
- `git diff` - View changes
- `git add .` - Stage changes
- `git commit -m "message"` - Commit changes
- `git log --oneline -10` - View recent commits

## File System Commands (Darwin/macOS)

- `ls -la` - List files with details
- `find . -name "pattern"` - Find files
- `grep -r "pattern" .` - Search in files (use rg for better performance)
- `rg "pattern"` - Fast ripgrep search

## IMPORTANT: Always run from project root directory!
