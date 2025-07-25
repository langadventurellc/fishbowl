---
kind: task
id: T-write-integration-tests-for
title: Write integration tests for Tailwind CSS v4 functionality
status: open
priority: normal
prerequisites:
  - T-add-proper-css-layer
created: "2025-07-25T17:02:32.285516"
updated: "2025-07-25T17:02:32.285516"
schema_version: "1.1"
parent: F-tailwind-css-v4-setup-and
---

# Write Integration Tests for Tailwind CSS v4 Functionality

## Context

Create comprehensive integration tests to validate Tailwind CSS v4 setup, including dual CSS variable/utility system functionality, dark mode switching, build process validation, and visual regression testing.

## Implementation Requirements

### Test Coverage Areas

- **Build Integration**: Verify Vite processes Tailwind CSS correctly
- **Dual System**: Test both CSS variables and Tailwind utilities produce identical results
- **Dark Mode**: Validate theme switching affects both systems correctly
- **CSS Layer Order**: Confirm proper cascade precedence
- **Production Build**: Verify optimization and purging work correctly

### Test Implementation Approach

Create integration tests using existing Playwright setup in `tests/desktop/`:

- **Component rendering tests**: Verify Tailwind utilities render correctly
- **Theme switching tests**: Test dark/light mode affects both variable and utility styles
- **Build process tests**: Validate CSS generation and optimization
- **Visual regression tests**: Compare before/after styling to ensure no changes

### Test File Structure

```
tests/desktop/
├── tailwind-integration.spec.ts    # Main integration tests
├── tailwind-theme-switching.spec.ts # Dark mode tests
└── tailwind-build-validation.spec.ts # Build process tests
```

## Detailed Acceptance Criteria

### Integration Test Coverage

✅ **CSS Variable Access**: Test `var(--background)` resolves to expected values  
✅ **Tailwind Utility Function**: Test `bg-background` produces identical styling  
✅ **Dark Mode Switching**: Verify both systems update when theme toggles  
✅ **Layer Precedence**: Confirm utilities override base/component styles  
✅ **Build Optimization**: Test production build includes only used styles

### Visual Regression Testing

✅ **Component Consistency**: Screenshot comparison shows no visual changes  
✅ **Theme Switching**: Light/dark mode appearance identical to pre-Tailwind  
✅ **Typography Preservation**: Font rendering remains pixel-perfect  
✅ **Layout Stability**: No layout shifts or dimensional changes  
✅ **Animation Continuity**: All transitions and animations work correctly

### Build Process Validation

✅ **CSS Generation**: Verify Tailwind CSS properly included in build output  
✅ **Purge Efficiency**: Unused utilities removed from production bundle  
✅ **Bundle Size**: CSS bundle size reasonable compared to previous approach  
✅ **Hot Reload**: Development changes update correctly without full refresh

### Error Handling Tests

✅ **Invalid Utilities**: Test behavior with non-existent Tailwind classes  
✅ **Build Errors**: Verify clear error messages for configuration issues  
✅ **CSS Parsing**: Test handling of malformed CSS or import issues

## Testing Requirements

### Test Environment Setup

- Use existing Playwright test infrastructure
- Leverage component showcase pages for visual testing
- Create isolated test components for specific functionality validation
- Configure screenshot comparison with reasonable tolerance

### Automated Test Execution

- Tests run as part of `pnpm test:e2e:desktop` command
- Include in CI pipeline for regression detection
- Generate test reports with clear pass/fail indicators
- Provide actionable error messages for failures

### Performance Testing

- Measure CSS bundle size before/after Tailwind integration
- Validate hot reload performance remains within acceptable bounds
- Test build time impact stays under 10% increase
- Monitor memory usage during development and build processes

## Security Considerations

### Test Security

- **No Sensitive Data**: Tests don't expose credentials or secrets
- **Safe Test Content**: Use only test data in CSS and component tests
- **Build Validation**: Verify build process doesn't leak sensitive information

## Performance Requirements

### Test Performance

- **Execution Time**: Integration tests complete within reasonable time
- **Resource Usage**: Tests don't consume excessive system resources
- **Parallel Execution**: Tests can run concurrently with other test suites

## Dependencies

- **Prerequisites**: T-add-proper-css-layer (complete CSS implementation)
- **Test Infrastructure**: Existing Playwright setup in `tests/desktop/`
- **Relationship**: Validates functionality from all previous implementation tasks

## Success Indicators

- All integration tests pass consistently
- Visual regression tests show no unintended changes
- Build process tests validate optimization works correctly
- Dark mode tests confirm both CSS variable and utility systems update properly
- Performance tests verify acceptable resource usage

## Technical Implementation Notes

### Test Strategy

- Focus on integration between CSS variables and Tailwind utilities
- Test the boundaries between different CSS layers
- Validate that existing component behavior is preserved
- Ensure build optimizations work correctly

### Test Data

- Use existing component showcase for visual regression testing
- Create minimal test components for specific functionality validation
- Test both light and dark theme variations
- Include edge cases like custom CSS properties and complex selectors

## Maintenance Considerations

- Tests should be maintainable as Tailwind utilities are gradually adopted
- Include clear documentation for adding new CSS integration tests
- Design tests to be resilient to minor visual changes
- Provide clear failure diagnostics for debugging issues

### Log
