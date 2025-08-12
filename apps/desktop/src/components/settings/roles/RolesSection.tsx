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
import { useRolesStore } from "@fishbowl-ai/ui-shared";
import React, { useCallback, useState, useMemo } from "react";
import { UserPlus, Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { RolesList } from "./RolesList";
import { RoleDeleteDialog } from "./RoleDeleteDialog";
import { RoleFormModal } from "./RoleFormModal";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "RolesSection", level: "info" },
});

export const RolesSection: React.FC<RolesSectionProps> = ({ className }) => {
  // Subscribe to store state
  const roles = useRolesStore((state) => state.roles);
  const isLoading = useRolesStore((state) => state.isLoading);
  const error = useRolesStore((state) => state.error);

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

  // Render empty state when no roles exist
  const renderEmptyState = useMemo(() => {
    if (!isLoading && roles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">
            No roles configured
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-md leading-relaxed">
            Create your first role to define custom agent behaviors and
            personalities
          </p>
          <Button
            onClick={handleCreateRole}
            className="gap-2"
            aria-label="Create your first role"
          >
            <Plus className="h-4 w-4" />
            Create First Role
          </Button>
        </div>
      );
    }
    return null;
  }, [isLoading, roles.length, handleCreateRole]);

  // Early return for loading state
  if (isLoading) {
    return (
      <div className={cn("roles-section space-y-6", className)}>
        <div>
          <h1 className="text-2xl font-bold mb-2">Roles</h1>
          <p className="text-muted-foreground mb-6">
            Define and configure agent roles and permissions.
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div
              className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"
              aria-label="Loading roles..."
            />
            <p className="text-sm text-muted-foreground">Loading roles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("roles-section space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Roles</h1>
        <p className="text-muted-foreground mb-6">
          Define and configure agent roles and permissions.
        </p>
      </div>

      {/* Error state display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      )}

      {/* Conditionally render empty state or roles list */}
      {renderEmptyState || (
        <RolesList
          roles={roles}
          onCreateRole={handleCreateRole}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
        />
      )}

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
