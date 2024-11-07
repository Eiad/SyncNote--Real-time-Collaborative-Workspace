import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import { FiCloud, FiZap, FiLock } from 'react-icons/fi';
import styles from '@/styles/Home.module.scss';

const Home = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  if (user) {
    return null;
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <div className={styles.loginSection}>
          <div className={styles.loginWrapper}>
            <Login />
          </div>
        </div>        
      </main>
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} SyncNote. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home; 