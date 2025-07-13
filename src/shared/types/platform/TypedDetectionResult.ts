/**
 * Typed Detection Result Type
 *
 * Type-safe detection result for a specific status.
 */

import { DetectionStatus } from '../../constants/platform/DetectionStatus';
import { DetectionResultMap } from './DetectionResultMap';

/**
 * Type-safe detection result for a specific status
 */
export type TypedDetectionResult<T extends DetectionStatus> = DetectionResultMap[T];
