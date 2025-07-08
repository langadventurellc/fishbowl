# Development Setup Specification

## Overview
This document provides step-by-step instructions for setting up the Fishbowl development environment, including prerequisites, initial setup, and development workflow.

## Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher (LTS recommended)
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **SQLite**: v3.35.0 or higher (usually pre-installed)

### Recommended Development Tools
- **VS Code**: Latest version
- **Chrome/Edge**: For DevTools debugging

### Platform-Specific Requirements

#### macOS
- Xcode Command Line Tools: `xcode-select --install`
- Python 3 (for node-gyp)

#### Windows
- Windows Build Tools: `npm install -g windows-build-tools`
- Python 3 (for node-gyp)
- Visual Studio 2019+ with "Desktop development with C++" workload

#### Linux
- Build essentials: `sudo apt-get install build-essential`
- libsecret (for keytar): `sudo apt-get install libsecret-1-dev`
- Additional Electron dependencies:
  ```bash
  sudo apt-get install libnss3-dev libatk-bridge2.0-0 \
    libdrm2 libxcomposite1 libxdamage1 libxfixes3 \
    libxrandr2 libgbm1 libxss1 libasound2
  ```

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/langadventurellc/fishbowl.git
cd fishbowl
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# If you encounter native module issues
npm rebuild

# For SQLite issues specifically
npm rebuild better-sqlite3
```

### 3. Environment Configuration

Create a `.env.development` file in the root:
```env
# Development settings
NODE_ENV=development
VITE_DEV_SERVER_PORT=5173

# Optional: Default test API keys (DO NOT commit real keys)
# OPENAI_API_KEY=sk-test-...
# ANTHROPIC_API_KEY=sk-ant-test-...
```

### 4. Configuration Files Setup

Copy default configuration files:
```bash
# Create config directory if it doesn't exist
mkdir -p config

# Copy default configurations
cp config.example/models.json config/models.json
cp config.example/personalities.json config/personalities.json
cp config.example/roles.json config/roles.json
```

### 5. Database Setup

The database is created automatically on first run, but you can initialize it manually:
```bash
# Create data directory
mkdir -p app-data/data

# Run migrations (if applicable)
npm run db:migrate
```

## Development Workflow

### Running the Application

#### Development Mode (Hot Reload)
```bash
# Start both main and renderer processes with hot reload
npm run dev

# Or run them separately:
npm run dev:main     # Main process only
npm run dev:renderer # Renderer process only
```

#### Production Preview
```bash
# Build and run production version locally
npm run build
npm run preview
```

### Code Structure Guidelines

#### File Naming
- Components: PascalCase (e.g., `ChatRoom.tsx`)
- Utilities: camelCase (e.g., `formatMessage.ts`)
- Types: PascalCase with `.ts` extension (e.g., `Agent.ts`)
- Styles: Same as component with `.module.css` (e.g., `ChatRoom.module.css`)

#### Import Order
```typescript
// 1. External imports
import React, { useState, useEffect } from 'react';
import { create } from 'zustand';

// 2. Internal absolute imports
import { useStore } from '@/store';
import { Agent } from '@shared/types';

// 3. Relative imports
import { MessageList } from './MessageList';
import styles from './ChatRoom.module.css';
```

### TypeScript Configuration

The project uses strict TypeScript settings. Key configurations:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Debugging

#### Main Process Debugging

**VS Code Configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceRoot}",
      "program": "${workspaceRoot}/node_modules/electron/cli.js",
      "args": ["."],
      "outputCapture": "std",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

#### Renderer Process Debugging
1. Open DevTools: `Cmd/Ctrl + Shift + I`
2. Use Chrome DevTools features:
   - React Developer Tools
   - Network tab for API calls
   - Console for logs
   - Performance profiling

#### Common Debugging Commands
```typescript
// In renderer console
window.api // Check IPC bridge
store.getState() // Inspect Zustand store

// Enable verbose logging
localStorage.setItem('DEBUG', 'true');
```

### Testing

#### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

#### Test Structure
```typescript
// Example test file: MessageList.test.tsx
import { render, screen } from '@testing-library/react';
import { MessageList } from './MessageList';

