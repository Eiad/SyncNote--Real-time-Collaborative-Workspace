import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
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
    return <div>Loading...</div>;
  }

  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className={styles.container}>
      <Login />
      <footer className={styles.footer}>
        <p>Real-time collaborative text sharing</p>
      </footer>
    </div>
  );
};

export default Home; 