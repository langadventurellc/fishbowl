import { useSettingsPersistence } from "@fishbowl-ai/ui-shared";
import type { SettingsError } from "@fishbowl-ai/ui-shared/dist/utils/settings";
import { desktopSettingsAdapter } from "./desktopSettingsAdapter";

/**
 * Desktop-specific wrapper around useSettingsPersistence hook.
 *
 * This hook provides a convenient API for desktop components to use settings
 * persistence without having to manually pass the desktop adapter every time.
 * It automatically uses the desktop settings adapter configured for IPC communication.
 *
 * @param options - Optional configuration for the hook
 * @param options.onError - Optional callback invoked when errors occur
 * @returns Settings management interface
 *
 * @example
 * ```tsx
 * import { useDesktopSettingsPersistence } from '@/adapters';
 *
 * function SettingsComponent() {
 *   const {
 *     settings,
 *     isLoading,
 *     error,
 *     saveSettings,
 *     resetSettings
 *   } = useDesktopSettingsPersistence({
 *     onError: (error) => {
 *       console.error('Settings error:', error);
 *       toast.error(error.message);
 *     }
 *   });
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   if (!settings) return null;
 *
 *   return (
 *     <SettingsForm
 *       settings={settings}
 *       onSave={saveSettings}
 *       onReset={resetSettings}
 *     />
 *   );
 * }
 * ```
 */
export function useDesktopSettingsPersistence(options?: {
  onError?: (error: SettingsError) => void;
}) {
  return useSettingsPersistence({
    adapter: desktopSettingsAdapter,
    ...options,
  });
}
