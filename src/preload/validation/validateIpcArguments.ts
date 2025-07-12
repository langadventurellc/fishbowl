import type { IpcChannels } from '../../shared/types';
import { validateChannelName } from './validateChannelName';
import { validateUuid } from './validateUuid';
import { safeValidateBoolean } from '../../shared/utils/validation';
import { validateSafeObject } from './validateSafeObject';
import { sanitizeValue } from './sanitizeValue';

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

    // Sanitize all arguments
    const sanitizedArgs = args.map(sanitizeValue);

    // Channel-specific validation
    let validationResult: ValidationResult;

    switch (channel) {
      case 'db:agents:get':
      case 'db:agents:update':
      case 'db:agents:delete':
      case 'db:conversations:get':
      case 'db:conversations:update':
      case 'db:conversations:delete':
      case 'db:messages:get':
      case 'db:messages:delete':
      case 'db:messages:toggle-active-state':
        validationResult = validateUuidChannels(args);
        break;

      case 'db:messages:update-active-state':
        validationResult = validateMessageActiveStateUpdate(args);
        break;

      case 'db:messages:list':
      case 'db:conversation-agents:list':
      case 'db:conversation-agents:add':
      case 'db:conversation-agents:remove':
        validationResult = validateConversationChannels(args);
        break;

      case 'config:get':
        validationResult = validateConfigGet(args);
        break;

      case 'config:set':
        validationResult = validateConfigSet(args);
        break;

      case 'secure:credentials:get':
      case 'secure:credentials:delete':
        validationResult = validateSecureCredentialsGetDelete(args);
        break;

      case 'secure:credentials:set':
        validationResult = validateSecureCredentialsSet(args);
        break;

      case 'secure:keytar:get':
      case 'secure:keytar:delete':
        validationResult = validateSecureKeytarGetDelete(args);
        break;

      case 'secure:keytar:set':
        validationResult = validateSecureKeytarSet(args);
        break;

      case 'theme:set':
        validationResult = validateThemeSet(args);
        break;

      default:
        // For channels that don't require specific validation
        validationResult = { valid: true };
        break;
    }

    if (!validationResult.valid) {
      return validationResult;
    }

    return { valid: true, sanitizedArgs };
  } catch (error) {
    return { valid: false, error: `Validation error: ${String(error)}` };
  }
};
