import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Chat.module.css';

export const Chat: React.FC = () => {
  return (
    <div className={styles.chat}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to='/' className={styles.backButton}>
            ← Back to Home
          </Link>
        </nav>
        <h1 className={styles.title}>Chat Interface</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.chatContainer}>
          <div className={styles.sidebar}>
            <h3>Agents</h3>
            <div className={styles.agentList}>
              <div className={styles.agent}>
                <div className={styles.agentAvatar}>AI</div>
                <div className={styles.agentInfo}>
                  <div className={styles.agentName}>Assistant</div>
                  <div className={styles.agentStatus}>Ready</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.chatArea}>
            <div className={styles.messagesContainer}>
              <div className={styles.welcomeMessage}>
                <h2>Welcome to Fishbowl Chat</h2>
                <p>
                  This is where multi-agent AI conversations will take place. The chat interface
                  will be implemented in future phases.
                </p>
                <div className={styles.placeholder}>
                  Chat functionality will be implemented in future phases
                </div>
              </div>
            </div>

            <div className={styles.inputArea}>
              <div className={styles.inputContainer}>
                <input
                  type='text'
                  placeholder='Type your message... (coming soon)'
                  className={styles.messageInput}
                  disabled
                />
                <button className={styles.sendButton} disabled>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