describe('MessageList', () => {
  it('renders messages correctly', () => {
    const messages = [
      { id: '1', content: 'Hello', role: 'user' },
    ];
    
    render(<MessageList messages={messages} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Linting and Formatting

#### ESLint Configuration
```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

#### Prettier Configuration
```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}
```

#### Pre-commit Hooks (using Husky)
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run type-check"
    }
  }
}
```

## Recommended VS Code Extensions

### Essential Extensions
```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "csstools.postcss",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag"
  ]
}
```

### VS Code Settings
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.css": "postcss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

## Common Development Tasks

### Adding a New AI Provider

1. Create provider service:
```typescript
// services/ai/providers/newprovider.ts
export class NewProviderService implements AIProvider {
  async generateStream(options: GenerateOptions): AsyncIterable<string> {
    // Implementation
  }
}
```

2. Update models.json:
```json
{
  "providers": {
    "newprovider": {
      "baseUrl": "https://api.newprovider.com",
      "systemPromptStrategy": "system_role",
      "models": [...]
    }
  }
}
```

3. Register in provider factory:
```typescript
// services/ai/provider-factory.ts
providers.set('newprovider', new NewProviderService());
```

### Adding a New Component

1. Create component file:
```bash
mkdir -p src/renderer/components/NewFeature
touch src/renderer/components/NewFeature/NewFeature.tsx
touch src/renderer/components/NewFeature/NewFeature.module.css
touch src/renderer/components/NewFeature/index.ts
```

2. Basic component structure:
```typescript
// NewFeature.tsx
import React from 'react';
import styles from './NewFeature.module.css';

interface NewFeatureProps {
  // Props
}

export function NewFeature({ ...props }: NewFeatureProps) {
  return <div className={styles.container}>New Feature</div>;
}

// index.ts
export { NewFeature } from './NewFeature';
```

### Database Schema Changes

1. Create migration file:
```sql
-- migrations/002_add_new_table.sql
CREATE TABLE new_table (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. Update TypeScript types:
```typescript
// shared/types/database.ts
export interface NewTable {
  id: string;
  createdAt: Date;
}
```

## Troubleshooting

### Common Issues

#### Native Module Errors
```bash
# Rebuild native modules for Electron
npm run electron:rebuild

# Or manually
npx electron-rebuild
```

#### SQLite Issues
```bash
# Clear and rebuild
rm -rf node_modules/better-sqlite3
npm install
npm rebuild better-sqlite3
```

#### Port Already in Use
```bash
# Find process using port
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Kill process or change port in .env.development
```

#### Electron White Screen
1. Check console for errors: `Cmd/Ctrl + Shift + I`
2. Verify main process is running
3. Check IPC communication
4. Clear application data: `~/Library/Application Support/Fishbowl` (macOS)

### Performance Profiling

#### React Profiler
```typescript
// Wrap components to profile
import { Profiler } from 'react';

<Profiler id="ChatRoom" onRender={onRenderCallback}>
  <ChatRoom />
</Profiler>
```

#### Memory Leaks
```typescript
// Use Chrome DevTools Memory Profiler
// Take heap snapshots and compare
// Look for detached DOM nodes and event listeners
```

## Build and Package

### Local Build Testing
```bash
# Build for current platform
npm run dist

# Build for specific platform
npm run dist:mac
npm run dist:win
npm run dist:linux

# Output in dist/ directory
```

### Build Optimization
```bash
# Analyze bundle size
npm run analyze

# Optimize for production
npm run build:prod
```

## Additional Resources

### Documentation
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Vite Documentation](https://vitejs.dev)

### Project-Specific Docs
- `docs/API.md` - Internal API documentation
- `docs/ARCHITECTURE.md` - Detailed architecture decisions
- `docs/CONTRIBUTING.md` - Contribution guidelines

### Debugging Tools
- [Electron DevTools Extension](https://github.com/MarshallOfSound/electron-devtools-installer)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Electron Fiddle](https://www.electronjs.org/fiddle) - For testing Electron features

## Getting Help

### Project Resources
- GitHub Issues: Report bugs and request features
- GitHub Discussions: Ask questions and share ideas
- Project Wiki: Additional guides and tips

### Community Resources
- Electron Discord Server
- React Community Discord
- Stack Overflow tags: `electron`, `react`, `typescript`