/**
 * PersonalityFormModal component provides modal interface for personality creation and editing.
 *
 * Features:
 * - Modal dialog using shadcn/ui Dialog components
 * - Integration with PersonalityForm component
 * - Unsaved changes protection with confirmation dialog
 * - Keyboard shortcuts (Ctrl/Cmd+S to save, Escape to close)
 * - Proper focus management and accessibility
 * - Loading states during save operations
 *
 * @module components/settings/PersonalityFormModal
 */

import type { PersonalityFormModalProps } from "@fishbowl-ai/ui-shared";
import {
  usePersonalities,
  useUnsavedChanges,
  type PersonalityFormData,
} from "@fishbowl-ai/ui-shared";
import { PersonalitySectionDef, DiscreteValue } from "@fishbowl-ai/shared";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { PersonalityDefinitionsClient } from "../../../renderer/services/personalityDefinitionsClient";
import { SettingsFormModal } from "../common";
import { PersonalityForm, type PersonalityFormRef } from "./PersonalityForm";

export const PersonalityFormModal: React.FC<PersonalityFormModalProps> = ({
  isOpen,
  onOpenChange,
  mode,
  personality,
  onSave,
  isLoading = false,
}) => {
  const { hasUnsavedChanges } = useUnsavedChanges();
  const { personalities } = usePersonalities();

  // Personality definitions state
  const [sections, setSections] = useState<PersonalitySectionDef[]>([]);
  const [defsLoading, setDefsLoading] = useState(false);
  const [defsError, setDefsError] = useState(false);
  const [dynamicGetShort, setDynamicGetShort] = useState<
    ((traitId: string, value: DiscreteValue) => string | undefined) | undefined
  >(undefined);

  // PersonalityDefinitionsClient instance
  const [client] = useState(() => new PersonalityDefinitionsClient());

  // Form reference for reset functionality
  const formRef = useRef<PersonalityFormRef>(null);

  // Load personality definitions when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadDefinitions = async () => {
      try {
        setDefsLoading(true);
        setDefsError(false);

        const definitions = await client.getDefinitions();

        if (!isMounted) return;

        setSections(definitions.sections);

        // Build synchronous getShort function backed by in-memory maps
        const traitMaps = new Map<
          string,
          Map<DiscreteValue, string | undefined>
        >();

        definitions.sections.forEach((section) => {
          section.values.forEach((trait) => {
            const valueMaps = new Map<DiscreteValue, string | undefined>();

            // Iterate over discrete values and populate short descriptions
            const discreteValues: DiscreteValue[] = [0, 20, 40, 60, 80, 100];
            discreteValues.forEach((value) => {
              const valueKey = String(value) as keyof typeof trait.values;
              const meta = trait.values[valueKey];
              valueMaps.set(value, meta?.short);
            });

            traitMaps.set(trait.id, valueMaps);
          });
        });

        setDynamicGetShort(
          () => (traitId: string, value: DiscreteValue) =>
            traitMaps.get(traitId)?.get(value),
        );
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to load personality definitions:", error);
        setDefsError(true);
        setSections([]);
        setDynamicGetShort(undefined);
      } finally {
        if (isMounted) {
          setDefsLoading(false);
        }
      }
    };

    loadDefinitions();

    return () => {
      isMounted = false;
    };
  }, [isOpen, client]);

  // Handle form cancellation
  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Handle successful save
  const handleSave = useCallback(
    async (data: PersonalityFormData) => {
      await onSave(data);
      onOpenChange(false);
    },
    [onSave, onOpenChange],
  );

  // Get modal title based on mode
  const getModalTitle = () => {
    return mode === "create" ? "Create Personality" : "Edit Personality";
  };

  const getModalDescription = () => {
    return mode === "create"
      ? "Define a new personality with unique traits and characteristics."
      : "Update the personality name, traits, and custom instructions.";
  };

  // Get screen reader announcement
  const getAnnounceOnOpen = () => {
    const message =
      mode === "create"
        ? "Create personality dialog opened. Press Tab to navigate between fields."
        : "Edit personality dialog opened. Press Tab to navigate between fields.";
    return message;
  };

  // Handle Ctrl+S save shortcut
  const handleRequestSave = useCallback(() => {
    // Trigger form submission by dispatching submit event
    const form = document.querySelector(
      "[data-form-modal] form",
    ) as HTMLFormElement;
    if (form) {
      const submitEvent = new Event("submit", {
        cancelable: true,
        bubbles: true,
      });
      form.dispatchEvent(submitEvent);
    }
  }, []);

  return (
    <SettingsFormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={getModalTitle()}
      description={getModalDescription()}
      className="max-w-2xl max-h-[80vh] overflow-y-auto"
      initialFocusSelector="[data-personality-modal-initial-focus]"
      announceOnOpen={getAnnounceOnOpen()}
      onRequestSave={handleRequestSave}
      confirmOnClose={{
        enabled: hasUnsavedChanges && !isLoading,
        message: {
          title: "Unsaved Changes",
          body: "You have unsaved changes. Are you sure you want to close without saving?",
          confirmText: "Close Without Saving",
          cancelText: "Continue Editing",
        },
        onDiscard: () => formRef.current?.resetToInitialData(),
      }}
    >
      <PersonalityForm
        ref={formRef}
        mode={mode}
        initialData={personality}
        onSave={handleSave}
        onCancel={handleCancel}
        existingPersonalities={personalities}
        isLoading={isLoading}
        dynamicSections={sections}
        dynamicGetShort={dynamicGetShort}
        defsLoading={defsLoading}
        defsError={defsError}
      />
    </SettingsFormModal>
  );
};
