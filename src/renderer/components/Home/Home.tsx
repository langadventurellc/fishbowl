import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome to Fishbowl</h1>
        <p className={styles.subtitle}>Multi-Agent AI Conversations</p>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <section className={styles.intro}>
            <h2>Getting Started</h2>
            <p>
              Fishbowl is a desktop application that enables natural
              collaboration between multiple AI personalities in a shared
              conversation space.
            </p>
          </section>

          <section className={styles.features}>
            <h3>Key Features</h3>
            <ul>
              <li>Multi-agent AI conversations</li>
              <li>Secure desktop application</li>
              <li>Real-time collaboration</li>
              <li>Customizable AI personalities</li>
            </ul>
          </section>

          <section className={styles.actions}>
            <Link to='/chat' className={styles.primaryButton}>
              Start Conversation
            </Link>
            <Link to='/settings' className={styles.secondaryButton}>
              Settings
            </Link>
          </section>

          <section className={styles.status}>
            <h3>System Status</h3>
            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <span className={styles.statusIcon}>✅</span>
                <span>Electron Process</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusIcon}>✅</span>
                <span>React Renderer</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusIcon}>✅</span>
                <span>TypeScript</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusIcon}>✅</span>
                <span>Routing</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
