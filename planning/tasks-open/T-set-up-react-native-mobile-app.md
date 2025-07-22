---
kind: task
id: T-set-up-react-native-mobile-app
title: Set up React Native mobile app structure with Expo
status: open
priority: high
prerequisites: []
created: "2025-07-22T11:40:53.215979"
updated: "2025-07-22T11:40:53.215979"
schema_version: "1.1"
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
