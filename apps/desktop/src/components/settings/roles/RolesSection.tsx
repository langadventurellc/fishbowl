/**
 * RolesSection component integrates roles management with TabContainer.
 *
 * Features:
 * - Tab navigation between Predefined and Custom roles
 * - Centralized modal state management for CRUD operations
 * - Integration with settings modal navigation state
 * - Responsive design and accessibility compliance
 * - Only one modal open at a time for optimal UX
 *
 * @module components/settings/RolesSection
 */

import type {
  CustomRoleViewModel,
  RoleFormData,
  RolesSectionProps,
  TabConfiguration,
} from "@fishbowl-ai/ui-shared";
import { useCustomRoles } from "@fishbowl-ai/ui-shared";
import React, { useCallback, useState } from "react";
import { cn } from "../../../lib/utils";
import { TabContainer } from "../TabContainer";
import { CustomRolesTab } from "./CustomRolesTab";
import { PredefinedRolesTab } from "./PredefinedRolesTab";
import { RoleDeleteDialog } from "./RoleDeleteDialog";
import { RoleFormModal } from "./RoleFormModal";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "RolesSection", level: "info" },
});

export const RolesSection: React.FC<RolesSectionProps> = ({ className }) => {
  // Modal state management - centralized to ensure only one modal open
  const [selectedRole, setSelectedRole] = useState<
    CustomRoleViewModel | undefined
  >(undefined);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Store operations
  const { createRole, updateRole, deleteRole, isLoading } = useCustomRoles();

  // CRUD operation handlers
  const handleCreateRole = useCallback(() => {
    setFormMode("create");
    setSelectedRole(undefined);
    setDeleteDialogOpen(false); // Ensure only one modal open
    setFormModalOpen(true);
  }, []);

  const handleEditRole = useCallback((role: CustomRoleViewModel) => {
    setFormMode("edit");
    setSelectedRole(role);
    setDeleteDialogOpen(false); // Ensure only one modal open
    setFormModalOpen(true);
  }, []);

  const handleDeleteRole = useCallback((role: CustomRoleViewModel) => {
    setSelectedRole(role);
    setFormModalOpen(false); // Ensure only one modal open
    setDeleteDialogOpen(true);
  }, []);

  const handleSaveRole = useCallback(
    async (data: RoleFormData) => {
      try {
        if (formMode === "create") {
          await createRole(data);
        } else if (selectedRole) {
          await updateRole(selectedRole.id, data);
        }
        // Modal will close automatically on success
        setFormModalOpen(false);
        setSelectedRole(undefined);
      } catch (error) {
        // Error handling - modal stays open for retry
        logger.error("Failed to save role", error as Error);
      }
    },
    [formMode, selectedRole, createRole, updateRole],
  );

  const handleConfirmDelete = useCallback(
    async (role: CustomRoleViewModel) => {
      try {
        await deleteRole(role.id);
        setDeleteDialogOpen(false);
        setSelectedRole(undefined);
      } catch (error) {
        // Error handling - dialog stays open for retry
        logger.error("Failed to delete role", error as Error);
      }
    },
    [deleteRole],
  );

  // Tab configuration with handler injection
  const tabs: TabConfiguration[] = [
    {
      id: "predefined",
      label: "Predefined",
      content: () => <PredefinedRolesTab />,
    },
    {
      id: "custom",
      label: "Custom",
      content: () => (
        <CustomRolesTab
          onCreateRole={handleCreateRole}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
        />
      ),
    },
  ];

  return (
    <div className={cn("roles-section space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Roles</h1>
        <p className="text-muted-foreground mb-6">
          Define and configure agent roles and permissions.
        </p>
      </div>
      <TabContainer
        tabs={tabs}
        useStore={true}
        animationDuration={200}
        className="roles-tabs"
      />

      {/* Role creation/editing modal */}
      <RoleFormModal
        isOpen={formModalOpen}
        onOpenChange={setFormModalOpen}
        mode={formMode}
        role={selectedRole}
        onSave={handleSaveRole}
        isLoading={isLoading}
      />

      {/* Role deletion confirmation dialog */}
      <RoleDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        role={selectedRole || null}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  );
};
