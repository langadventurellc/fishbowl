import React from "react";

function App() {
  const electronAPI = (window as any).electronAPI;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fishbowl Desktop</h1>
        <p>Multi-AI Agent Conversation Platform</p>
        {electronAPI && (
          <div>
            <p>✅ Electron API Available</p>
            <p>Platform: {electronAPI.platform}</p>
            <p>Electron: {electronAPI.versions.electron}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
