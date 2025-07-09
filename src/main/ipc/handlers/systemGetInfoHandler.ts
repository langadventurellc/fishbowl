import { app } from 'electron';
import { arch, platform, version } from 'os';
import type { SystemInfo } from '../../../shared/types';

export const systemGetInfoHandler = (): SystemInfo => {
  const memoryUsage = process.memoryUsage();

  return {
    platform: platform(),
    arch: arch(),
    version: version(),
    appVersion: app.getVersion(),
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
    memory: {
      used: memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
    },
  };
};
