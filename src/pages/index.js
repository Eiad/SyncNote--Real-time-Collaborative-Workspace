import { useState, useEffect } from 'react';
import TextShare from '@/components/TextShare';
import styles from '@/styles/Home.module.scss';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>SyncNote</h1>
        <p>Real-time collaborative text sharing</p>
      </header>
      
      <main className={styles.main}>
        <TextShare documentId="shared-text-1" />
      </main>

      <footer className={styles.footer}>
        <p>Share the URL with others to collaborate in real-time</p>
      </footer>
    </div>
  );
} 