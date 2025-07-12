import type { IpcChannels } from '../../shared/types';
import { safeValidateBoolean } from '../../shared/utils/validation';
import { sanitizeValue } from './sanitizeValue';
import { validateChannelName } from './validateChannelName';
import { validateSafeObject } from './validateSafeObject';
import { validateUuid } from './validateUuid';

type ValidationResult = { valid: boolean; error?: string };

/**
 * Validate UUID-based channels that require a single UUID argument
 */
const validateUuidChannels = (args: unknown[]): ValidationResult => {
  if (args.length === 0 || !validateUuid(args[0] as string)) {
    return { valid: false, error: 'Valid UUID required' };
  }
  return { valid: true };
};

/**
 * Validate message active state update arguments
 */
const validateMessageActiveStateUpdate = (args: unknown[]): ValidationResult => {
  if (args.length < 2 || !validateUuid(args[0] as string)) {
    return { valid: false, error: 'Valid UUID and updates object required' };
  }
  if (!args[1] || typeof args[1] !== 'object') {
    return { valid: false, error: 'Valid updates object required' };
  }

  if (!('isActive' in args[1])) {
    return { valid: false, error: 'Missing isActive field in updates object' };
  }

  if (Object.keys(args[1]).length !== 1) {
    return { valid: false, error: 'Updates object must only contain the "isActive" field' };
  }

  const booleanValidation = safeValidateBoolean(
    (args[1] as { isActive: unknown }).isActive,
    'isActive',
  );
  if (!booleanValidation.valid) {
    return {
      valid: false,
      error: booleanValidation.error ?? 'Invalid isActive boolean value',
    };
  }
  return { valid: true };
};

/**
 * Validate conversation ID-based channels
 */
const validateConversationChannels = (args: unknown[]): ValidationResult => {
  if (args.length === 0 || !validateUuid(args[0] as string)) {
    return { valid: false, error: 'Valid conversation ID required' };
  }
  return { valid: true };
};

/**
 * Validate config:get channel arguments
 */
const validateConfigGet = (args: unknown[]): ValidationResult => {
  if (args.length === 0 || typeof args[0] !== 'string') {
    return { valid: false, error: 'Configuration key required' };
  }
  return { valid: true };
};

/**
 * Validate config:set channel arguments
 */
const validateConfigSet = (args: unknown[]): ValidationResult => {
  if (args.length < 2 || typeof args[0] !== 'string') {
    return { valid: false, error: 'Configuration key and value required' };
  }
  return { valid: true };
};

/**
 * Validate secure credentials get/delete channel arguments
 */
const validateSecureCredentialsGetDelete = (args: unknown[]): ValidationResult => {
  if (args.length === 0 || typeof args[0] !== 'string') {
    return { valid: false, error: 'Provider name required' };
  }
  return { valid: true };
};

/**
 * Validate secure credentials set channel arguments
 */
const validateSecureCredentialsSet = (args: unknown[]): ValidationResult => {
  if (args.length < 2 || typeof args[0] !== 'string' || typeof args[1] !== 'string') {
    return { valid: false, error: 'Provider and API key required' };
  }
  return { valid: true };
};

/**
 * Validate secure keytar get/delete channel arguments
 */
const validateSecureKeytarGetDelete = (args: unknown[]): ValidationResult => {
  if (args.length < 2 || typeof args[0] !== 'string' || typeof args[1] !== 'string') {
    return { valid: false, error: 'Service and account required' };
  }
  return { valid: true };
};

/**
 * Validate secure keytar set channel arguments
 */
const validateSecureKeytarSet = (args: unknown[]): ValidationResult => {
  if (
    args.length < 3 ||
    typeof args[0] !== 'string' ||
    typeof args[1] !== 'string' ||
    typeof args[2] !== 'string'
  ) {
    return { valid: false, error: 'Service, account, and password required' };
  }
  return { valid: true };
};

/**
 * Validate theme:set channel arguments
 */
const validateThemeSet = (args: unknown[]): ValidationResult => {
  if (args.length === 0 || !['light', 'dark', 'system'].includes(args[0] as string)) {
    return { valid: false, error: 'Valid theme value required' };
  }
  return { valid: true };
};

