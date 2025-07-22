---
kind: task
id: T-configure-turbo-and-root-package
title: Configure Turbo and root package.json scripts for mobile development
status: open
priority: high
prerequisites:
  - T-set-up-react-native-mobile-app
created: "2025-07-22T11:41:06.244538"
updated: "2025-07-22T11:41:06.244538"
schema_version: "1.1"
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
