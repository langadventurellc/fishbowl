/**
 * UI types main barrel export.
 *
 * Re-exports all UI-related TypeScript interfaces and types for the
 * conversation UI system. This provides a single entry point for
 * importing all UI types across the monorepo.
 *
 * @module types/ui
 */

// Re-export all core data interfaces
export * from "./core";

// Re-export all component prop interfaces
export * from "./components";

// Re-export all menu component prop interfaces
export * from "./menu";

// Re-export all theme-related types
export * from "./theme";
