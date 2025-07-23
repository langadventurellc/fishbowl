---
kind: task
id: T-configure-turbo-and-root-package
status: done
title: Configure Turbo and root package.json scripts for mobile development
priority: high
prerequisites:
  - T-set-up-react-native-mobile-app
created: "2025-07-22T11:41:06.244538"
updated: "2025-07-22T12:04:24.643224"
schema_version: "1.1"
worktree: null
---

Update the monorepo configuration to support mobile app development commands and build processes.

**Context**: The root package.json and turbo.json currently only support desktop development. Mobile development requires additional scripts and Turbo pipeline configuration for parallel development and building.

**Technical Approach**:

1. Update turbo.json pipeline to include mobile-specific tasks
2. Add mobile development scripts to root package.json
3. Configure Turbo filters for mobile app building and testing
4. Ensure mobile app integrates with existing quality checks

**Detailed Implementation Requirements**:

**Root package.json updates**:

- Add `"dev:mobile": "turbo run dev --filter=@fishbowl-ai/mobile"`
- Add `"build:mobile": "turbo run build --filter=@fishbowl-ai/mobile"`
- Add `"test:e2e:mobile": "turbo run test:e2e --filter=@fishbowl-ai/mobile"`
- Update existing scripts to include mobile where appropriate

**turbo.json pipeline updates**:

- Ensure mobile package is included in build dependencies
- Configure proper outputs for React Native builds
- Set up dev script as persistent and non-cached for mobile
- Configure test pipeline to include mobile tests

**Acceptance Criteria**:

- `pnpm dev:mobile` starts the mobile development server
- `pnpm build:mobile` builds the mobile app successfully
- `pnpm dev` starts both desktop and mobile in parallel
- `pnpm quality` includes mobile in linting and type checking
- Turbo correctly manages mobile app dependencies and caching
- All existing desktop functionality remains unaffected

**Dependencies**: Requires T-set-up-react-native-mobile-app to be completed

**Security Considerations**: Ensure build outputs are properly configured to avoid leaking sensitive information

**Testing Requirements**: Verify all monorepo commands work correctly with mobile app included

### Log

**2025-07-22T17:12:02.064022Z** - Successfully configured Turbo and root package.json for comprehensive mobile development support. Fixed turbo.json build outputs to support both desktop (dist/**, dist-electron/**) and mobile (.expo/**, web-build/**) build artifacts. Added no-op build script to eslint-config to resolve dependency issues. Added test:e2e:mobile scripts with informative placeholders indicating E2E infrastructure setup is needed. Verified quality integration includes mobile app in all linting, formatting, and type-checking workflows. All monorepo commands now work correctly: pnpm dev starts both desktop and mobile apps, pnpm build:mobile works properly, and pnpm quality includes mobile in all checks. Successfully completed all quality validation with zero errors.

- filesChanged: ["turbo.json", "package.json", "apps/mobile/package.json", "packages/eslint-config/package.json"]
