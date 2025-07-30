import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { CharacterCounter } from "./CharacterCounter";
import type { AgentNameInputProps } from "@fishbowl-ai/shared";

export const AgentNameInput: React.FC<AgentNameInputProps> = ({
  value,
  onChange,
  existingAgents = [],
  currentAgentId,
  disabled = false,
  maxLength = 50,
}) => {
  // Check for duplicate names (excluding current agent in edit mode)
  const isDuplicate = existingAgents.some(
    (agent) =>
      agent.name.toLowerCase() === value.toLowerCase() &&
      agent.id !== currentAgentId,
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="agent-name">Agent Name</Label>
        <CharacterCounter current={value.length} max={maxLength} />
      </div>
      <Input
        id="agent-name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter agent name..."
        disabled={disabled}
        maxLength={maxLength}
        className={isDuplicate ? "border-destructive" : ""}
      />
      {isDuplicate && (
        <p className="text-xs text-destructive">
          An agent with this name already exists
        </p>
      )}
    </div>
  );
};
