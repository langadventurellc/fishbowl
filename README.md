# Roomful AI

A desktop and mobile application for creating conversations with multiple AI agents simultaneously. Configure agents with unique personalities, roles, and AI models to enable dynamic brainstorming, problem-solving, and creative exploration.

### Commands

#### Development

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `pnpm dev`          | Start development servers for all apps        |
| `pnpm dev:desktop`  | Start development server for desktop app only |
| `pnpm dev:mobile`   | Start development server for mobile app only  |
| `pnpm start:mobile` | Start Expo development server for mobile app  |

#### Building

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `pnpm build`           | Build all packages and apps          |
| `pnpm build:desktop`   | Build desktop app and dependencies   |
| `pnpm build:mobile`    | Export mobile app for production     |
| `pnpm prebuild:mobile` | Generate native iOS/Android projects |

#### Mobile App Builds (EAS)

| Command                         | Description                                       |
| ------------------------------- | ------------------------------------------------- |
| `pnpm build:mobile:development` | Build development version (internal distribution) |
| `pnpm build:mobile:preview`     | Build preview version (internal testing)          |
| `pnpm build:mobile:production`  | Build production version (app store ready)        |

#### Testing & Quality

| Command                          | Description                                           |
| -------------------------------- | ----------------------------------------------------- |
| `pnpm test`                      | Run tests for all packages                            |
| `pnpm test:e2e:desktop`          | Run end-to-end tests for desktop app                  |
| `pnpm test:e2e:desktop:headless` | Run E2E tests in headless mode                        |
| `pnpm test:e2e:mobile`           | Run mobile E2E tests                                  |
| `pnpm lint`                      | Run linting for all packages                          |
| `pnpm format`                    | Format all TypeScript, JavaScript, and Markdown files |
| `pnpm type-check`                | Run TypeScript type checks for all packages           |
| `pnpm quality`                   | Run all quality checks (lint, format, type-check)     |

#### Utilities

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `pnpm clean`      | Clean all build outputs and node_modules |
| `pnpm db:migrate` | Run database migrations for all apps     |

## Mobile App Development

The Roomful AI mobile app is built with React Native and Expo, supporting both managed (EAS Build) and local build workflows.

### Prerequisites

1. **EAS CLI**: Install globally for cloud builds

   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Expo CLI**: For local development

   ```bash
   npm install -g @expo/cli
   ```

3. **EAS Account**: Create account at [expo.dev](https://expo.dev)
   ```bash
   eas login
   ```

### Development Workflow

1. **Start Development Server**

   ```bash
   pnpm dev:mobile
   # or
   pnpm start:mobile
   ```

2. **Run on Simulator/Device**
   - iOS: Press `i` in terminal or scan QR code with Expo Go
   - Android: Press `a` in terminal or scan QR code with Expo Go

### Building Apps

#### Cloud Builds (EAS Build)

EAS Build provides cloud-based building for iOS and Android apps:

```bash
# Development build (for testing new features)
pnpm build:mobile:development

# Preview build (for internal testing)
pnpm build:mobile:preview

# Production build (for app store submission)
pnpm build:mobile:production
```

**Build Profiles:**

- **Development**: Internal distribution, debug enabled, simulator support
- **Preview**: Internal testing, release configuration, APK format
- **Production**: App store ready, auto-increment versioning, optimized

#### Local Builds

Generate and build native projects locally:

```bash
# Generate native iOS/Android projects
pnpm prebuild:mobile

# Build locally (requires Xcode/Android Studio)
cd apps/mobile
expo run:ios --configuration Release
expo run:android --variant release
```

### Environment Configuration

The mobile app supports environment-specific configurations:

- **Development**: `apps/mobile/.env.development`
- **Preview**: `apps/mobile/.env.preview`
- **Production**: `apps/mobile/.env.production`

Environment variables are automatically loaded based on the build profile.

### Deployment

#### iOS App Store

```bash
# Build production version
pnpm build:mobile:production --platform ios

# Submit to App Store (requires Apple Developer account)
eas submit --platform ios
```

#### Android Play Store

```bash
# Build production version
pnpm build:mobile:production --platform android

# Submit to Play Store (requires Google Play Console account)
eas submit --platform android
```

### Troubleshooting

- **Clear Expo cache**: `expo start --clear`
- **Clean build artifacts**: `pnpm clean`
- **Regenerate native projects**: `pnpm prebuild:mobile`
- **EAS build logs**: Check build details in [EAS dashboard](https://expo.dev)

For more details, see the [mobile app documentation](./apps/mobile/README.md).
