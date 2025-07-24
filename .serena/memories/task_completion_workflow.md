# Task Completion Workflow

## After Every Code Change - MANDATORY

1. **Run Quality Checks**:

   ```bash
   pnpm quality  # Linting, formatting, type checks
   pnpm test     # Unit tests
   ```

2. **Fix All Issues**: Address any linting, formatting, or type errors immediately

## Testing Strategy

- **Unit Tests**: Jest for business logic in `packages/shared`
- **E2E Tests**: Playwright for desktop, Detox for mobile
- **Component Tests**: In platform-specific apps
- **Cross-platform**: Use dev container for consistent testing

## Before Committing

1. Ensure all quality checks pass
2. Run relevant E2E tests if UI changes were made
3. Verify build succeeds with `pnpm build`
4. Check database migrations if schema changed: `pnpm db:migrate`

## Development Guidelines

- **Never run `dev` or `start` commands** - These lock up processes
- **Use specific commands** like `pnpm dev:desktop` or `pnpm dev:mobile`
- **Verify changes** with Playwright or E2E tests instead of running dev servers
- **Clean when needed**: `pnpm clean` if build issues occur

## Error Resolution

- **Build errors**: Run `pnpm clean` then rebuild
- **Type errors**: Fix immediately, never ignore
- **Lint errors**: Auto-fix with `pnpm format` when possible
- **Test failures**: Debug and fix before proceeding
