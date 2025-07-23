# Fishbowl Mobile App Assets

This directory contains the mobile app's visual assets used in the build process.

## Asset Requirements

### App Icon (icon.png)

- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Usage**: Main app icon for iOS and Android
- **Branding**: Should feature Fishbowl logo/branding

### Adaptive Icon (adaptive-icon.png)

- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Usage**: Android adaptive icon foreground
- **Requirements**: Must fit within safe area (center 720x720)

### Splash Screen (splash-icon.png)

- **Size**: 1284x2778 pixels or similar high resolution
- **Format**: PNG with transparency
- **Usage**: App launch screen
- **Branding**: Should show Fishbowl branding on loading

### Favicon (favicon.png)

- **Size**: 48x48 pixels minimum
- **Format**: PNG
- **Usage**: Web app favicon when exported to web
- **Branding**: Simple Fishbowl icon/logo

## Build Integration

These assets are automatically processed by Expo during the build process:

- **iOS**: Icons are resized to all required iOS app icon sizes
- **Android**: Icons are processed into appropriate densities and adaptive icon layers
- **Web**: Favicon is used for web exports

## Asset Guidelines

1. **Consistency**: All assets should use consistent Fishbowl branding
2. **High Quality**: Use vector-based designs when possible for crisp scaling
3. **Transparency**: App icon and splash should support transparency
4. **Testing**: Test icons on both light and dark backgrounds
5. **Platform Standards**: Follow iOS and Android design guidelines

## Updating Assets

When updating assets:

1. Replace the files in this directory
2. Clear Expo cache: `expo start --clear`
3. Test on both iOS and Android
4. Verify web export appearance
