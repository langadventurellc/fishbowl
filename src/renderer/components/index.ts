// Error handling components
export { ErrorBoundary } from './ErrorBoundary';

// Page components
export { Home } from './Home';
export { Settings } from './Settings';
export { Chat } from './Chat';

// UI components
export { Button } from './UI/Button';
export type { ButtonProps } from './UI/Button';
export { ThemeToggle } from './UI/ThemeToggle';

// Development components
export { DevTools } from './DevTools';

// Note: Future components will be exported from here
// following the feature-based organization pattern:
// - Each component has its own directory
// - Directory contains: Component.tsx, Component.module.css, index.ts
// - index.ts exports the component for clean imports
