# Desktop E2E Tests

This directory contains end-to-end tests for the desktop application using WebdriverIO.

## Structure

- `features/` - Test feature files
- `support/` - Test support utilities and helpers

## Usage

Tests will be run using:

```bash
pnpm test:e2e:desktop
```

## Setup

WebdriverIO configuration will be added in `wdio.conf.ts` when implementing desktop testing.
