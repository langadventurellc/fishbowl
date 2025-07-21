# Tauri + React Native Monorepo Architecture Guide

## Table of Contents
1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [Initial Setup](#initial-setup)
4. [Platform-Specific Implementation](#platform-specific-implementation)
5. [Development Workflow](#development-workflow)
6. [Best Practices](#best-practices)
7. [Quick Reference for AI Agents](#quick-reference-for-ai-agents)
8. [Summary](#summary)

## Project Structure

```
fishbowl/
├── apps/
│   ├── desktop/                 # Tauri desktop app
│   │   ├── src/
│   │   │   ├── __tests__/          # Unit tests
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── pages/
│   │   ├── src-tauri/          # Rust backend
│   │   │   ├── src/
│   │   │   └── Cargo.toml
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── mobile/                  # React Native app
│       ├── android/
│       ├── ios/
│       ├── src/
│   │   │   ├── __tests__/          # Unit tests
│       │   ├── App.tsx
│       │   └── screens/
│       ├── index.js
│       ├── metro.config.js
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                  # Shared business logic
│   │   ├── src/
│   │   │   ├── api/
│   │   │       └── __tests__/          # Unit tests
│   │   │   ├── db/
│   │   │       └── __tests__/          # Unit tests
│   │   │   ├── hooks/
│   │   │       └── __tests__/          # Unit tests
│   │   │   ├── services/
│   │   │       └── __tests__/          # Unit tests
│   │   │   ├── store/
│   │   │       └── __tests__/          # Unit tests
│   │   │   ├── types/
│   │   │       └── __tests__/          # Unit tests
│   │   │   └── utils/
│   │   │       └── __tests__/          # Unit tests
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui-theme/               # Shared design tokens
│   │   ├── src/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   └── typography.ts
│   │   └── package.json
│   │
│   └── eslint-config/          # Shared ESLint config
│       ├── index.js
│       └── package.json
│
├── tests/                      # End-to-end tests
│   ├── desktop/               # WebdriverIO tests
│   │   ├── features/
│   │   ├── support/
│   │   └── wdio.conf.ts
│   │
│   └── mobile/                # Detox tests
│       ├── features/
│       ├── support/
│       └── detox.config.js
│
├── migrations/                 # Shared SQL migrations
│   ├── 001_initial_schema.sql
│   └── 002_add_api_keys.sql
│
├── turbo.json                 # Turborepo config
├── package.json               # Root package.json
├── pnpm-workspace.yaml        # PNPM workspace config
├── .circleci/                 # CircleCI config
│   └── config.yml
├── .gitignore
├── .nvmrc                     # Node version
└── README.md
```

## Technology Stack

### Shared (Both Platforms)
- **Monorepo Tool**: Turborepo
- **Package Manager**: PNPM
- **Language**: TypeScript
- **State Management**: Zustand
- **Validation**: Zod
- **AI Integration**: Custom AI Service (REST-based, multi-provider)
- **Database Interface**: Abstract interface with platform implementations
- **Testing**: Jest (unit tests)

### Desktop (Tauri)
- **Framework**: Tauri + React + Vite
- **Database**: tauri-plugin-sql (SQLite)
- **Styling**: Tailwind CSS + ShadCN UI
- **E2E Testing**: WebdriverIO + Jest (BDD approach)
- **Secure Storage**: Tauri keychain integration

### Mobile (React Native)
- **Framework**: React Native + Expo
- **Database**: expo-sqlite
- **Styling**: NativeWind + Tamagui
- **E2E Testing**: Detox + Jest (BDD approach)
- **Secure Storage**: expo-secure-store

## Initial Setup

### 1. Initialize the Monorepo

```bash
# Create project directory
mkdir fishbowl-ai && cd fishbowl-ai

# Initialize package.json
pnpm init

# Install Turborepo and core dependencies
pnpm add -D turbo typescript @types/node prettier eslint
```

### 2. Root Configuration Files

**package.json**
```json
{
  "name": "fishbowl-ai",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "dev:desktop": "turbo run dev --filter=desktop",
    "dev:mobile": "turbo run dev --filter=mobile",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:e2e:desktop": "turbo run test:e2e --filter=desktop",
    "test:e2e:mobile": "turbo run test:e2e --filter=mobile",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,md,json}\"",
    "clean": "turbo run clean && rm -rf node_modules",
    "db:migrate": "turbo run db:migrate"
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

**turbo.json**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "clean": {
      "cache": false
    }
  }
}
```

**pnpm-workspace.yaml**
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tests/*"
```


## Platform-Specific Implementation

### Desktop App Structure

**apps/desktop/src/App.tsx**
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { DatabaseProvider } from './providers/DatabaseProvider';
import { SecureStorageProvider } from './providers/SecureStorageProvider';
import { AIServiceProvider } from './providers/AIServiceProvider';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { ChatPage } from './pages/ChatPage';
import { useAuthStore } from '@fishbowl-ai/shared';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseProvider>
        <SecureStorageProvider>
          <AIServiceProvider>
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/login" 
                  element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} 
                />
                <Route 
                  path="/dashboard" 
                  element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/settings" 
                  element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/chat" 
                  element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} 
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </BrowserRouter>
          </AIServiceProvider>
        </SecureStorageProvider>
      </DatabaseProvider>
    </QueryClientProvider>
  );
}

export default App;
```

### Mobile App Structure

**apps/mobile/src/App.tsx**
```tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DatabaseProvider } from './providers/DatabaseProvider';
import { SecureStorageProvider } from './providers/SecureStorageProvider';
import { AIServiceProvider } from './providers/AIServiceProvider';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ChatScreen } from './screens/ChatScreen';
import { useAuthStore } from '@fishbowl-ai/shared';

const Tab = createBottomTabNavigator();

export default function App() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <DatabaseProvider>
      <SecureStorageProvider>
        <AIServiceProvider>
          <NavigationContainer>
            {!isAuthenticated ? (
              <LoginScreen />
            ) : (
              <Tab.Navigator>
                <Tab.Screen name="Dashboard" component={DashboardScreen} />
                <Tab.Screen name="Chat" component={ChatScreen} />
                <Tab.Screen name="Settings" component={SettingsScreen} />
              </Tab.Navigator>
            )}
          </NavigationContainer>
        </AIServiceProvider>
      </SecureStorageProvider>
    </DatabaseProvider>
  );
}
```

## Development Workflow

### Scripts

**apps/desktop/package.json**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && tauri build",
    "preview": "vite preview",
    "tauri": "tauri",
    "test": "jest",
    "test:e2e": "wdio run ./wdio.conf.ts",
    "db:migrate": "node scripts/migrate.js"
  }
}
```

**apps/mobile/package.json**
```json
{
  "scripts": {
    "dev": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "build": "expo build",
    "test": "jest",
    "test:e2e:ios": "detox test --configuration ios.sim.debug",
    "test:e2e:android": "detox test --configuration android.emu.debug",
    "db:migrate": "node scripts/migrate.js"
  }
}
```

### Environment Variables

**apps/desktop/.env.local**
```env
VITE_APP_NAME=Fishbowl AI
VITE_APP_VERSION=$npm_package_version
VITE_LOG_LEVEL=debug
```

**apps/mobile/.env**
```env
EXPO_PUBLIC_APP_NAME=Fishbowl AI
EXPO_PUBLIC_LOG_LEVEL=debug
```

## Best Practices

### 1. Code Organization

- **Shared packages are pure**: No platform-specific imports
- **Use barrel exports**: Clean imports with index.ts files
- **Consistent interfaces**: Platform implementations follow same interface

### 2. Database Best Practices

```typescript
// Always use parameterized queries
await db.execute('INSERT INTO users (id, email) VALUES (?, ?)', [id, email]);

// Use transactions for multi-step operations
await db.transaction(async (tx) => {
  await tx.execute('INSERT INTO conversations (id, user_id) VALUES (?, ?)', [convId, userId]);
  await tx.execute('INSERT INTO messages (conversation_id, content) VALUES (?, ?)', [convId, content]);
});

// Always handle migrations
const migrations = [
  { version: 1, name: 'initial', sql: readFileSync('./migrations/001_initial_schema.sql', 'utf-8') },
  { version: 2, name: 'api_keys', sql: readFileSync('./migrations/002_add_api_keys.sql', 'utf-8') }
];

await db.migrate(migrations);
```

### 3. Security Best Practices

```typescript
// Never store sensitive data in plain text
const encryptedKey = await secureStorage.saveAPIKey('openai', apiKey);

// Validate all user inputs
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const validated = schema.parse(userInput);

// Sanitize SQL inputs (though parameterized queries handle this)
const sanitized = input.replace(/[^\w\s]/gi, '');
```

### 4. Testing Best Practices

```typescript
// Follow BDD structure
describe('Feature: User Authentication', () => {
  describe('Scenario: Successful login', () => {
    it('should authenticate valid credentials', async () => {
      // Given
      const credentials = { email: 'test@example.com', password: 'password123' };
      
      // When
      const result = await authService.login(credentials);
      
      // Then
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });
  });
});

// Use data-testid for E2E tests
<button data-testid="login-button">Login</button>
```

### 5. AI Service Best Practices

```typescript
// Always handle API errors gracefully
try {
  const response = await aiService.chat('openai', messages);
  return response;
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Switch to backup provider
    return aiService.chat('anthropic', messages);
  }
  throw error;
}

// Implement retry logic for transient failures
const retryWithBackoff = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

### 6. Platform Bridge Pattern

```typescript
// Define interface in shared
export interface PlatformBridge {
  openFilePicker(): Promise<string>;
  saveFile(path: string, content: string): Promise<void>;
  showNotification(title: string, body: string): Promise<void>;
}

// Implement per platform
// Desktop
class TauriBridge implements PlatformBridge {
  async openFilePicker() {
    return invoke('open_file_dialog');
  }
  // ...
}

// Mobile
class ExpoBridge implements PlatformBridge {
  async openFilePicker() {
    const result = await DocumentPicker.getDocumentAsync();
    return result.uri;
  }
  // ...
}
```

## Quick Reference for AI Agents

### Where Code Goes
1. **Business Logic** → `packages/shared/src/`
2. **Desktop UI** → `apps/desktop/src/`
3. **Mobile UI** → `apps/mobile/src/`
4. **Database Schemas** → `migrations/`
5. **E2E Tests Desktop** → `tests/desktop/features/`
6. **E2E Tests Mobile** → `tests/mobile/features/`

### Key Commands
```bash
# Development
pnpm dev              # Run all apps
pnpm dev:desktop      # Desktop only
pnpm dev:mobile       # Mobile only

# Testing
pnpm test             # Unit tests
pnpm test:e2e:desktop # Desktop E2E
pnpm test:e2e:mobile  # Mobile E2E

# Building
pnpm build            # Build all
pnpm build:desktop    # Desktop only
pnpm build:mobile     # Mobile only

# Database
pnpm db:migrate       # Run migrations
```

### Import Examples
```typescript
// From shared packages
import { AIService, Database, useAuthStore } from '@fishbowl-ai/shared';
import { theme } from '@fishbowl-ai/ui-theme';

// Platform-specific
import { TauriDatabase } from './services/database';
import { ExpoSecureStorage } from './services/secure-storage';
```

## Summary

This architecture provides:
- **Maximum code reuse** through shared packages
- **Type safety** throughout the stack
- **Platform-optimized** implementations
- **Scalable structure** for growth

The key is maintaining clean boundaries between shared logic and platform-specific UI while leveraging each platform's strengths.