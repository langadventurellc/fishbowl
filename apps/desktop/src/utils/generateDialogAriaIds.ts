import type { DialogAriaAttributes } from "./types";

/**
 * Generates consistent ARIA IDs for dialog components
 * Creates a structured set of IDs for proper ARIA relationships
 */
export function generateDialogAriaIds(baseId: string): DialogAriaAttributes {
  return {
    titleId: `${baseId}-title`,
    descriptionId: `${baseId}-description`,
    contentId: `${baseId}-content`,
    navigationId: `${baseId}-navigation`,
    mainId: `${baseId}-main`,
    announcementId: `${baseId}-announcements`,
  };
}
