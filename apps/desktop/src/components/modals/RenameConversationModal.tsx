/**
 * RenameConversationModal component provides a dialog for renaming conversation titles.
 *
 * Features:
 * - Pre-populated text input with current conversation title
 * - Auto-focus and text selection for easy editing
 * - Loading states during update operation
 * - Keyboard shortcuts (Enter to save, Escape to cancel)
 * - Input validation (empty title prevention)
 * - Error message display with retry capability
 * - Proper accessibility and focus management
 *
 * @module components/modals/RenameConversationModal
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import type { RenameConversationModalProps } from "@fishbowl-ai/ui-shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useUpdateConversation } from "../../hooks/conversations/useUpdateConversation";

/**
 * Modal dialog for renaming conversations.
 *
 * @example
 * ```typescript
 * function ConversationManager() {
 *   const [modalOpen, setModalOpen] = useState(false);
 *   const [conversationToRename, setConversationToRename] = useState<Conversation | null>(null);
 *
 *   const handleRename = (conversation: Conversation) => {
 *     setConversationToRename(conversation);
 *     setModalOpen(true);
 *   };
 *
 *   return (
 *     <RenameConversationModal
 *       conversation={conversationToRename}
 *       open={modalOpen}
 *       onOpenChange={setModalOpen}
 *     />
 *   );
 * }
 * ```
 */
export function RenameConversationModal({
  conversation,
  open,
  onOpenChange,
}: RenameConversationModalProps): React.ReactElement {
  const { updateConversation, isUpdating, error, reset } =
    useUpdateConversation();
  const [title, setTitle] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens with new conversation
  useEffect(() => {
    if (open && conversation) {
      setTitle(conversation.title);
      setLocalError(null);
      reset(); // Clear any previous errors from the hook

      // Focus and select text after a brief delay to ensure input is rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [open, conversation, reset]);

  const handleRename = useCallback(async () => {
    if (!conversation || isUpdating) return;

    const trimmedTitle = title.trim();

    // Client-side validation
    if (!trimmedTitle) {
      setLocalError("Conversation title cannot be empty");
      return;
    }

    // No change needed
    if (trimmedTitle === conversation.title) {
      onOpenChange(false);
      return;
    }

    try {
      setLocalError(null);

      await updateConversation(conversation.id, { title: trimmedTitle });

      // Close modal on successful rename
      onOpenChange(false);
    } catch {
      // Error is handled by the hook, but we can add local error handling if needed
      // The hook error will be displayed via the error state
    }
  }, [conversation, title, updateConversation, onOpenChange, isUpdating]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && !isUpdating) {
        event.preventDefault();
        void handleRename();
      }
    },
    [handleRename, isUpdating],
  );

  const handleCancel = useCallback(() => {
    if (!isUpdating) {
      onOpenChange(false);
    }
  }, [onOpenChange, isUpdating]);

  const displayError = localError || error?.message;
  const isLoading = isUpdating;
  const canSave =
    title.trim() && title.trim() !== conversation?.title && !isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Rename Conversation</DialogTitle>
          <DialogDescription>
            Enter a new title for the conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="conversation-title">Title</Label>
            <Input
              ref={inputRef}
              id="conversation-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter conversation title"
              disabled={isLoading}
              className="w-full"
            />
          </div>

          {displayError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{displayError}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleRename} disabled={!canSave}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isLoading ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
