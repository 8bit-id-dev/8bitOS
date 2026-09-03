import type { PluginResultData } from '@capacitor/core';

export interface LauncherApp {
  packageName: string;
  label: string;
  system: boolean;
}

interface LauncherAppsPlugin {
  listApps(): Promise<PluginResultData & { apps: LauncherApp[] }>;
  launchApp(options: { packageName: string }): Promise<PluginResultData>;
}

declare global {
  interface Window {
    Capacitor?: {
      Plugins?: {
        LauncherApps?: LauncherAppsPlugin;
      };
    };
  }
}

const plugin = (): LauncherAppsPlugin | undefined => window.Capacitor?.Plugins?.LauncherApps;

export const isLauncherNative = (): boolean => Boolean(plugin());

export const listAndroidApps = async (): Promise<LauncherApp[] | null> => {
  const p = plugin();
  if (!p) return null;
  try {
    const { apps } = await p.listApps();
    return apps ?? [];
  } catch {
    return null;
  }
};

export const launchAndroidApp = async (packageName: string): Promise<boolean> => {
  const p = plugin();
  if (!p) return false;
  try {
    await p.launchApp({ packageName });
    return true;
  } catch {
    return false;
  }
};
