/**
 * Permission Level Validation Schema
 *
 * Validates permission level enumeration values for platform capabilities.
 *
 * @module PermissionLevelSchema
 */

import { z } from 'zod';

/**
 * Permission level enumeration for capability validation
 */
export const PermissionLevelSchema = z.enum(['NONE', 'READ', 'WRITE', 'ADMIN', 'SYSTEM']);
