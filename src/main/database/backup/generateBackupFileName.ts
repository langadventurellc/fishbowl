/**
 * Generate backup file name with timestamp
 */
export function generateBackupFileName(customName?: string): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const baseName = customName ?? 'database-backup';
  return `${baseName}-${timestamp}.sqlite`;
}
