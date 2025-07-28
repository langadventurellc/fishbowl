/**
 * Desktop app custom hooks exports.
 *
 * Barrel file for organizing and exporting all custom React hooks
 * used in the desktop application.
 *
 * @module hooks
 */

export { useElectronIPC } from "./useElectronIPC";
export { useDebounce } from "./useDebounce";
export { useIsCompactViewport } from "./useIsCompactViewport";
// Deprecated: use useIsCompactViewport instead
export { useIsMobile } from "./useIsMobile";
