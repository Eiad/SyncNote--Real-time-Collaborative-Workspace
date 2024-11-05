import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Cookies from 'js-cookie';
import TextShare from '@/components/TextShare';
import MediaShare from '@/components/MediaShare';
import styles from '@/styles/Home.module.scss';

const Dashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = Cookies.get('isAuthenticated');
    if (!auth) {
      router.push('/');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard - SyncNote</title>
        <meta name="description" content="Share and collaborate on text and media in real-time with SyncNote's dashboard." />
        <meta property="og:title" content="Dashboard - SyncNote" />
        <meta property="og:description" content="Share and collaborate on text and media in real-time with SyncNote's dashboard." />
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>SyncNote</h1>
          <p>Real-time collaborative text sharing</p>
        </header>
        
        <main className={styles.main}>
          <TextShare documentId="shared-text-1" />
          <MediaShare documentId="shared-text-1" />
        </main>
        
        <footer className={styles.footer}>
          <p>Share the URL with others to collaborate in real-time</p>
        </footer>
      </div>
    </>
  );
};

export default Dashboard; 