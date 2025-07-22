---
kind: task
id: T-create-hello-world-mobile-app
title: Create Hello World mobile app with React Navigation
status: open
priority: normal
prerequisites:
  - T-set-up-react-native-mobile-app
created: "2025-07-22T11:41:36.286262"
updated: "2025-07-22T11:41:36.286262"
schema_version: "1.1"
---

Implement a basic Hello World mobile application with React Navigation, following the architecture patterns documented for the mobile app.

**Context**: The mobile app should have a basic functional structure similar to the desktop app, with navigation and basic screens. This provides the foundation for future feature development.

**Technical Approach**:

1. Set up React Navigation with bottom tabs (matching desktop's navigation concept)
2. Create basic screen components (Dashboard, Settings)
3. Implement provider structure similar to desktop app
4. Add Hello World content with proper styling

**Detailed Implementation Requirements**:

**App.tsx setup**:

```tsx
- Import React Navigation dependencies
- Set up NavigationContainer and Tab Navigator
- Create basic tab structure with Dashboard and Settings screens
- Follow the architecture shown in docs/architecture/monorepo.md
```

**Screen components**:

- `src/screens/DashboardScreen.tsx` - Main screen with "Hello from Fishbowl Mobile!" message
- `src/screens/SettingsScreen.tsx` - Settings screen with basic content
- Each screen should use proper TypeScript types and React Native styling

**Provider structure**:

- `src/providers/` directory following desktop pattern
- Placeholder providers for future database, storage, and AI service integration
- Proper provider nesting in App.tsx

**Navigation setup**:

- Install and configure @react-navigation/native and @react-navigation/bottom-tabs
- Set up proper TypeScript navigation types
- Add basic icons for tabs (use built-in Expo vector icons)

**Styling approach**:

- Use React Native StyleSheet for basic styling
- Prepare structure for future NativeWind integration (documented)
- Follow basic design patterns from desktop app

**Acceptance Criteria**:

- App launches successfully in Expo Go and simulators
- Navigation between Dashboard and Settings tabs works smoothly
- Dashboard screen displays "Hello from Fishbowl Mobile!" prominently
- Settings screen shows placeholder content
- TypeScript compilation passes without errors
- App follows documented architecture patterns
- Navigation state is properly managed
- Basic styling makes the app visually presentable

**Dependencies**: Requires T-set-up-react-native-mobile-app to be completed

**Security Considerations**: No sensitive data handling in this basic implementation

**Testing Requirements**: Include unit tests for screen components using React Native Testing Library setup

### Log
