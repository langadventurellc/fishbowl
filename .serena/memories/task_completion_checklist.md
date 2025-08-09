# Task Completion Checklist

When completing any coding task in the Fishbowl project, follow these steps:

## 1. Code Quality Checks (MANDATORY)

Run these commands from the project root:

```bash
pnpm quality  # Runs lint, format, and type-check
pnpm test     # Runs unit tests
```

## 2. Shared Package Considerations

If you modified types or interfaces in shared packages:

```bash
pnpm build:libs  # Rebuild shared packages
```

## 3. File Organization Rules

- Separate exported types/functions/classes into their own files
- Use barrel files (index.ts) where appropriate
- Keep files under 400 LOC
- Follow one concept per file principle

## 4. Before Committing

- Fix all linting errors
- Fix all TypeScript errors
- Ensure all tests pass
- No console.log statements in production code
- No hardcoded secrets or API keys

## 5. Architecture Compliance

- Business logic → packages/shared/src/
- Desktop UI → apps/desktop/src/
- Mobile UI → apps/mobile/src/
- Shared types → packages/shared/src/types/
- API calls → packages/shared/src/api/

## Common Issues to Avoid

- Multiple exports in single file (quality checks will fail)
- UI components in shared packages
- Missing type exports after modification
- Running commands from wrong directory
