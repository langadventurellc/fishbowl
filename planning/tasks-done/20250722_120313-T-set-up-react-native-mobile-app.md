---
kind: task
id: T-set-up-react-native-mobile-app
status: done
title: Set up React Native mobile app structure with Expo
priority: high
prerequisites: []
created: "2025-07-22T11:40:53.215979"
updated: "2025-07-22T11:44:15.579814"
schema_version: "1.1"
worktree: null
---

Create the React Native mobile app skeleton using Expo, following the monorepo architecture established for the desktop app.

**Context**: The mobile app has been planned in the documentation but not yet implemented. The desktop app uses a monorepo structure with Turbo, TypeScript, and shared packages. The mobile app should follow similar patterns while using React Native + Expo.

**Technical Approach**:

1. Initialize a new Expo app in the `apps/mobile/` directory
2. Configure package.json with proper naming convention (@fishbowl-ai/mobile)
3. Set up TypeScript configuration that extends the root tsconfig
4. Configure Metro bundler for monorepo compatibility
5. Add workspace dependencies to shared packages
6. Create basic app structure with providers following desktop patterns

**Detailed Implementation Requirements**:

- Remove the current placeholder README and structure
- Run `npx create-expo-app@latest mobile --template blank-typescript` in the apps directory
- Configure package.json name as "@fishbowl-ai/mobile"
- Add dependencies: @fishbowl-ai/shared (workspace:_), @fishbowl-ai/ui-theme (workspace:_)
- Set up proper directory structure: src/screens/, src/components/, src/providers/
- Create Hello World screen with "Hello from Fishbowl Mobile!" text
- Add React Navigation setup with basic tab navigation structure (Dashboard, Settings)

**Acceptance Criteria**:

- Mobile app structure exists in apps/mobile/ with proper Expo configuration
- Package.json has correct naming and workspace dependencies
- TypeScript configuration works without errors
- Basic React Navigation setup with 2 tabs (Dashboard, Settings)
- Hello World screen displays correctly
- Metro bundler resolves shared packages correctly
- App can be started with `pnpm dev:mobile` (to be configured in root)

**Dependencies**: None

**Security Considerations**: Ensure no sensitive information is committed to version control

**Testing Requirements**: Include unit test setup similar to desktop app structure

### Log

**2025-07-22T17:03:13.804492Z** - Successfully implemented React Native mobile app with Expo following monorepo best practices. Created complete mobile app structure with Dashboard and Settings screens using React Navigation bottom tabs. Configured Metro bundler for monorepo compatibility, set up TypeScript with proper path mapping, integrated workspace dependencies, and ensured all quality checks pass. Mobile app includes proper ESLint configuration, Jest testing setup, and follows 2025 best practices including automatic Metro monorepo detection and pnpm workspace integration.

- filesChanged: ["apps/mobile/package.json", "apps/mobile/tsconfig.json", "apps/mobile/metro.config.js", "apps/mobile/App.tsx", "apps/mobile/src/screens/Dashboard.tsx", "apps/mobile/src/screens/Settings.tsx", "apps/mobile/src/screens/index.ts", "apps/mobile/eslint.config.cjs", "apps/mobile/jest.config.cjs", "package.json"]
