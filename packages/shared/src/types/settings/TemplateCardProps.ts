/**
 * Template card component props for displaying agent templates
 *
 * @module types/settings/TemplateCardProps
 */
import type { AgentTemplate } from "./AgentTemplate";

export interface TemplateCardProps {
  /** Template data to display */
  template: AgentTemplate;
  /** Callback when Use Template button is clicked */
  onUseTemplate?: (templateId: string) => void;
  /** Additional CSS classes */
  className?: string;
}
