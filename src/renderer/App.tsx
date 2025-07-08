import React from 'react';
import styles from './App.module.css';

export const App: React.FC = () => {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Fishbowl</h1>
        <p className={styles.subtitle}>Multi-Agent AI Conversations</p>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <h2>Welcome to Fishbowl</h2>
          <p>
            This is the foundation of your multi-agent AI conversation
            application. The project structure is now set up and ready for
            development.
          </p>

          <div className={styles.status}>
            <h3>Project Status</h3>
            <ul>
              <li>✅ Electron main process configured</li>
              <li>✅ React renderer process configured</li>
              <li>✅ TypeScript setup complete</li>
              <li>✅ Vite build system configured</li>
              <li>✅ Basic project structure created</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};
