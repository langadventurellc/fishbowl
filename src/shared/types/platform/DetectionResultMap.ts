/**
 * Detection Result Map Type
 *
 * Type mapping for different detection result scenarios.
 */

import { DetectionStatus } from '../../constants/platform/DetectionStatus';
import { PermissionLevel } from '../../constants/platform/PermissionLevel';
import { PlatformType } from '../../constants/platform/PlatformType';

/**
 * Detection result type mapping for different scenarios
 */
export type DetectionResultMap = {
  [DetectionStatus.AVAILABLE]: {
    available: true;
    status: DetectionStatus.AVAILABLE;
    evidence: string[];
    permissions: PermissionLevel;
  };
  [DetectionStatus.UNAVAILABLE]: {
    available: false;
    status: DetectionStatus.UNAVAILABLE;
    reason: string;
    fallbacks?: string[];
  };
  [DetectionStatus.PERMISSION_DENIED]: {
    available: false;
    status: DetectionStatus.PERMISSION_DENIED;
    requiredPermissions: PermissionLevel[];
    grantInstructions?: string;
  };
  [DetectionStatus.NOT_SUPPORTED]: {
    available: false;
    status: DetectionStatus.NOT_SUPPORTED;
    platform: PlatformType;
    alternatives?: string[];
  };
  [DetectionStatus.ERROR]: {
    available: false;
    status: DetectionStatus.ERROR;
    error: string;
    retryable: boolean;
  };
  [DetectionStatus.UNKNOWN]: {
    available: false;
    status: DetectionStatus.UNKNOWN;
    retryCount: number;
  };
};
