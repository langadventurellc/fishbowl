import React, { createContext, useContext, ReactNode } from "react";

interface AIServiceContextType {
  // Placeholder for future AI service integration
  isConfigured: boolean;
  availableModels: string[];
}

const AIServiceContext = createContext<AIServiceContextType | undefined>(
  undefined,
);

export const useAIServiceContext = () => {
  const context = useContext(AIServiceContext);
  if (context === undefined) {
    throw new Error(
      "useAIServiceContext must be used within an AIServiceProvider",
    );
  }
  return context;
};

interface AIServiceProviderProps {
  children: ReactNode;
}

export function AIServiceProvider({ children }: AIServiceProviderProps) {
  const value: AIServiceContextType = {
    isConfigured: false, // Placeholder - will be implemented in future tasks
    availableModels: [], // Placeholder - will be populated with actual AI models
  };

  return (
    <AIServiceContext.Provider value={value}>
      {children}
    </AIServiceContext.Provider>
  );
}
