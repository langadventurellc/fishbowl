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
import { UserPlus, Plus, AlertCircle, RotateCcw, X } from "lucide-react";
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
  const isSaving = useRolesStore((state) => state.isSaving);

  // Subscribe to store methods
  const createRole = useRolesStore((state) => state.createRole);
  const updateRole = useRolesStore((state) => state.updateRole);
  const deleteRole = useRolesStore((state) => state.deleteRole);
  const clearError = useRolesStore((state) => state.clearError);
  const retryLastOperation = useRolesStore((state) => state.retryLastOperation);

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

  // Helper to detect which fields changed for verification and logging
  const getChangedFields = useCallback(
    (original: RoleViewModel, updated: RoleFormData): string[] => {
      const changed: string[] = [];

      if (original.name !== updated.name) changed.push("name");
      if (original.description !== updated.description)
        changed.push("description");
      if (original.systemPrompt !== updated.systemPrompt)
        changed.push("systemPrompt");

      return changed;
    },
    [],
  );

  // Real save handler using store operations
  const handleSaveRole = useCallback(
    async (data: RoleFormData) => {
      logger.info("Saving role", {
        mode: formMode,
        roleId: selectedRole?.id,
      });

      try {
        // Clear any existing errors
        clearError();

        if (formMode === "create") {
          // Create new role
          const newRoleId = createRole(data);

          if (newRoleId) {
            logger.info("Role created successfully", { roleId: newRoleId });
            // Close modal only on successful creation
            setFormModalOpen(false);
            setSelectedRole(undefined);
          } else {
            // Creation failed - error is already set in store
            logger.warn("Role creation failed - name might not be unique");
          }
        } else if (selectedRole?.id) {
          // Track changes for performance measurement and verification
          const startTime = performance.now();
          const changedFields = getChangedFields(selectedRole, data);

          // Update existing role
          updateRole(selectedRole.id, data);

          // Check if update succeeded by checking error state
          const currentError = useRolesStore.getState().error;
          const updateTime = performance.now() - startTime;

          if (!currentError?.message) {
            // Verify timestamp was updated
            const updatedRole = useRolesStore
              .getState()
              .roles.find((r) => r.id === selectedRole.id);
            const timestampUpdated =
              updatedRole && updatedRole.updatedAt && selectedRole.updatedAt
                ? new Date(updatedRole.updatedAt) >
                  new Date(selectedRole.updatedAt)
                : false;

            logger.info("Role updated successfully", {
              roleId: selectedRole.id,
              updateTime: `${updateTime.toFixed(2)}ms`,
              fieldsChanged: changedFields,
              timestampUpdated,
              changedFieldCount: changedFields.length,
            });

            // Close modal only on successful update
            setFormModalOpen(false);
            setSelectedRole(undefined);
          } else {
            logger.warn("Role update failed", {
              error: currentError.message,
              updateTime: `${updateTime.toFixed(2)}ms`,
              attemptedChanges: changedFields,
            });
          }
        }
      } catch (error) {
        // Handle unexpected errors
        logger.error(
          "Failed to save role",
          error instanceof Error ? error : new Error(String(error)),
        );
        // Keep modal open on error
      }
    },
    [
      formMode,
      selectedRole,
      createRole,
      updateRole,
      clearError,
      getChangedFields,
    ],
  );

  const handleConfirmDelete = useCallback(
    async (role: RoleViewModel) => {
      logger.info("Deleting role", {
        roleId: role.id,
        roleName: role.name,
      });

      try {
        // Clear any existing errors
        clearError();

        // Perform the actual deletion
        deleteRole(role.id);

        // Check if deletion succeeded by checking error state
        const currentError = useRolesStore.getState().error;
        if (!currentError?.message) {
          logger.info("Role deleted successfully", {
            roleId: role.id,
            roleName: role.name,
          });
          // Close dialog only on successful deletion
          setDeleteDialogOpen(false);
          setSelectedRole(undefined);
        } else {
          logger.warn("Role deletion failed", {
            error: currentError.message,
            roleId: role.id,
          });
          // Keep dialog open on error
        }
      } catch (error) {
        // Handle unexpected errors
        logger.error(
          "Failed to delete role",
          error instanceof Error ? error : new Error(String(error)),
        );
        // Keep dialog open on error
      }
    },
    [deleteRole, clearError],
  );

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
      {error?.message && (
        <div
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive mb-1">
                    {error.operation
                      ? `${error.operation.charAt(0).toUpperCase() + error.operation.slice(1)} Failed`
                      : "Error"}
                  </p>
                  <p className="text-sm text-destructive/80">{error.message}</p>
                  {error.retryCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Retry attempt {error.retryCount}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {error.isRetryable && error.operation && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryLastOperation}
                    className="h-7 text-xs border-destructive/20 text-destructive hover:bg-destructive/10"
                    disabled={isSaving || isLoading}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </div>
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
        isLoading={isSaving}
      />

      {/* Role deletion confirmation dialog */}
      <RoleDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        role={selectedRole || null}
        onConfirm={handleConfirmDelete}
        isLoading={isSaving}
      />
    </div>
  );
};
