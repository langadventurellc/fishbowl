/**
 * Validate that an object has only safe properties
 */
export const validateSafeObject = (obj: unknown): boolean => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const dangerousProperties = [
    '__proto__',
    'constructor',
    'prototype',
    'require',
    'process',
    'global',
    'window',
    'document',
    'eval',
    'Function',
  ];

  // Check both enumerable and non-enumerable properties
  const allKeys = [...Object.keys(obj), ...Object.getOwnPropertyNames(obj)];

  for (const key of allKeys) {
    if (dangerousProperties.includes(key)) {
      return false;
    }
  }

  // Also check if the object has its own __proto__ property
  return !Object.prototype.hasOwnProperty.call(obj, '__proto__');
};
