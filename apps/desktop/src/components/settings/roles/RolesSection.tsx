/**
 * RolesSection component displays a unified list of roles.
 *
 * Features:
 * - Single unified list view of all roles (no tab distinction)
 * - Displays sample roles data for demonstration
 * - Modal infrastructure preserved for future functionality
 * - Integration with settings modal navigation state
 * - Responsive design and accessibility compliance
 * - Edit/Delete buttons present but non-functional (logging only)
 *
 * @module components/settings/RolesSection
 */

import type {
  CustomRoleViewModel,
  RoleFormData,
  RolesSectionProps,
} from "@fishbowl-ai/ui-shared";
import { SAMPLE_ROLES } from "@fishbowl-ai/ui-shared";
import React, { useCallback, useState } from "react";
import { cn } from "../../../lib/utils";
import { RolesList } from "./RolesList";
import { RoleDeleteDialog } from "./RoleDeleteDialog";
import { RoleFormModal } from "./RoleFormModal";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "RolesSection", level: "info" },
});

export const RolesSection: React.FC<RolesSectionProps> = ({ className }) => {
  // Modal state management - centralized to ensure only one modal open
  const [selectedRole, _setSelectedRole] = useState<
    CustomRoleViewModel | undefined
  >(undefined);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formMode, _setFormMode] = useState<"create" | "edit">("create");

  // Disabled handlers - preserved for future functionality
  const handleCreateRole = useCallback(() => {
    // TODO: Will be implemented in future functionality
    logger.info("Create role clicked - not implemented yet");
  }, []);

  const handleEditRole = useCallback((role: CustomRoleViewModel) => {
    // TODO: Will be implemented in future functionality
    logger.info("Edit role clicked - not implemented yet", { roleId: role.id });
  }, []);

  const handleDeleteRole = useCallback((role: CustomRoleViewModel) => {
    // TODO: Will be implemented in future functionality
    logger.info("Delete role clicked - not implemented yet", {
      roleId: role.id,
    });
  }, []);

  // Disabled save/delete handlers for modals
  const handleSaveRole = useCallback(async (data: RoleFormData) => {
    logger.info("Save role - not implemented yet", { data });
  }, []);

  const handleConfirmDelete = useCallback(async (role: CustomRoleViewModel) => {
    logger.info("Confirm delete - not implemented yet", { roleId: role.id });
  }, []);

  return (
    <div className={cn("roles-section space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Roles</h1>
        <p className="text-muted-foreground mb-6">
          Define and configure agent roles and permissions.
        </p>
      </div>
      {/* Direct list rendering - no tabs */}
      <RolesList
        roles={SAMPLE_ROLES}
        onCreateRole={handleCreateRole}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
      />

      {/* Role creation/editing modal */}
      <RoleFormModal
        isOpen={formModalOpen}
        onOpenChange={setFormModalOpen}
        mode={formMode}
        role={selectedRole}
        onSave={handleSaveRole}
        isLoading={false}
      />

      {/* Role deletion confirmation dialog */}
      <RoleDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        role={selectedRole || null}
        onConfirm={handleConfirmDelete}
        isLoading={false}
      />
    </div>
  );
};
