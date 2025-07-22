---
kind: task
id: T-set-up-mobile-app-scripts-and
title: Set up mobile app scripts and React Native development commands
status: open
priority: high
prerequisites:
  - T-set-up-react-native-mobile-app
created: "2025-07-22T11:41:20.362856"
updated: "2025-07-22T11:41:20.362856"
schema_version: "1.1"
---

Configure the mobile app package.json with development, build, and testing scripts that integrate with the monorepo tooling.

**Context**: Following the desktop app pattern, the mobile app needs comprehensive scripts for development, building, testing, and quality checks that work within the Turbo monorepo structure.

**Technical Approach**:

1. Configure mobile package.json scripts following desktop app patterns
2. Set up React Native/Expo specific commands (ios, android, prebuild)
3. Add testing scripts for unit and E2E tests
4. Configure quality control scripts (lint, type-check, format)

**Detailed Implementation Requirements**:

**Development scripts**:

- `"dev": "expo start"` - Start development server
- `"ios": "expo run:ios"` - Run on iOS simulator
- `"android": "expo run:android"` - Run on Android emulator
- `"web": "expo start --web"` - Run on web (for development)

**Build scripts**:

- `"build": "expo export"` - Export for production
- `"prebuild": "expo prebuild"` - Generate native code
- `"build:ios": "expo build:ios"` - Build iOS app
- `"build:android": "expo build:android"` - Build Android app

**Testing scripts**:

- `"test": "jest"` - Run unit tests
- `"test:unit": "jest --passWithNoTests"` - Unit tests with no-test fallback
- `"test:e2e": "detox test --configuration ios.sim.debug"` - E2E tests (to be set up later)

**Quality scripts**:

- `"lint": "eslint src --ext .ts,.tsx"` - ESLint checking
- `"type-check": "tsc --noEmit"` - TypeScript checking
- `"clean": "rm -rf .expo node_modules/.cache dist"` - Clean build artifacts

**Acceptance Criteria**:

- All development scripts work correctly (dev, ios, android)
- Build scripts generate proper React Native bundles
- Jest configuration runs unit tests successfully
- Quality scripts integrate with monorepo tooling
- Scripts follow the same patterns as desktop app
- TypeScript compilation works without errors
- ESLint configuration uses shared config from @fishbowl-ai/eslint-config

**Dependencies**: Requires T-set-up-react-native-mobile-app to be completed

**Security Considerations**: Ensure build scripts don't expose sensitive environment variables

**Testing Requirements**: All scripts must execute without errors and produce expected outputs

### Log
