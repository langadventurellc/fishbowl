/**
 * Rate limiting for IPC calls
 */
class IpcRateLimiter {
  private callCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly maxCallsPerMinute = 100;
  private readonly windowMs = 60000; // 1 minute

  isAllowed(channel: string): boolean {
    const now = Date.now();
    const current = this.callCounts.get(channel);

    if (!current || now > current.resetTime) {
      this.callCounts.set(channel, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (current.count >= this.maxCallsPerMinute) {
      return false;
    }

    current.count++;
    return true;
  }

  reset(): void {
    this.callCounts.clear();
  }
}

export const ipcRateLimiter = new IpcRateLimiter();
