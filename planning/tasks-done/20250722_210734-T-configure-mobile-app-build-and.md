---
kind: task
id: T-configure-mobile-app-build-and
status: done
title: Configure mobile app build and export processes
priority: normal
prerequisites:
  - T-set-up-mobile-app-scripts-and
created: "2025-07-22T11:42:27.781579"
updated: "2025-07-22T21:02:05.754633"
schema_version: "1.1"
worktree: null
---

Set up production build processes for the mobile app including Expo build configuration, app.json setup, and export capabilities.

**Context**: The mobile app needs proper build configuration to generate production-ready apps for iOS and Android, similar to how the desktop app has electron-builder configuration.

**Technical Approach**:

1. Configure app.json/app.config.js with proper app metadata
2. Set up Expo build profiles and configuration
3. Configure export and prebuild processes
4. Set up environment variable handling
5. Configure app icons and splash screens

**Detailed Implementation Requirements**:

**App configuration (app.json)**:

```json
{
  "expo": {
    "name": "Fishbowl",
    "slug": "fishbowl-mobile",
    "version": "0.0.1",
    "orientation": "portrait",
    "platforms": ["ios", "android"],
    "splash": {...},
    "assetBundlePatterns": ["**/*"],
    "ios": {...},
    "android": {...},
    "web": {...}
  }
}
```

**Build configuration**:

- Configure eas.json for EAS Build (separate script - should have the choice to use EAS or local builds)
- Set up local build processes using expo prebuild
- Configure proper bundle identifiers and app IDs
- Set up signing certificates placeholder structure

**Asset configuration**:

- Add basic app icon (can use Expo default initially)
- Configure splash screen with Fishbowl branding
- Set up proper asset bundling patterns
- Configure app store assets structure

**Environment handling**:

- Set up proper environment variable configuration
- Configure development vs production builds
- Set up secrets management structure (without actual secrets)

**Export configuration**:

- Configure static export for web testing
- Set up proper build outputs and paths
- Configure Metro bundler for optimized builds

**Build scripts optimization**:

- Ensure build scripts work with monorepo structure
- Configure proper caching for faster builds
- Set up clean build processes

**Acceptance Criteria**:

- `pnpm build:mobile` generates production-ready app bundles
- App builds successfully for both iOS and Android
- Expo prebuild generates proper native projects
- App launches with correct branding and metadata
- Build artifacts are properly organized and cacheable
- Environment variables are handled securely
- Integration with monorepo build pipeline works
- Build process is documented and reproducible

**Dependencies**: Requires T-set-up-mobile-app-scripts-and to be completed

**Security Considerations**:

- Ensure build process doesn't leak sensitive information
- Configure proper environment variable handling
- Set up secure credential management patterns

**Testing Requirements**: Build process should be tested on both platforms and generate working app bundles

### Log

**2025-07-23T02:07:34.659614Z** - Successfully configured production-ready mobile app build and export processes for Fishbowl. Implemented comprehensive EAS Build configuration with development/preview/production profiles, environment variable handling for different build environments, updated app.json with Fishbowl branding, optimized build scripts for monorepo integration, and configured proper asset management. All build processes tested and validated - prebuild generates native projects, export creates optimized bundles, and quality checks pass. Ready for production builds on both iOS and Android platforms.

- filesChanged: ["apps/mobile/app.json", "apps/mobile/eas.json", "apps/mobile/package.json", "package.json", "apps/mobile/.env.example", "apps/mobile/.env.development", "apps/mobile/.env.preview", "apps/mobile/.env.production", "apps/mobile/assets/README.md"]
