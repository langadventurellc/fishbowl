/**
 * RoleListItem component displays basic role information.
 * Uses SettingsCard for consistent styling and interaction patterns.
 *
 * @module components/settings/RoleListItem
 */

import type { RoleListItemProps } from "@fishbowl-ai/ui-shared";
import { memo } from "react";
import { truncateDescription } from "../../../utils";
import { SettingsCard } from "../../ui/SettingsCard";

export const RoleListItem = memo<RoleListItemProps>(function RoleListItem({
  role,
  onEdit,
  onDelete,
  className,
}) {
  return (
    <SettingsCard
      title={role.name}
      content={truncateDescription(role.description, 120)}
      onEdit={() => onEdit(role)}
      onDelete={() => onDelete(role)}
      className={className}
    />
  );
});
