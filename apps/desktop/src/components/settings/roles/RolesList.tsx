/**
 * RolesList component displays all roles in a single list interface.
 *
 * Features:
 * - Single list view for all roles
 * - Static sample data (no loading states)
 * - All roles editable (no read-only restrictions)
 * - Alphabetical sorting by name
 * - Responsive design with accessibility support
 * - Memoized for performance
 *
 * @module components/settings/RolesList
 */

import type { CustomRoleViewModel } from "@fishbowl-ai/ui-shared";
import { SAMPLE_ROLES } from "@fishbowl-ai/ui-shared";
import { Plus } from "lucide-react";
import { memo, useMemo } from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { CustomRoleListItem } from "./CustomRoleListItem";

interface RolesListProps {
  onCreateRole?: () => void;
  onEditRole?: (role: CustomRoleViewModel) => void;
  onDeleteRole?: (role: CustomRoleViewModel) => void;
  className?: string;
}

export const RolesList = memo<RolesListProps>(function RolesList({
  onCreateRole = () => {},
  onEditRole = () => {},
  onDeleteRole = () => {},
  className,
}) {
  // Sort roles alphabetically by name
  const sortedRoles = useMemo(() => {
    return [...SAMPLE_ROLES].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <div className={cn("roles-list flex flex-col h-full", className)}>
      {/* Accessible heading for screen readers */}
      <h2 className="sr-only">All Roles List</h2>

      {/* Scrollable role list area */}
      <div className="flex-1 min-h-0">
        <div
          className="max-h-[var(--dt-scrollable-list-max-height)] overflow-y-auto space-y-4 pr-[var(--dt-scrollable-container-padding-right)]"
          role="list"
          aria-label={`${sortedRoles.length} roles available`}
          aria-describedby="roles-list-description"
        >
          {/* Hidden description for screen readers */}
          <div id="roles-list-description" className="sr-only">
            List of {sortedRoles.length} available roles. Use Tab to navigate
            through role items and their action buttons.
          </div>

          {sortedRoles.map((role) => (
            <div key={role.id} role="listitem">
              <CustomRoleListItem
                role={role}
                onEdit={onEditRole}
                onDelete={onDeleteRole}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Create button container - always visible at bottom */}
      <div className="pt-6 border-t border-border mt-6">
        <Button
          onClick={onCreateRole}
          className="w-full gap-2"
          size="lg"
          aria-label="Create a new role"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>
    </div>
  );
});
