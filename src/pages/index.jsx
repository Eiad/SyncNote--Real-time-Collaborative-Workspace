import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Login from '@/components/Login';
import styles from '@/styles/Home.module.scss';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = Cookies.get('isAuthenticated');
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [router]);

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