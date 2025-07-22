# Mobile App (Future)

This directory is reserved for a future mobile application.

## Current Status

The mobile app has been temporarily removed from the project structure. While Tauri has introduced mobile support, it is still considered immature for production use.

## Future Plans

When Tauri Mobile matures sufficiently, we may implement the mobile app using Tauri. Alternatively, we may consider React Native if cross-platform requirements necessitate it.

The shared architecture (`@fishbowl-ai/shared` package) has been designed to support multiple platforms, so business logic and state management will be reusable when we do implement mobile support.

## Architecture Considerations

- Business logic remains in `@fishbowl-ai/shared`
- Platform-specific UI components will be implemented here when ready
- Bridge pattern will be used for platform-specific features
- State management via Zustand stores will be shared across platforms
