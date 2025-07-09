# Deployment & Distribution Specification

## Overview

This document outlines the build, packaging, and distribution strategy for the Fishbowl desktop application v1.0, focusing on a simple but professional deployment process using GitHub releases.

## Distribution Strategy

### Primary Distribution Channel

- **GitHub Releases**: Public releases with downloadable binaries
- **Release Page**: Clear download instructions and system requirements
- **Version Naming**: Semantic versioning (1.0.0, 1.0.1, etc.)

### Release Artifacts

Each release includes:

- macOS: Universal `.dmg` (Intel + Apple Silicon)
- Windows: `.exe` installer + `.zip` portable
- Linux: `.AppImage` (universal) + `.deb` (Ubuntu/Debian)
- Release notes with changelog
- SHA256 checksums file

## Electron Builder Configuration

### Basic Configuration

```javascript
// electron-builder.yml
appId: com.aiCollaborators.app
productName: Fishbowl
directories:
  output: dist
  buildResources: build
files:
  - dist/**/*
  - node_modules/**/*
  - package.json
  - !node_modules/**/test/**
  - !**/*.map
  - !**/*.ts
  - !**/tsconfig.json

publish:
  provider: github
  owner: [your-github-username]
  repo: ai-collaborators
  releaseType: release

# Build-time environment variables
extraMetadata:
  main: dist/main/index.js
```

### Platform-Specific Configuration

#### macOS Configuration

```yaml
mac:
  category: public.app-category.productivity
  icon: build/icon.icns
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  target:
    - target: dmg
      arch:
        - x64
        - arm64
        - universal
  artifactName: ${productName}-${version}-${os}-${arch}.${ext}

dmg:
  contents:
    - x: 130
      y: 220
    - x: 410
      y: 220
      type: link
      path: /Applications
  window:
    width: 540
    height: 380
  icon: build/icon.icns
```

#### Windows Configuration

```yaml
win:
  target:
    - nsis
    - zip
  icon: build/icon.ico
  artifactName: ${productName}-${version}-${os}-${arch}.${ext}

nsis:
  oneClick: false
  perMachine: false
  allowToChangeInstallationDirectory: true
  deleteAppDataOnUninstall: false
  differentialPackage: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: Fishbowl
```

#### Linux Configuration

```yaml
linux:
  target:
    - AppImage
    - deb
  icon: build/icons
  category: Utility
  desktop:
    StartupNotify: true
    Terminal: false
    Type: Application
    Icon: ai-collaborators
  artifactName: ${productName}-${version}-${os}-${arch}.${ext}

appImage:
  artifactName: ${productName}-${version}.${ext}

deb:
  depends:
    - libnotify4
    - libxtst6
    - libnss3
```

## Code Signing

### V1 Approach: Unsigned Builds

For the initial release, distribute unsigned builds with clear instructions:

#### macOS Instructions

```markdown
## macOS Installation

1. Download the .dmg file
2. Double-click to mount
3. Drag Fishbowl to Applications
4. First time opening:
   - Right-click the app in Applications
   - Select "Open" from the context menu
   - Click "Open" in the security dialog
5. The app will now open normally
```

#### Windows Instructions

```markdown
## Windows Installation

1. Download the .exe installer
2. Run the installer
3. If you see "Windows protected your PC":
   - Click "More info"
   - Click "Run anyway"
4. Follow the installation wizard
```

### Future Signing Strategy (V1.x)

```yaml
# When ready to sign
mac:
  identity: 'Developer ID Application: Your Name (XXXXXXXXXX)'
  notarize:
    teamId: XXXXXXXXXX

win:
  signingHashAlgorithms: ['sha256']
  certificateFile: path/to/certificate.pfx
  certificatePassword: ${WINDOWS_CERTIFICATE_PASSWORD}
```

## Auto-Update Implementation

### Configuration

```typescript
// main/updater.ts
import { autoUpdater } from 'electron-updater';

export function setupAutoUpdater() {
  // Configure update source
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: '[your-github-username]',
    repo: 'ai-collaborators',
  });

  // Check for updates every 4 hours
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Check on startup after 30 seconds
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 30000);

  // Periodic checks
  setInterval(
    () => {
      autoUpdater.checkForUpdates();
    },
    4 * 60 * 60 * 1000,
  );
}

// Event handlers
autoUpdater.on('update-available', info => {
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `Version ${info.version} is available. Would you like to download it?`,
      buttons: ['Download', 'Later'],
    })
    .then(result => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
});

autoUpdater.on('update-downloaded', info => {
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. It will be installed on restart.',
      buttons: ['Restart Now', 'Later'],
    })
    .then(result => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
});
```

## First-Run Experience

### Initial State

The app opens directly to the main interface with:

