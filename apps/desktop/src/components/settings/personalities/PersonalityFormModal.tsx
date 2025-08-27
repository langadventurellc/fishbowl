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
import { useConfirmationDialog } from "../../../hooks/useConfirmationDialog";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { announceToScreenReader } from "../../../utils/announceToScreenReader";
import { ConfirmationDialog } from "../../ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { PersonalityForm, type PersonalityFormRef } from "./PersonalityForm";

export const PersonalityFormModal: React.FC<PersonalityFormModalProps> = ({
  isOpen,
  onOpenChange,
  mode,
  personality,
  onSave,
  isLoading = false,
}) => {
  const { showConfirmation, confirmationDialogProps } = useConfirmationDialog();
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

  // Focus trap setup
  const triggerRef = useRef<HTMLElement | null>(null);
  const formRef = useRef<PersonalityFormRef>(null);
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    restoreFocus: true,
    initialFocusSelector: "[data-personality-modal-initial-focus]",
  });

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

  // Store the trigger element when modal opens and announce to screen readers
  useEffect(() => {
    if (isOpen && document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;

      // Announce modal state to screen readers
      const message =
        mode === "create"
          ? "Create personality dialog opened. Press Tab to navigate between fields."
          : "Edit personality dialog opened. Press Tab to navigate between fields.";
      announceToScreenReader(message, "polite");
    }
  }, [isOpen, mode]);

  // Announce loading and error state changes
  useEffect(() => {
    if (!isOpen) return;

    if (defsLoading) {
      announceToScreenReader("Loading personality definitions...", "polite");
    } else if (defsError) {
      announceToScreenReader(
        "Error loading personality definitions. Some features may be unavailable.",
        "assertive",
      );
    } else if (sections.length > 0) {
      announceToScreenReader(
        "Personality definitions loaded successfully.",
        "polite",
      );
    }
  }, [isOpen, defsLoading, defsError, sections.length]);

  // Handle modal close with unsaved changes protection
  const handleOpenChange = useCallback(
    async (open: boolean) => {
      if (!open && hasUnsavedChanges) {
        const confirmed = await showConfirmation({
          title: "Unsaved Changes",
          message:
            "You have unsaved changes. Are you sure you want to close without saving?",
          confirmText: "Close Without Saving",
          cancelText: "Continue Editing",
          variant: "destructive",
        });
        if (!confirmed) return;

        // Reset form to initial data if user confirmed they want to discard changes
        formRef.current?.resetToInitialData();
      }
      onOpenChange(open);
    },
    [hasUnsavedChanges, showConfirmation, onOpenChange],
  );

  // Handle form cancellation
  const handleCancel = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  // Handle successful save
  const handleSave = useCallback(
    async (data: PersonalityFormData) => {
      await onSave(data);
      onOpenChange(false);
    },
    [onSave, onOpenChange],
  );

  // Keyboard shortcuts (Escape handled in DialogContent onKeyDown)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        // Trigger form submission
        const form = document.querySelector(
          ".personality-form-modal form",
        ) as HTMLFormElement;
        if (form) {
          const submitEvent = new Event("submit", {
            cancelable: true,
            bubbles: true,
          });
          form.dispatchEvent(submitEvent);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={containerRef}
        className="personality-form-modal max-w-2xl max-h-[80vh] overflow-y-auto"
        onOpenAutoFocus={(e) => {
          // Prevent Radix's default focus behavior
          e.preventDefault();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            onOpenChange(false);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Personality" : "Edit Personality"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define a new personality with unique traits and characteristics."
              : "Update the personality name, traits, and custom instructions."}
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>

      {/* Confirmation Dialog for unsaved changes */}
      {confirmationDialogProps && (
        <ConfirmationDialog {...confirmationDialogProps} />
      )}
    </Dialog>
  );
};
