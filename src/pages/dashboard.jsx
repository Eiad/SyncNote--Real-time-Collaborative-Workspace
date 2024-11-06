import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Cookies from 'js-cookie';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TextShare from '@/components/TextShare';
import MediaShare from '@/components/MediaShare';
import styles from '@/styles/Home.module.scss';

const Dashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = Cookies.get('isCodeSynceAuthenticated');
    if (!auth) {
      router.push('/');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleGlobalPaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        setLoading(true);
        setError(null);
        try {
          const file = item.getAsFile();
          if (!file) {
            throw new Error('Failed to get image from clipboard');
          }

          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/uploadImage', {
            method: 'POST',
            body: formData,
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || data.message || 'Upload failed');
          }
          
          if (!data.secure_url) {
            throw new Error('No secure URL received from server');
          }

          const docRef = doc(db, 'media', 'shared-text-1');
          const docSnap = await getDoc(docRef);
          const currentUrls = docSnap.exists() ? docSnap.data().urls || [] : [];
          
          await setDoc(docRef, {
            urls: [...currentUrls, data.secure_url]
          }, { merge: true });

        } catch (err) {
          console.error('Paste upload error:', err);
          setError(`Error uploading image: ${err.message}`);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, []);

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
        
        {loading && <div className={styles.globalLoading}>Uploading media...</div>}
        {error && <div className={styles.globalError}>{error}</div>}
        
        <footer className={styles.footer}>
          <p>Share the URL with others to collaborate in real-time</p>
        </footer>
      </div>
    </>
  );
};

export default Dashboard; 