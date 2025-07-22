import React, { ReactNode } from "react";
import { DatabaseProvider } from "./DatabaseProvider";
import { StorageProvider } from "./StorageProvider";
import { AIServiceProvider } from "./AIServiceProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <DatabaseProvider>
      <StorageProvider>
        <AIServiceProvider>{children}</AIServiceProvider>
      </StorageProvider>
    </DatabaseProvider>
  );
}