- Empty conversation list
- "No agents selected" message in chat area
- No blocking wizards or dialogs

### Gentle Onboarding

```typescript
// renderer/hooks/useFirstRun.ts
export function useFirstRun() {
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');

    if (!hasSeenWelcome) {
      // Show non-blocking tooltip
      setTimeout(() => {
        showTooltip({
          target: '.add-agent-button',
          message: 'Start by adding your first AI agent',
          position: 'bottom',
        });
      }, 1000);

      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);
}
```

### API Key Prompt

When user first tries to add an agent:

```typescript
// If no API keys configured
if (!hasAnyApiKeys()) {
  showModal({
    title: 'Configure API Access',
    message: 'To use AI agents, you need to add at least one API key.',
    actions: [
      { label: 'Open Settings', action: () => openSettings('api') },
      { label: 'Cancel', action: closeModal },
    ],
  });
}
```

## Platform-Specific Considerations

### macOS

- **Entitlements**: Required for hardened runtime
  ```xml
  <!-- build/entitlements.mac.plist -->
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
    "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
    <dict>
      <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
      <true/>
      <key>com.apple.security.cs.allow-jit</key>
      <true/>
      <key>com.apple.security.files.user-selected.read-write</key>
      <true/>
    </dict>
  </plist>
  ```
- **Universal Binary**: Single app works on both Intel and Apple Silicon
- **Minimum Version**: macOS 10.15 (Catalina)

### Windows

- **Visual C++ Redistributables**: Bundled with installer
- **Firewall**: May prompt on first run for network access
- **Portable Version**: No admin rights required
- **Minimum Version**: Windows 10 version 1903

### Linux

- **AppImage**: Works on most distributions without installation
- **Desktop Integration**: Automatic with AppImageLauncher
- **Dependencies**: Minimal, bundled in AppImage
- **Tested On**: Ubuntu 20.04+, Fedora 35+, Debian 11+

## Build Scripts

### Package.json Scripts

```json
{
  "scripts": {
    "build": "npm run build:main && npm run build:renderer",
    "build:main": "tsc -p tsconfig.main.json",
    "build:renderer": "vite build",
    "dist": "npm run build && electron-builder",
    "dist:mac": "npm run dist -- --mac",
    "dist:win": "npm run dist -- --win",
    "dist:linux": "npm run dist -- --linux",
    "dist:all": "npm run dist -- -mwl",
    "release": "npm run dist:all && npm run release:github",
    "release:github": "electron-builder --publish always"
  }
}
```

### CI/CD Workflow (GitHub Actions)

```yaml
# .github/workflows/release.yml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: macos-latest
            build: dist:mac
          - os: windows-latest
            build: dist:win
          - os: ubuntu-latest
            build: dist:linux

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Build and package
        run: npm run ${{ matrix.build }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: dist/*
```

## Default Configuration

### Pre-packaged Files

```
config/
├── models.json          # Default model configurations
├── personalities.json   # 6 personality templates
└── roles.json          # 10 predefined roles
```

### Initial Settings

```typescript
// Default preferences
const defaultSettings = {
  theme: 'system',
  autoMode: false,
  responseDelay: 5,
  maxMessages: 50,
  maxWaitTime: 30,
  maxAgents: 4,
  showTimestamps: 'hover',
  checkForUpdates: true,
};
```

## Release Process

### Version Bumping

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit with message: `chore: bump version to X.Y.Z`
4. Tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
5. Push: `git push origin main --tags`

### GitHub Release

1. CI/CD builds and uploads artifacts
2. Create release notes highlighting:
   - New features
   - Bug fixes
   - Breaking changes
   - Known issues
3. Mark as pre-release for beta versions

### Download Page Template

```markdown
## Download Fishbowl v1.0.0

### System Requirements

- macOS 10.15+ / Windows 10+ / Linux (Ubuntu 20.04+)
- 4GB RAM minimum
- 500MB disk space
- Internet connection required

### Downloads

- 🍎 **macOS**: [AI-Collaborators-1.0.0-mac-universal.dmg](link)
- 🪟 **Windows**: [AI-Collaborators-1.0.0-win-x64.exe](link)
- 🐧 **Linux**: [AI-Collaborators-1.0.0.AppImage](link)

### Installation Instructions

[Platform-specific instructions here]

### Checksums

[SHA256 checksums for verification]
```

## Future Enhancements (V2+)

### Advanced Distribution

- Mac App Store submission
- Microsoft Store submission
- Homebrew cask formula
- Chocolatey package
- Snap package for Linux

### Enhanced Security

- Code signing certificates
- Notarization for macOS
- EV certificate for Windows
- Reproducible builds

### Professional Features

- Silent installation options
- Enterprise deployment tools
- Custom update channels
- Offline installer packages
