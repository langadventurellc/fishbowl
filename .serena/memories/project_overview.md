# Fishbowl Project Overview

## Purpose

A desktop and mobile application for creating conversations with multiple AI agents simultaneously. Configure agents with unique personalities, roles, and AI models to enable dynamic brainstorming, problem-solving, and creative exploration.

## Tech Stack

- **Monorepo**: pnpm workspace with Turbo
- **Desktop**: Electron 37.2+ with React 19.1+
- **Mobile**: React Native with Expo (React Native 0.80+, Expo SDK 53.0+)
- **Shared Logic**: TypeScript 5.8+, Zustand 5.0+
- **Testing**: Jest for unit tests, Playwright (desktop e2e), Detox (mobile e2e)
- **Database**: SQLite with platform-specific integrations
- **Styling**: Desktop uses Tailwind + shadcn/ui, Mobile uses NativeWind + Tamagui
- **Validation**: Zod 4.0+

## Key Architecture Principles

- Shared package (@fishbowl-ai/shared) contains business logic, API clients, hooks, stores, types, utils
- Platform apps contain ONLY UI components and platform-specific code
- No UI components in shared packages (React Native and web React are incompatible)
- Use bridge pattern for platform-specific features
- Follow KISS, YAGNI, SRP, DRY principles
- Files should have ≤ 400 logical LOC
- One concept/function; ≤ 20 LOC; cyclomatic complexity ≤ 5

## Current Development Phase

MVP phase - focus on functionality over optimization, no performance testing or integration testing at this point.
