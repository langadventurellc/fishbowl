/**
 * Basic UUID v4 format validation using regex pattern.
 * Validates the general structure but not cryptographic strength.
 *
 * @param id - String to validate as UUID
 * @returns boolean indicating if string matches UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
