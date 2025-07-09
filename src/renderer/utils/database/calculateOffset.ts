/**
 * Calculate offset from page and page size
 */

export const calculateOffset = (page: number, pageSize: number): number => {
  return Math.max(0, (Math.max(1, page) - 1) * Math.max(1, pageSize));
};
