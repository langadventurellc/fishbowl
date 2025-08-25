import {
  ConversationLayoutDisplay,
  ConversationScreenDisplay,
} from "../components/layout";

export default function LayoutShowcase() {
  return (
    <ConversationScreenDisplay>
      <ConversationLayoutDisplay defaultSidebarCollapsed={false} />
    </ConversationScreenDisplay>
  );
}