/**
 * Validate database backup restore channel arguments
 */
const validateDbBackupRestore = (args: unknown[]): ValidationResult => {
  if (args.length === 0 || typeof args[0] !== 'string') {
    return { valid: false, error: 'Backup file path required' };
  }
  // Second argument (RestoreOptions) is optional, validate if present
  if (args.length > 1 && args[1] && typeof args[1] !== 'object') {
    return { valid: false, error: 'Restore options must be an object if provided' };
  }
  return { valid: true };
};

/**
 * Validate database backup validate channel arguments
 */
const validateDbBackupValidate = (args: unknown[]): ValidationResult => {
  if (args.length === 0 || typeof args[0] !== 'string') {
    return { valid: false, error: 'Backup file path required' };
  }
  return { valid: true };
};

/**
 * Validate database backup create channel arguments
 */
const validateDbBackupCreate = (args: unknown[]): ValidationResult => {
  // BackupOptions is optional, validate if present
  if (args.length > 0 && args[0] && typeof args[0] !== 'object') {
    return { valid: false, error: 'Backup options must be an object if provided' };
  }
  return { valid: true };
};

/**
 * Validate performance alert resolution channel arguments
 */
const validatePerformanceResolveAlert = (args: unknown[]): ValidationResult => {
  if (args.length === 0 || !validateUuid(args[0] as string)) {
    return { valid: false, error: 'Valid alert ID (UUID) required' };
  }
  return { valid: true };
};

/**
 * Validate performance optimization channel arguments
 */
const validatePerformanceOptimize = (args: unknown[]): ValidationResult => {
  // PerformanceOptimizationRequest is optional, validate if present
  if (args.length > 0 && args[0] && typeof args[0] !== 'object') {
    return {
      valid: false,
      error: 'Performance optimization request must be an object if provided',
    };
  }
  return { valid: true };
};

/**
 * Validate performance set thresholds channel arguments
 */
const validatePerformanceSetThresholds = (args: unknown[]): ValidationResult => {
  if (args.length === 0 || !args[0] || typeof args[0] !== 'object') {
    return { valid: false, error: 'Performance thresholds object required' };
  }
  return { valid: true };
};

/**
 * Validate performance get recent metrics channel arguments
 */
const validatePerformanceGetRecentMetrics = (args: unknown[]): ValidationResult => {
  // Count parameter is optional, validate if present
  if (args.length > 0 && args[0] && typeof args[0] !== 'number') {
    return { valid: false, error: 'Count must be a number if provided' };
  }
  return { valid: true };
};

/**
 * Validate performance get history channel arguments
 */
const validatePerformanceGetHistory = (args: unknown[]): ValidationResult => {
  // Duration parameter is optional, validate if present
  if (args.length > 0 && args[0] && typeof args[0] !== 'number') {
    return { valid: false, error: 'Duration must be a number if provided' };
  }
  return { valid: true };
};

/**
 * Validate performance get alerts channel arguments
 */
const validatePerformanceGetAlerts = (args: unknown[]): ValidationResult => {
  // Unresolved parameter is optional, validate if present
  if (args.length > 0 && args[0] && typeof args[0] !== 'boolean') {
    return { valid: false, error: 'Unresolved flag must be a boolean if provided' };
  }
  return { valid: true };
};

/**
 * Validate performance monitoring category channel arguments
 */
const validatePerformanceMonitoringCategory = (args: unknown[]): ValidationResult => {
  // Category parameter is optional, validate if present
  if (args.length > 0 && args[0] !== undefined && args[0] !== null) {
    const validCategories = ['database', 'ipc', 'system', 'all'];
    if (typeof args[0] !== 'string' || !validCategories.includes(args[0])) {
      return {
        valid: false,
        error: 'Category must be one of: database, ipc, system, all if provided',
      };
    }
  }
  return { valid: true };
};

/**
 * Channel validation mapping - associates channel patterns with their validation functions
 */
