import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Settings.module.css';

export const Settings: React.FC = () => {
  return (
    <div className={styles.settings}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to='/' className={styles.backButton}>
            ← Back to Home
          </Link>
        </nav>
        <h1 className={styles.title}>Settings</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Application Settings</h2>
            <div className={styles.settingGroup}>
              <h3>Theme</h3>
              <p>Choose your preferred theme (coming soon)</p>
              <div className={styles.placeholder}>
                Theme selection will be implemented in future phases
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>AI Configuration</h2>
            <div className={styles.settingGroup}>
              <h3>Provider Settings</h3>
              <p>Configure AI providers and API keys (coming soon)</p>
              <div className={styles.placeholder}>
                AI provider configuration will be implemented in future phases
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Privacy & Security</h2>
            <div className={styles.settingGroup}>
              <h3>Data Storage</h3>
              <p>
                Manage your conversation data and privacy settings (coming soon)
              </p>
              <div className={styles.placeholder}>
                Privacy settings will be implemented in future phases
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>About</h2>
            <div className={styles.aboutInfo}>
              <p>
                <strong>Fishbowl</strong> v1.0.0
              </p>
              <p>Multi-Agent AI Conversations</p>
              <p>Built with Electron, React, and TypeScript</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
