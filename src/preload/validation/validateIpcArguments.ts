import type { IpcChannels } from '../../shared/types';
import { validateChannelName } from './validateChannelName';
import { validateUuid } from './validateUuid';
import { safeValidateBoolean } from '../../shared/utils/validation';
import { validateSafeObject } from './validateSafeObject';
import { sanitizeValue } from './sanitizeValue';

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
        if (args.length === 0 || !validateUuid(args[0] as string)) {
          return { valid: false, error: 'Valid UUID required' };
        }
        break;

      case 'db:messages:update-active-state':
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

        {
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
        }
        break;

      case 'db:messages:list':
      case 'db:conversation-agents:list':
      case 'db:conversation-agents:add':
      case 'db:conversation-agents:remove':
        if (args.length === 0 || !validateUuid(args[0] as string)) {
          return { valid: false, error: 'Valid conversation ID required' };
        }
        break;

      case 'config:get':
        if (args.length === 0 || typeof args[0] !== 'string') {
          return { valid: false, error: 'Configuration key required' };
        }
        break;

      case 'config:set':
        if (args.length < 2 || typeof args[0] !== 'string') {
          return { valid: false, error: 'Configuration key and value required' };
        }
        break;

      case 'secure:credentials:get':
      case 'secure:credentials:delete':
        if (args.length === 0 || typeof args[0] !== 'string') {
          return { valid: false, error: 'Provider name required' };
        }
        break;

      case 'secure:credentials:set':
        if (args.length < 2 || typeof args[0] !== 'string' || typeof args[1] !== 'string') {
          return { valid: false, error: 'Provider and API key required' };
        }
        break;

      case 'secure:keytar:get':
      case 'secure:keytar:delete':
        if (args.length < 2 || typeof args[0] !== 'string' || typeof args[1] !== 'string') {
          return { valid: false, error: 'Service and account required' };
        }
        break;

      case 'secure:keytar:set':
        if (
          args.length < 3 ||
          typeof args[0] !== 'string' ||
          typeof args[1] !== 'string' ||
          typeof args[2] !== 'string'
        ) {
          return { valid: false, error: 'Service, account, and password required' };
        }
        break;

      case 'theme:set':
        if (args.length === 0 || !['light', 'dark', 'system'].includes(args[0] as string)) {
          return { valid: false, error: 'Valid theme value required' };
        }
        break;

      default:
        // For channels that don't require specific validation
        break;
    }

    return { valid: true, sanitizedArgs };
  } catch (error) {
    return { valid: false, error: `Validation error: ${String(error)}` };
  }
};