const CHANNEL_VALIDATION_MAP = new Map<string[], (args: unknown[]) => ValidationResult>([
  [
    [
      'db:agents:get',
      'db:agents:update',
      'db:agents:delete',
      'db:conversations:get',
      'db:conversations:update',
      'db:conversations:delete',
      'db:messages:get',
      'db:messages:delete',
      'db:messages:toggle-active-state',
      'db:backup:delete',
    ],
    validateUuidChannels,
  ],
  [['db:messages:update-active-state'], validateMessageActiveStateUpdate],
  [
    [
      'db:messages:list',
      'db:conversation-agents:list',
      'db:conversation-agents:add',
      'db:conversation-agents:remove',
    ],
    validateConversationChannels,
  ],
  [['config:get'], validateConfigGet],
  [['config:set'], validateConfigSet],
  [['secure:credentials:get', 'secure:credentials:delete'], validateSecureCredentialsGetDelete],
  [['secure:credentials:set'], validateSecureCredentialsSet],
  [['secure:keytar:get', 'secure:keytar:delete'], validateSecureKeytarGetDelete],
  [['secure:keytar:set'], validateSecureKeytarSet],
  [['theme:set'], validateThemeSet],
  [['db:backup:create'], validateDbBackupCreate],
  [['db:backup:restore'], validateDbBackupRestore],
  [['db:backup:validate'], validateDbBackupValidate],
  [['performance:resolveAlert'], validatePerformanceResolveAlert],
  [['performance:optimize'], validatePerformanceOptimize],
  [['performance:setThresholds'], validatePerformanceSetThresholds],
  [['performance:getRecentMetrics'], validatePerformanceGetRecentMetrics],
  [['performance:getHistory'], validatePerformanceGetHistory],
  [['performance:getAlerts'], validatePerformanceGetAlerts],
  [
    ['performance:enableMonitoring', 'performance:disableMonitoring', 'performance:resetMetrics'],
    validatePerformanceMonitoringCategory,
  ],
]);

/**
 * Default channels that don't require specific validation
 */
const DEFAULT_VALIDATION_CHANNELS = [
  'db:backup:list',
  'db:backup:cleanup',
  'db:backup:stats',
  'performance:getUnifiedReport',
  'performance:getDatabaseMetrics',
  'performance:getIpcMetrics',
  'performance:getSystemMetrics',
  'performance:getThresholds',
];

/**
 * Find the appropriate validation function for a given channel
 */
const findValidationFunction = (
  channel: string,
): ((args: unknown[]) => ValidationResult) | null => {
  for (const [channels, validationFn] of CHANNEL_VALIDATION_MAP) {
    if (channels.includes(channel)) {
      return validationFn;
    }
  }

  if (DEFAULT_VALIDATION_CHANNELS.includes(channel)) {
    return () => ({ valid: true });
  }

  return () => ({ valid: true }); // Default fallback
};

/**
 * Perform channel-specific validation using the mapping
 */
const performChannelValidation = (
  channel: keyof IpcChannels,
  args: unknown[],
): ValidationResult => {
  const validationFn = findValidationFunction(channel);
  return validationFn ? validationFn(args) : { valid: true };
};

/**
 * Validate IPC arguments for specific channels
 */
export const validateIpcArguments = (
  channel: keyof IpcChannels,
  args: unknown[],
): { valid: boolean; error?: string; sanitizedArgs?: unknown[] } => {
  try {
    // Basic validation
    if (!validateChannelName(channel)) {
      return { valid: false, error: 'Invalid channel name' };
    }

    // Validate all arguments are safe objects BEFORE sanitization
    for (const arg of args) {
      if (arg && typeof arg === 'object' && !validateSafeObject(arg)) {
        return { valid: false, error: 'Unsafe object detected' };
      }
    }

    // Channel-specific validation using mapping
    const validationResult = performChannelValidation(channel, args);

    if (!validationResult.valid) {
      return validationResult;
    }

    return { valid: true, sanitizedArgs: args.map(sanitizeValue) };
  } catch (error) {
    return { valid: false, error: `Validation error: ${String(error)}` };
  }
};
