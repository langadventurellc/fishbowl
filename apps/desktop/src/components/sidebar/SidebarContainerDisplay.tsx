import { createLoggerSync, type Conversation } from "@fishbowl-ai/shared";
import {
  ConversationViewModel,
  SidebarContainerDisplayProps,
} from "@fishbowl-ai/ui-shared";
import React, { useCallback, useState } from "react";
import { useConversations } from "../../hooks/conversations/useConversations";
import { useCreateConversation } from "../../hooks/conversations/useCreateConversation";
import { cn } from "../../lib/utils";
import { NewConversationButton } from "../chat/NewConversationButton";
import { RenameConversationModal } from "../modals/RenameConversationModal";
import { ConversationItemDisplay } from "./ConversationItemDisplay";
import { DeleteConversationModal } from "./DeleteConversationModal";
import { SidebarHeaderDisplay } from "./SidebarHeaderDisplay";

/**
 * SidebarContainerDisplay component renders the main sidebar layout wrapper
 * that handles collapsed/expanded visual states with conversation list rendering.
 */
const logger = createLoggerSync({
  context: { metadata: { component: "SidebarContainerDisplay" } },
});

export function SidebarContainerDisplay({
  collapsed = false,
  showBorder = true,
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

  // Initialize hooks for conversation management
  const {
    conversations: conversations,
    isLoading: _listLoading,
    error: _listError,
    refetch,
  } = useConversations();

  const {
    createConversation,
    isCreating,
    error: _error,
    reset: _reset,
  } = useCreateConversation();

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
      onConversationSelect?.(conversation.id);
    },
    [onConversationSelect],
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
        logger.debug("Deleting conversation", { conversationId });

        // Check if running in Electron environment
        if (!window.electronAPI?.conversations?.delete) {
          throw new Error(
            "Conversation deletion not available in current environment",
          );
        }

        await window.electronAPI.conversations.delete(conversationId);

        // Refresh conversations list
        await refetch();

        logger.debug("Conversation deleted successfully", { conversationId });
      } catch (error) {
        logger.error("Failed to delete conversation", error as Error);
        throw error;
      }
    },
    [refetch],
  );

  // Handle new conversation creation
  const handleNewConversation = async () => {
    try {
      const result = await createConversation();
      console.log("Created conversation:", result);
      // Refresh the list to show new conversation
      await refetch();
      // Automatically select the newly created conversation
      onConversationSelect?.(result.id);
    } catch (err) {
      console.error("Failed to create conversation:", err);
      // Error handling will be improved in Feature 2
    }
  };

  // Dynamic styles that need to remain as CSS properties
  const dynamicStyles: React.CSSProperties = {
    width: collapsed ? "0px" : "200px",
    backgroundColor: "var(--sidebar)",
    borderRight: showBorder ? `1px solid var(--border)` : "none",
    padding: collapsed ? "0" : "16px",
    ...style, // Custom styles take precedence
  };

  // Render self-contained sidebar when conversations are provided
  const renderSelfContainedContent = () => (
    <>
      <SidebarHeaderDisplay
        title="Conversations"
        showControls={true}
        collapsed={collapsed}
      />

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
            // Refresh conversations list to show updated title
            void refetch();
          }
        }}
      />
    </>
  );

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
        className,
      )}
      style={dynamicStyles}
    >
      {!collapsed && conversations && renderSelfContainedContent()}
    </div>
  );
}
