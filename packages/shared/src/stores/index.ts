/**
 * Main stores barrel export file.
 *
 * Exports all Zustand stores and related types from the stores directory.
 * Provides clean imports for consuming applications.
 *
 * @module stores
 */

// Settings modal store
export * from "./settings";

// Custom roles store
export { useCustomRolesStore } from "./customRolesStore";
export { customRolesPersistence } from "./customRolesPersistence";
