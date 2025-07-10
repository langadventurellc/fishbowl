import type { SecurityContext } from './SecurityContext';
import type { SecurityAuditEntry } from './SecurityAuditEntry';
import { ipcRateLimiter } from '../validation/IpcRateLimiter';

/**
 * Security manager for preload operations
 */
class PreloadSecurityManager {
  private auditLog: SecurityAuditEntry[] = new Array(1000);
  private auditLogIndex = 0;
  private sessionId: string;
  private readonly maxAuditEntries = 1000;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Create security context for current operation
   */
  createSecurityContext(channel: string): SecurityContext {
    return {
      channel,
      timestamp: Date.now(),
      origin: window.location.origin,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
    };
  }

  /**
   * Check if an IPC operation is allowed
   */
  checkIpcSecurity(channel: string, args: unknown[]): { allowed: boolean; reason?: string } {
    const context = this.createSecurityContext(channel);

    try {
      // Check rate limiting
      if (!ipcRateLimiter.isAllowed(channel)) {
        this.logSecurityEvent('blocked', channel, context, 'Rate limit exceeded');
        return { allowed: false, reason: 'Rate limit exceeded' };
      }

      // Check for dangerous operations
      if (this.isDangerousOperation(channel, args)) {
        this.logSecurityEvent('blocked', channel, context, 'Dangerous operation detected');
        return { allowed: false, reason: 'Dangerous operation detected' };
      }

      // Check for privilege escalation attempts
      if (this.isPrivilegeEscalation(channel, args)) {
        this.logSecurityEvent('blocked', channel, context, 'Privilege escalation attempt');
        return { allowed: false, reason: 'Privilege escalation attempt' };
      }

      // Check for malicious patterns
      if (this.hasMaliciousPatterns(args)) {
        this.logSecurityEvent('blocked', channel, context, 'Malicious pattern detected');
        return { allowed: false, reason: 'Malicious pattern detected' };
      }

      this.logSecurityEvent('allowed', channel, context);
      return { allowed: true };
    } catch (error) {
      this.logSecurityEvent('error', channel, context, `Security check failed: ${String(error)}`);
      return { allowed: false, reason: 'Security check failed' };
    }
  }

  /**
   * Get security audit log
   */
  getAuditLog(): SecurityAuditEntry[] {
    return this.auditLog.slice(0, this.auditLogIndex);
  }

  /**
   * Clear security audit log
   */
  clearAuditLog(): void {
    this.auditLog.fill(null as unknown as SecurityAuditEntry);
    this.auditLogIndex = 0;
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalOperations: number;
    allowedOperations: number;
    blockedOperations: number;
    errorOperations: number;
    topBlockedChannels: Array<{ channel: string; count: number }>;
  } {
    const validEntries = this.auditLog.slice(0, this.auditLogIndex);
    const channelBlocks = new Map<string, number>();

    let allowed = 0;
    let blocked = 0;
    let errors = 0;

    for (const entry of validEntries) {
      switch (entry.action) {
        case 'allowed':
          allowed++;
          break;
        case 'blocked':
          blocked++;
          channelBlocks.set(entry.channel, (channelBlocks.get(entry.channel) ?? 0) + 1);
          break;
        case 'error':
          errors++;
          break;
      }
    }

    const topBlockedChannels = Array.from(channelBlocks.entries())
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalOperations: validEntries.length,
      allowedOperations: allowed,
      blockedOperations: blocked,
      errorOperations: errors,
      topBlockedChannels,
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private logSecurityEvent(
    action: 'allowed' | 'blocked' | 'error',
    channel: string,
    context: SecurityContext,
    reason?: string,
  ): void {
    const entry: SecurityAuditEntry = {
      timestamp: Date.now(),
      channel,
      action,
      reason,
      context,
    };

    this.auditLog[this.auditLogIndex] = entry;
    this.auditLogIndex = (this.auditLogIndex + 1) % this.maxAuditEntries;
  }

  private isDangerousOperation(channel: string, args: unknown[]): boolean {
    // Check for dangerous channels
    const dangerousChannels = ['dev:openDevTools', 'dev:closeDevTools'];

    // Only allow dev tools in development
    if (dangerousChannels.includes(channel) && process.env.NODE_ENV === 'production') {
      return true;
    }

    // Check for dangerous arguments
    return this.hasDangerousArguments(args);
  }

  private isPrivilegeEscalation(channel: string, args: unknown[]): boolean {
    // Check for attempts to access privileged operations
    const privilegedChannels = ['secure:keytar:get', 'secure:keytar:set', 'secure:keytar:delete'];

    // Validate privilege escalation patterns
    if (privilegedChannels.includes(channel)) {
      return this.hasPrivilegeEscalationPatterns(args);
    }

    return false;
  }

  private hasMaliciousPatterns(args: unknown[]): boolean {
    const maliciousPatterns = [
      /eval\s*\(/i,
      /Function\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /require\s*\(/i,
      /import\s*\(/i,
      /process\./i,
      /global\./i,
      /window\./i,
      /document\./i,
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /on\w+\s*=/i,
    ];

    return this.checkPatternsInArgs(args, maliciousPatterns);
  }

  private hasDangerousArguments(args: unknown[]): boolean {
    const dangerousPatterns = [
      /\.\.\//g, // Path traversal
      /\0/g, // Null bytes
      // eslint-disable-next-line no-control-regex
      /[\u0001-\u001f\u007f-\u009f]/g, // Control characters
      /\\u[0-9a-fA-F]{4}/g, // Unicode escapes
      /\\x[0-9a-fA-F]{2}/g, // Hex escapes
    ];

    return this.checkPatternsInArgs(args, dangerousPatterns);
  }

  private hasPrivilegeEscalationPatterns(args: unknown[]): boolean {
    const escalationPatterns = [
      /\*/, // Wildcards
      /\$\{/, // Variable expansion
      /`/, // Command substitution
      /\|/, // Pipes
      /&&/, // Command chaining
      /\|\|/, // Or operations
      /;/, // Command separation
    ];

    return this.checkPatternsInArgs(args, escalationPatterns);
  }

  private checkPatternsInArgs(args: unknown[], patterns: RegExp[]): boolean {
    const stringify = (obj: unknown): string => {
      try {
        return JSON.stringify(obj);
      } catch {
        return String(obj);
      }
    };

    for (const arg of args) {
      const argStr = stringify(arg);

      for (const pattern of patterns) {
        if (pattern.test(argStr)) {
          return true;
        }
      }
    }

    return false;
  }
}

export const preloadSecurityManager = new PreloadSecurityManager();
