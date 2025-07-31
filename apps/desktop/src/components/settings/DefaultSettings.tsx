import React from "react";

export const DefaultSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-6">
        Select a section from the navigation to configure settings.
      </p>
    </div>
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
      <p className="text-sm text-muted-foreground">
        Choose a settings category to get started
      </p>
    </div>
  </div>
);
