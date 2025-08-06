# Fishbowl Codebase Structure

## Repository Layout

```
fishbowl/
├── apps/
│   ├── desktop/          # Electron desktop application
│   │   ├── src/
│   │   │   ├── components/   # React UI components
│   │   │   ├── electron/     # Main process code & IPC handlers
│   │   │   ├── lib/          # Desktop-specific utilities
│   │   │   └── utils/        # Desktop helper functions
│   │   └── package.json
│   └── mobile/           # React Native mobile app
│       ├── src/
│       └── package.json
├── packages/
│   ├── shared/           # Business logic & shared code
│   │   ├── src/
│   │   │   ├── api/          # API clients
│   │   │   ├── repositories/ # Data repositories
│   │   │   ├── services/     # Business services
│   │   │   ├── stores/       # Zustand stores
│   │   │   ├── types/        # TypeScript types
│   │   │   └── utils/        # Utility functions
│   │   └── package.json
│   ├── ui-shared/        # UI types & props shared between platforms
│   │   ├── src/
│   │   │   └── types/        # UI-related types
│   │   └── package.json
│   ├── ui-theme/         # Shared theme utilities
│   └── eslint-config/    # Shared ESLint config
├── docs/                 # Documentation
├── tests/                # E2E test suites
├── migrations/           # Database migrations
├── planning/             # Trellis project management
└── package.json          # Root package.json

## Key Patterns

### Settings Persistence
- Settings stored in JSON files using FileStorageService
- Main settings file: preferences.json
- Settings repository pattern in packages/shared/src/repositories/settings/
- IPC handlers in apps/desktop/src/electron/settingsHandlers.ts
- Frontend communicates via IPC channels defined in constants

### IPC Communication (Desktop)
- Main process handlers: apps/desktop/src/electron/
- Preload bridge: apps/desktop/src/electron/preload.ts
- Channel constants defined in shared package
- Request/Response pattern with error handling

### Component Organization
- Feature-based folder structure
- Index barrel files for clean imports
- Separation of concerns between UI and logic
- Platform-specific implementations in app folders
```
