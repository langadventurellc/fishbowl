/**
 * @fileoverview Reference Validation Request Type
 */

export interface ReferenceValidationRequest {
  sourceId: string;
  sourceType: "agent" | "personality" | "role" | "model";
  targetId: string;
  targetType: "personality" | "role" | "model" | "capability";
  context?: Record<string, unknown>;
}
