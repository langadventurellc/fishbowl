# Fishbowl AI - Project Overview

## Purpose

Fishbowl AI is a desktop and mobile application for creating conversations with multiple AI agents simultaneously. Users can configure agents with unique personalities, roles, and AI models to enable dynamic brainstorming, problem-solving, and creative exploration.

## Monorepo Structure

The project is organized as a monorepo with the following structure:

### Applications

- `apps/desktop` - Electron-based desktop application with React
- `apps/mobile` - React Native with Expo mobile application

### Packages

- `packages/shared` - Shared business logic, types, utilities, and stores
- `packages/ui-theme` - Shared UI theme and styling
- `packages/eslint-config` - Shared ESLint configuration

## Key Architecture Principles

1. **Shared business logic** in `@fishbowl-ai/shared` package
2. **Platform-specific UI** in respective app directories
3. **No UI components in shared packages** (incompatible rendering systems)
4. **Clean separation** between business logic and platform code
5. **Workspace protocol** for internal dependencies using `workspace:*`
