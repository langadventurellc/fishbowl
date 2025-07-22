# General Development Process

## Initial Setup

1. Create initial folder structure
   1. `README.md`
   2. Claude
      1. `CLAUDE.md`
      2. General hooks
      3. MCPs
      4. Commands
   3. Docs
   4. git hooks
2. Create shell - see [docs/architecture/monorepo.md](docs/architecture/monorepo.md)
   1. Package manager
   2. Build, quality & testing setup
      1. Attach to hooks
   3. Smoke testing (verifying final artifact)
   4. CI/CD
   5. Update `README.md` and `CLAUDE.md`
3. Architecture skeleton
   1. Design modules and interactions
   2. Create application folder structure
      1. Monorepo design to force clean separations
4. Create Electron UI skeleton
   1. As close to raw HTML/CSS as possible
   2. No implementation except to view other screens
5. Implement Electron app (see development process below)

## Development Process

Iterative feature development - Using Task Trellis MCP Server

1. Project
   1. Project specs and architectural documentation
   2. Determine target `-ilities` for the project
2. Epic
   1. First feature - Specs and architecture documentation
      1. Link documentation to all other features
3. Feature
   1. First task - Acceptance tests (BDD)
      1. Link tests to all other tasks with instructions on which tasks are responsible for which tests
4. Task

## Future

1. Create mobile version
