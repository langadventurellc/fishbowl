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
  RoleViewModel,
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
  const [selectedRole, setSelectedRole] = useState<RoleViewModel | undefined>(
    undefined,
  );
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Modal opening handlers - opens modals with appropriate data
  const handleCreateRole = useCallback(() => {
    logger.info("Opening create role modal");
    setFormMode("create");
    setSelectedRole(undefined);
    setDeleteDialogOpen(false); // Ensure only one modal open
    setFormModalOpen(true);
  }, []);

  const handleEditRole = useCallback((role: RoleViewModel) => {
    logger.info("Opening edit role modal", {
      roleId: role.id,
      roleName: role.name,
    });
    setFormMode("edit");
    setSelectedRole(role);
    setDeleteDialogOpen(false); // Ensure only one modal open
    setFormModalOpen(true);
  }, []);

  const handleDeleteRole = useCallback((role: RoleViewModel) => {
    logger.info("Opening delete confirmation dialog", {
      roleId: role.id,
      roleName: role.name,
    });
    setSelectedRole(role);
    setFormModalOpen(false); // Ensure only one modal open
    setDeleteDialogOpen(true);
  }, []);

  // Simulated save/delete handlers for modals
  const handleSaveRole = useCallback(
    async (data: RoleFormData) => {
      logger.info("Save role clicked (functionality disabled)", {
        mode: formMode,
        data,
      });

      // Simulate a brief processing delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Close modal and reset state to simulate success
      setFormModalOpen(false);
      setSelectedRole(undefined);

      // Log success simulation
      logger.info(
        `Role ${formMode === "create" ? "creation" : "update"} simulated successfully`,
      );
    },
    [formMode],
  );

  const handleConfirmDelete = useCallback(async (role: RoleViewModel) => {
    logger.info("Delete role confirmed (functionality disabled)", {
      roleId: role.id,
      roleName: role.name,
    });

    // Simulate a brief processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Close dialog and reset state to simulate success
    setDeleteDialogOpen(false);
    setSelectedRole(undefined);

    // Log success simulation
    logger.info("Role deletion simulated successfully");
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
