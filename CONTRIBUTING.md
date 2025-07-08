# Contributing to Fishbowl

Thank you for your interest in contributing to Fishbowl! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a code of conduct that promotes a welcoming and inclusive environment for all contributors. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Basic knowledge of Electron, React, and TypeScript

### Initial Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/fishbowl.git
   cd fishbowl
   ```
3. Install dependencies:
   ```bash
   npm install
   npm rebuild better-sqlite3
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:
- `feature/` - New features
- `bugfix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

### Commit Messages

Follow conventional commit format:
```
type(scope): description

- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting
- refactor: code refactoring
- test: testing
- chore: maintenance
```

Examples:
```
feat(agent): add personality configuration system
fix(chat): resolve message ordering issue
docs(readme): update installation instructions
```

### Development Process

1. **Before Starting**: Check existing issues and PRs to avoid duplicates
2. **Development**: 
   - Write code following our [coding standards](#coding-standards)
   - Add tests for new functionality
   - Update documentation as needed
3. **Testing**: Run all tests and ensure they pass
4. **Commit**: Make clear, atomic commits with descriptive messages

### Available Commands

```bash
# Development
npm run dev               # Start development server
npm run dev:main         # Main process only
npm run dev:renderer     # Renderer process only

# Testing
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix       # Auto-fix issues
npm run type-check     # TypeScript check

# Building
npm run build          # Production build
npm run dist           # Package application
```

## Coding Standards

### TypeScript

- Use strict mode TypeScript
- Define explicit types for all function parameters and return values
- Use interfaces for object types
- Avoid `any` type - use proper typing or `unknown`

### React

- Use functional components with hooks
- Follow the existing component structure pattern
- Use CSS Modules for styling
- Implement proper error boundaries

### File Organization

- Group related files in feature-based directories
- Use descriptive filenames
- Export components from index files
- Keep files focused and single-purpose

### CSS/Styling

- Use CSS Modules with `.module.css` extension
- Follow BEM methodology for class naming
- Use CSS variables for theming
- Maintain responsive design principles

## Pull Request Process

### Before Submitting

1. **Update Documentation**: Update relevant documentation
2. **Run Tests**: Ensure all tests pass
3. **Code Quality**: Run linting and type checking
4. **Self Review**: Review your own code for issues

### PR Requirements

- Clear, descriptive title
- Detailed description explaining the changes
- Reference related issues using keywords (fixes #123)
- Include screenshots for UI changes
- Ensure CI checks pass

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added for new functionality
```

## Issue Guidelines

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots or error logs

### Feature Requests

Include:
- Clear description of the proposed feature
- Use cases and benefits
- Possible implementation approach
- Related issues or discussions

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

## Testing

### Test Requirements

- Write unit tests for new functionality
- Update existing tests when modifying code
- Ensure all tests pass before submitting PR
- Aim for good test coverage

### Test Structure

```typescript
// Example test structure
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });
  
  it('should handle user interaction', () => {
    // Test implementation
  });
});
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report
```

## Documentation

### Documentation Standards

- Update README for significant changes
- Add JSDoc comments for complex functions
- Update API documentation for interface changes
- Include examples in documentation

### Documentation Structure

- **README.md** - Project overview and setup
- **docs/guides/** - User-facing documentation
- **docs/technical/** - Technical documentation
- **docs/specifications/** - Technical specifications

## Review Process

### Code Review

All contributions go through code review:
1. **Automated Checks**: CI/CD pipeline runs tests and quality checks
2. **Peer Review**: Other contributors review code for quality and adherence to standards
3. **Maintainer Review**: Project maintainers provide final approval

### Review Criteria

- Code quality and adherence to standards
- Test coverage and quality
- Documentation completeness
- Performance implications
- Security considerations

## Release Process

### Versioning

We follow semantic versioning (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Timeline

- Regular releases every 2-3 weeks
- Hotfix releases as needed for critical issues
- Beta releases for testing new features

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Request Comments**: Code-specific discussions

### Resources

- [Project Documentation](docs/)
- [API Reference](docs/technical/)
- [Implementation Plan](docs/specifications/implementation-plan.md)

## Recognition

Contributors are recognized through:
- GitHub contributor statistics
- Mention in release notes
- Contributor list in documentation

Thank you for contributing to Fishbowl! 🚀