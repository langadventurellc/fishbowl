/**
 * SettingsCardProps interface for unified settings card component.
 *
 * Defines the props contract for the SettingsCard component that provides
 * standardized display and interaction patterns across all settings list items.
 * Replaces inconsistent implementations in LlmProviderCard, PersonalityCard,
 * RoleListItem, and AgentCard components with a unified interface.
 *
 * @module types/ui/components/SettingsCardProps
 */

import { ReactNode } from "react";

/**
 * Props interface for the SettingsCard component.
 *
 * This interface defines the properties required for the unified SettingsCard component
 * that standardizes display and interaction patterns across all settings list items.
 * The component provides consistent card layout, action buttons, and accessibility features.
 *
 * @example
 * ```typescript
 * // Basic settings card with string content
 * const basicCard: SettingsCardProps = {
 *   title: "OpenAI GPT-4",
 *   content: "OpenAI Provider",
 *   onEdit: () => handleEditProvider(),
 *   onDelete: () => handleDeleteProvider()
 * };
 *
 * // Settings card with React node content
 * const advancedCard: SettingsCardProps = {
 *   title: "Creative Assistant",
 *   content: <div><span>GPT-4</span><br/><small>OpenAI Provider</small></div>,
 *   onEdit: () => handleEditAgent(),
 *   onDelete: () => handleDeleteAgent(),
 *   className: "custom-agent-card"
 * };
 *
 * // Role settings card with detailed content
 * const roleCard: SettingsCardProps = {
 *   title: "Senior Developer",
 *   content: "Experienced software developer with expertise in full-stack development",
 *   onEdit: () => openRoleEditor(),
 *   onDelete: () => confirmRoleDeletion()
 * };
 * ```
 */
export interface SettingsCardProps {
  /**
   * Primary title/name to display prominently in the card header.
   *
   * This is the main identifier for the settings item, displayed with larger
   * font weight and proper heading semantics. Should be concise and descriptive.
   *
   * @example "OpenAI GPT-4", "Creative Assistant", "Senior Developer"
   */
  title: string;

  /**
   * Secondary content displayed in the card body.
   *
   * Supports both string and ReactNode for maximum flexibility. Can be used
   * for descriptions, provider names, model information, or complex layouts
   * with multiple elements. Content is displayed with appropriate text styling
   * and spacing below the title.
   *
   * @example "OpenAI Provider", <ModelDisplay model="gpt-4" provider="openai" />
   */
  content: ReactNode;

  /**
   * Edit button handler callback function.
   *
   * Called when the user clicks the edit button (Edit2 icon from lucide-react).
   * The edit button is revealed on card hover/focus and positioned in the
   * top-right action area. Should open an edit dialog or navigate to edit view.
   */
  onEdit: () => void;

  /**
   * Delete button handler callback function.
   *
   * Called when the user clicks the delete button (Trash2 icon from lucide-react).
   * The delete button is revealed on card hover/focus and positioned in the
   * top-right action area next to the edit button. Should show confirmation
   * dialog before performing deletion.
   */
  onDelete: () => void;

  /**
   * Additional CSS classes for styling customization.
   *
   * Optional className prop that allows parent components to apply custom
   * styling beyond the default card appearance. Applied to the root Card
   * component element for targeted styling modifications.
   *
   * @example "highlight-card", "compact-layout", "custom-agent-card"
   */
  className?: string;
}
