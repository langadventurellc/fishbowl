/**
 * UI-shared package barrel export.
 *
 * Re-exports all UI-related TypeScript interfaces, types, and business logic
 * for the conversation UI system. This provides a single entry point for
 * importing all UI-related functionality across the monorepo.
 *
 * @module ui-shared
 */

// UI Types
export * from "./components";
export * from "./core";
export * from "./FontSizePreviewProps";
export * from "./menu";
export * from "./settings";
export * from "./theme";
export * from "./ThemePreviewProps";
export * from "./ValidationResultViewModel";

// Business Logic with UI Dependencies
export * from "./constants/behaviorData";
export * from "./data/predefinedRoles";
export * from "./hooks/useAgentSearch";
export * from "./hooks/useCustomRoles";
export * from "./hooks/useEnhancedTabNavigation";
export * from "./schemas/createApiKeysFormSchema";
export * from "./stores/customRolesPersistence";
export * from "./stores/customRolesStore";
export * from "./utils/getRoleById";
export * from "./utils/getRolesByCategory";
export * from "./utils/getRoleCategories";
export * from "./utils/isPredefinedRole";
export * from "./utils/isValidPredefinedRole";
export * from "./types/EnhancedTabNavigationOptions";
export * from "./types/hooks/EnhancedTabNavigationReturn";
