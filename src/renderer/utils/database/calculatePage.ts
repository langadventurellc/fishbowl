/**
 * Calculate page from offset and page size
 */

export const calculatePage = (offset: number, pageSize: number): number => {
  return Math.floor(Math.max(0, offset) / Math.max(1, pageSize)) + 1;
};
