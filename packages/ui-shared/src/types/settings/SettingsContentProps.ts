/**
 * Props for settings content component
 *
 * @module types/ui/components/SettingsContentProps
 */

export interface SettingsContentProps {
  activeSection: string;
  className?: string;
  contentId?: string; // New prop for ARIA relationships
}
