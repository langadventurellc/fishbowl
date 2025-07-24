# Essential Development Commands

## Quality Assurance (Run After Every Change)

```bash
pnpm quality        # Run linting, formatting, and type checks
pnpm test           # Run unit tests to ensure functionality
```

## Building

```bash
pnpm build          # Build all packages and apps
pnpm build:desktop  # Build desktop app and dependencies
pnpm build:mobile   # Export mobile app for production
pnpm prebuild:mobile # Generate native iOS/Android projects
```

## Testing

```bash
pnpm test                      # Run all unit tests
pnpm test:e2e:desktop          # Run desktop E2E tests
pnpm test:e2e:desktop:headless # Run desktop E2E tests headless
pnpm test:e2e:mobile           # Run mobile E2E tests
```

## Code Quality

```bash
pnpm lint           # Run ESLint for all packages
pnpm format         # Format with Prettier
pnpm type-check     # Run TypeScript type checking
```

## Utilities

```bash
pnpm clean          # Clean build outputs and node_modules
pnpm db:migrate     # Run database migrations
```

## System Commands (macOS/Darwin)

```bash
ls                  # List directory contents
find                # Search for files
grep                # Search within files
git                 # Version control operations
```
