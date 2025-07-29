/**
 * PersonalitiesSection component integrates personalities management with TabContainer.
 *
 * Features:
 * - Tab navigation between Saved and Create New tabs
 * - Unsaved changes protection when switching tabs
 * - Integration with settings modal navigation state
 * - Responsive design and accessibility compliance
 *
 * @module components/settings/PersonalitiesSection
 */

import React, { useCallback } from "react";
import { TabContainer } from "./TabContainer";
import { SavedPersonalitiesTab } from "./SavedPersonalitiesTab";
import { CreatePersonalityForm } from "./CreatePersonalityForm";
import { useConfirmationDialog } from "../../hooks/useConfirmationDialog";
import {
  useSettingsNavigation,
  useUnsavedChanges,
  type TabConfiguration,
  type Personality,
  type PersonalityFormData,
} from "@fishbowl-ai/shared";

interface PersonalitiesSectionProps {
  // Future props for settings modal integration
}

export const PersonalitiesSection: React.FC<PersonalitiesSectionProps> = () => {
  const { activeSubTab } = useSettingsNavigation();
  const { hasUnsavedChanges } = useUnsavedChanges();
  const { showConfirmation } = useConfirmationDialog();

  const handleEditPersonality = useCallback((personality: Personality) => {
    // Switch to Create New tab with pre-filled data for editing
    // This will be implemented when the form component is ready
    console.log("Edit personality:", personality);
  }, []);

  const handleClonePersonality = useCallback((personality: Personality) => {
    // Switch to Create New tab with cloned data
    console.log("Clone personality:", personality);
  }, []);

  const handleSavePersonality = useCallback((data: PersonalityFormData) => {
    // Save personality and switch back to Saved tab
    console.log("Save personality:", data);
  }, []);

  const handleCancelEditing = useCallback(() => {
    // Cancel editing and return to previous tab or Saved tab
    console.log("Cancel editing");
  }, []);

  const handleTabChange = useCallback(async () => {
    // Check for unsaved changes when leaving Create New tab
    if (activeSubTab === "create-new" && hasUnsavedChanges) {
      const shouldProceed = await showConfirmation({
        title: "Unsaved Changes",
        message: "You have unsaved changes. Do you want to discard them?",
        confirmText: "Discard Changes",
        cancelText: "Keep Editing",
      });
      if (!shouldProceed) return;
    }

    // Tab change will be handled by store via TabContainer
  }, [activeSubTab, hasUnsavedChanges, showConfirmation]);

  const tabs: TabConfiguration[] = [
    {
      id: "saved",
      label: "Saved",
      content: () => (
        <SavedPersonalitiesTab
          onEdit={handleEditPersonality}
          onClone={handleClonePersonality}
        />
      ),
    },
    {
      id: "create-new",
      label: "Create New",
      content: () => (
        <CreatePersonalityForm
          onSave={handleSavePersonality}
          onCancel={handleCancelEditing}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Personalities</h1>
        <p className="text-muted-foreground mb-6">
          Manage agent personalities and their characteristics.
        </p>
      </div>

      <TabContainer
        tabs={tabs}
        useStore={true}
        animationDuration={200}
        className="personalities-tabs"
        onTabChange={handleTabChange}
      />
    </div>
  );
};
