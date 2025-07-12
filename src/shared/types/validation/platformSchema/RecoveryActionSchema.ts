/**
 * Recovery Action Validation Schema
 *
 * Validates recovery action objects for platform error handling and recovery.
 *
 * @module RecoveryActionSchema
 */

import { z } from 'zod';

/**
 * Recovery action schema for error result validation
 */
export const RecoveryActionSchema = z.object({
  /** Name of the recovery action */
  name: z
    .string()
    .min(1, 'Recovery action name cannot be empty')
    .max(100, 'Recovery action name is too long'),
  /** Description of what the action does */
  description: z
    .string()
    .min(1, 'Recovery action description cannot be empty')
    .max(300, 'Recovery action description is too long'),
  /** Whether the action is automated or requires manual intervention */
  automated: z.boolean(),
  /** Priority level of the recovery action */
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});
