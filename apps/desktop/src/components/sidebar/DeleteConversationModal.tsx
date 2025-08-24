import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ConversationViewModel } from "@fishbowl-ai/ui-shared";
import { Trash2 } from "lucide-react";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "DeleteConversationModal" } },
});

interface DeleteConversationModalProps {
  conversation: ConversationViewModel;
  onDelete: (id: string) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteConversationModal: React.FC<
  DeleteConversationModalProps
> = ({ conversation, onDelete, open, onOpenChange }) => {
  const handleDelete = async () => {
    try {
      await onDelete(conversation.id);
      onOpenChange(false);
    } catch (error) {
      logger.error("Failed to delete conversation", error as Error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete "{conversation.name}"? This will
            permanently delete all messages and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
