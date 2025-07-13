/**
 * Web Runtime Environment Union Type
 *
 * Union type for Web-aware runtime environment contexts.
 * Used for TypeScript type safety in Web platform detection.
 */

import { WebEnvironment } from './WebEnvironment';
import { NonWebEnvironment } from './NonWebEnvironment';

/**
 * Union type for Web-aware runtime environment contexts
 */
export type WebRuntimeEnvironment = WebEnvironment | NonWebEnvironment;
