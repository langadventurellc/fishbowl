import React, { createContext, useContext, ReactNode } from "react";

interface StorageContextType {
  // Placeholder for future secure storage integration
  isAvailable: boolean;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const useStorageContext = () => {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error("useStorageContext must be used within a StorageProvider");
  }
  return context;
};

interface StorageProviderProps {
  children: ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  const value: StorageContextType = {
    isAvailable: true, // Placeholder - will be implemented in future tasks
  };

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
}
