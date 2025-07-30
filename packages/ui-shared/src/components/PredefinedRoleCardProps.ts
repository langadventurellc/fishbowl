/**
 * PredefinedRoleCard component props interface.
 *
 * Defines the properties for the PredefinedRoleCard component which displays
 * individual predefined role information in a card format.
 *
 * @module types/ui/components/PredefinedRoleCardProps
 */

import type { PredefinedRole } from "../settings/PredefinedRole";

export interface PredefinedRoleCardProps {
  role: PredefinedRole;
  className?: string;
}
