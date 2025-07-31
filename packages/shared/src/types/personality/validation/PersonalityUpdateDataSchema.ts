/**
 * @fileoverview Personality Update Data Validation Schema
 *
 * Zod schema for validating PersonalityUpdateData objects for partial updates.
 * This schema allows updating any subset of PersonalityConfiguration fields
 * while requiring only the id field for identification.
 *
 * Features:
 * - Required id field with UUID validation
 * - All other fields optional but validated when present
 * - Business rule validation for template personality restrictions
 * - Prevention of createdAt field modification
 * - Validation that at least one field (besides id) is being updated
 * - XSS protection through existing field validators
 */

import { z } from "zod";
import { PersonalityConfigurationSchema } from "./PersonalityConfigurationSchema";
import { PERSONALITY_VALIDATION_ERRORS } from "./constants";
import { createUuidValidator } from "./utils/createUuidValidator";

/**
 * Personality Update Data validation schema
 *
 * Validates PersonalityUpdateData = Partial<PersonalityConfiguration> & { id: string }
 *
 * This schema enables partial updates by making all PersonalityConfiguration fields
 * optional except the id field which is required for identification. Business rules
 * prevent template personality modifications and createdAt field updates.
 *
 * Required fields:
 * - id: UUID format validation for personality identification
 *
 * Optional fields (validated when present):
 * - All 19 personality traits: 0-100 integers
 * - name: Non-empty string, max 100 characters (with sanitization)
 * - description: Optional string, max 500 characters (with sanitization)
 * - customInstructions: Optional string, max 2000 characters (with sanitization)
 * - isTemplate: Boolean value
 * - updatedAt: ISO datetime string (typically set by service layer)
 *
 * Business Rules:
 * - Template personalities (isTemplate=true) cannot be modified
 * - createdAt field cannot be updated (audit trail preservation)
 * - At least one field besides id must be provided for update
 *
 * @example
 * ```typescript
 * const updateData = {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   // Partial trait updates
 *   openness: 80,
 *   creativity: 75,
 *   // Optional metadata updates
 *   name: "Updated Creative Assistant",
 *   customInstructions: "Enhanced creative focus"
 * };
 *
 * const result = PersonalityUpdateDataSchema.parse(updateData);
 * ```
 */
export const PersonalityUpdateDataSchema =
  PersonalityConfigurationSchema.partial()
    .extend({
      // Override id to be required for update identification
      id: createUuidValidator("Personality ID"),
    })
    .omit({
      // Prevent modification of audit trail field
      createdAt: true,
    })
    .strict()
    .refine(
      (data) => {
        // Business rule: Prevent template personality modifications
        // This would be enhanced with actual template check in service layer
        if (data.isTemplate === true) {
          return false;
        }
        return true;
      },
      {
        message: PERSONALITY_VALIDATION_ERRORS.TEMPLATE_MODIFICATION_FORBIDDEN,
        path: ["isTemplate"],
      },
    )
    .refine(
      (data) => {
        // Business rule: Ensure at least one field besides id is being updated
        const fieldsToUpdate = Object.keys(data).filter((key) => key !== "id");
        return fieldsToUpdate.length > 0;
      },
      {
        message: "At least one field besides id must be provided for update",
        path: ["root"],
      },
    );

/**
 * Type inference from PersonalityUpdateDataSchema
 *
 * This type represents validated PersonalityUpdateData with:
 * - Required id field with UUID format validation
 * - All other fields optional and validated when present
 * - String fields sanitized for XSS protection
 * - Trait values confirmed as 0-100 integers when provided
 * - Business rules enforced (no template modifications, no createdAt updates)
 */
export type PersonalityUpdateDataValidated = z.infer<
  typeof PersonalityUpdateDataSchema
>;
