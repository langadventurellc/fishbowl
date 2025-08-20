import React from "react";
import { useRolesStore, type RoleSelectProps } from "@fishbowl-ai/ui-shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../../ui/button";

export const RoleSelect: React.FC<RoleSelectProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Select a role",
}) => {
  const roles = useRolesStore((state) => state.roles);
  const isLoading = useRolesStore((state) => state.isLoading);
  const error = useRolesStore((state) => state.error);
  const retryLastOperation = useRolesStore((state) => state.retryLastOperation);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 p-2 border rounded-md bg-muted/50"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading roles...</span>
      </div>
    );
  }

  // Error state
  if (error && error.message) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md border-destructive/50 bg-destructive/10">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive flex-1">
          Failed to load roles: {error.message}
        </span>
        {error.isRetryable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={retryLastOperation}
            className="h-auto p-1"
            aria-label="Retry loading roles"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (!roles || roles.length === 0) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
        <span className="text-sm text-muted-foreground">
          No roles available
        </span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label="Select role">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            <div className="flex flex-col">
              <span>{role.name}</span>
              {role.description && (
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {role.description.substring(0, 50)}
                  {role.description.length > 50 ? "..." : ""}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
