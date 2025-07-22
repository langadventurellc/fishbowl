---
kind: task
id: T-set-up-mobile-app-linting-and
title: Set up mobile app linting and code quality tools
status: open
priority: low
prerequisites:
  - T-set-up-react-native-mobile-app
created: "2025-07-22T11:42:42.997308"
updated: "2025-07-22T11:42:42.997308"
schema_version: "1.1"
---

Configure ESLint, Prettier, and TypeScript checking for the mobile app, ensuring consistency with desktop app code quality standards.

**Context**: The desktop app and root project have established code quality tools and standards. The mobile app needs the same level of quality control using shared configurations where possible.

**Technical Approach**:

1. Configure ESLint with React Native specific rules
2. Set up shared ESLint configuration usage
3. Configure TypeScript strict checking
4. Set up Prettier integration
5. Configure quality check scripts

**Detailed Implementation Requirements**:

**ESLint configuration**:

- Extend @fishbowl-ai/eslint-config shared configuration
- Add React Native specific ESLint plugins and rules
- Configure ESLint for TypeScript and React Native patterns
- Set up proper file extensions and parser options

**ESLint React Native specific setup**:

```javascript
// .eslintrc.js additions for React Native
- @react-native-community/eslint-config (if needed)
- React Native specific rules for performance and best practices
- Proper configuration for Metro bundler file resolution
```

**TypeScript configuration**:

- Extend root tsconfig.json appropriately
- Configure React Native specific TypeScript settings
- Set up strict type checking consistent with desktop app
- Configure paths for shared package imports

**Prettier integration**:

- Use shared Prettier configuration from root
- Configure Prettier for React Native code formatting
- Set up editor integration recommendations

**Quality scripts**:

- Configure lint script in package.json
- Set up type-check script
- Configure format script integration
- Integrate with monorepo quality pipeline

**Integration with development workflow**:

- Configure pre-commit hooks if needed
- Set up IDE integration instructions
- Configure automated formatting on save

**Acceptance Criteria**:

- `pnpm lint` runs ESLint successfully on mobile code
- `pnpm type-check` validates TypeScript without errors
- Code formatting is consistent with project standards
- Shared ESLint config works properly with React Native code
- Integration with monorepo quality checks (`pnpm quality`)
- Development workflow provides immediate feedback on code issues
- TypeScript strict mode catches common errors
- ESLint rules help maintain React Native best practices
- `*.tsx` files should correctly report linting warnings if `import React from "react";` is unused. This is currently a problem in `Settings.tsx` and `Dashboard.tsx`.

**Dependencies**: Requires T-set-up-react-native-mobile-app to be completed

**Security Considerations**: Ensure linting rules help catch potential security issues (no-eval, etc.)

**Testing Requirements**: Verify all quality tools run without errors and catch common code issues

### Log
