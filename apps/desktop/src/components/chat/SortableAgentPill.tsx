import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { AgentPillProps } from "@fishbowl-ai/ui-shared";
import { AgentPill } from "./AgentPill";

interface SortableAgentPillProps extends AgentPillProps {
  id: string;
}

export function SortableAgentPill({ id, ...props }: SortableAgentPillProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AgentPill {...props} />
    </div>
  );
}
