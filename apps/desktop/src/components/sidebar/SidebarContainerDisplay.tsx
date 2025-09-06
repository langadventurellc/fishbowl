import { createLoggerSync, type Conversation } from "@fishbowl-ai/shared";
import {
  ConversationViewModel,
  SidebarContainerDisplayProps,
  useConversationStore,
} from "@fishbowl-ai/ui-shared";
import React, { useCallback, useState } from "react";
import { cn } from "../../lib/utils";
import { NewConversationButton } from "../chat/NewConversationButton";
import { RenameConversationModal } from "../modals/RenameConversationModal";
import { ConversationItemDisplay } from "./ConversationItemDisplay";
import { DeleteConversationModal } from "./DeleteConversationModal";

/**
 * SidebarContainerDisplay component renders the main sidebar layout wrapper
 * that handles collapsed/expanded visual states with conversation list rendering.
 */
const logger = createLoggerSync({
  context: { metadata: { component: "SidebarContainerDisplay" } },
});

export function SidebarContainerDisplay({
  collapsed = false,
  selectedConversationId,
  onConversationSelect,
  className = "",
  style = {},
}: SidebarContainerDisplayProps) {
  // Modal state for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] =
    useState<ConversationViewModel | null>(null);

  // Modal state for rename
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [conversationToRename, setConversationToRename] =
    useState<Conversation | null>(null);

  // Initialize store for conversation management
  const {
    conversations,
    loading,
    error,
    selectConversation,
    createConversationAndSelect,
    loadConversations,
  } = useConversationStore();

  // Backward compatibility mapping
  const isCreating = loading.sending; // Store uses 'sending' for creation operations
  const _isLoading = loading.conversations;
  const _listError = error.conversations;

  // Format timestamp as relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  // Map database conversations to UI format
  const mapConversationsToViewModel = (convs: typeof conversations) => {
    return convs.map((conv) => ({
      id: conv.id,
      name: conv.title,
      lastActivity: formatRelativeTime(conv.updated_at),
      isActive: conv.id === selectedConversationId,
    }));
  };

  const conversationsToDisplay = mapConversationsToViewModel(conversations);

  // Handle conversation selection
  const handleConversationSelect = useCallback(
    (conversation: ConversationViewModel) => {
      selectConversation(conversation.id);
      onConversationSelect?.(conversation.id);
    },
    [selectConversation, onConversationSelect],
  );

  // Handle delete conversation with modal
  const handleDeleteClick = useCallback(
    (conversation: ConversationViewModel) => {
      setConversationToDelete(conversation);
      setDeleteModalOpen(true);
    },
    [],
  );

  // Handle rename conversation with modal
  const handleRenameClick = useCallback(
    (conversation: ConversationViewModel) => {
      // Convert ConversationViewModel to Conversation for the modal
      const fullConversation = conversations.find(
        (c) => c.id === conversation.id,
      );
      if (fullConversation) {
        setConversationToRename(fullConversation);
        setRenameModalOpen(true);
      }
    },
    [conversations],
  );

  const handleDeleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        logger.debug("Deleting conversation", {
          conversationId,
          isActive: conversationId === selectedConversationId,
        });

        // Check if running in Electron environment
        if (!window.electronAPI?.conversations?.delete) {
          throw new Error(
            "Conversation deletion not available in current environment",
          );
        }

        await window.electronAPI.conversations.delete(conversationId);

        // Clear active conversation selection if deleting the currently selected conversation
        if (conversationId === selectedConversationId) {
          logger.debug(
            "Clearing active conversation selection after deletion",
            { conversationId },
          );
          selectConversation(null);
        }

        // Use store action instead of manual refetch
        await loadConversations();

        logger.debug("Conversation deleted successfully", { conversationId });
      } catch (error) {
        logger.error("Failed to delete conversation", error as Error);
        throw error;
      }
    },
    [loadConversations, selectedConversationId, selectConversation], // Add selectConversation to dependencies
  );

  // Handle new conversation creation
  const handleNewConversation = async () => {
    try {
      await createConversationAndSelect();
      // Store automatically handles list refresh and selection - no manual refetch needed
    } catch (err) {
      console.error("Failed to create conversation:", err);
      // Error handling will be improved in Feature 2
    }
  };

  // Dynamic styles that need to remain as CSS properties
  const dynamicStyles: React.CSSProperties = {
    width: collapsed ? "0px" : "200px",
    padding: collapsed ? "0" : "16px",
    paddingTop: !collapsed ? "48px" : "0",
    ...style, // Custom styles take precedence
  };

  // Render self-contained sidebar when conversations are provided
  const renderSelfContainedContent = () => (
    <>
      {/* Conversation items with interactive behavior */}
      <div className="flex flex-1 flex-col gap-1 min-h-[120px]">
        {conversationsToDisplay.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">
            No conversations yet
          </div>
        ) : (
          conversationsToDisplay.map((conv, index) => (
            <ConversationItemDisplay
              key={index}
              conversation={conv}
              appearanceState={conv.isActive ? "active" : "inactive"}
              showUnreadIndicator={false}
              onClick={() => handleConversationSelect(conv)}
              onRename={() => handleRenameClick(conv)}
              onDelete={() => handleDeleteClick(conv)}
            />
          ))
        )}
      </div>

      <div className="mt-auto">
        <NewConversationButton
          onClick={handleNewConversation}
          loading={isCreating}
          disabled={isCreating}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {conversationToDelete && (
        <DeleteConversationModal
          conversation={conversationToDelete}
          onDelete={handleDeleteConversation}
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
        />
      )}

      {/* Rename Conversation Modal */}
      <RenameConversationModal
        conversation={conversationToRename}
        open={renameModalOpen}
        onOpenChange={(open) => {
          setRenameModalOpen(open);
          if (!open) {
            setConversationToRename(null);
            // Use store action instead of manual refetch
            void loadConversations();
          }
        }}
      />
    </>
  );

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-sidebar h-full",
        className,
      )}
      style={dynamicStyles}
    >
      {!collapsed && conversations && renderSelfContainedContent()}
    </div>
  );
}
