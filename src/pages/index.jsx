import Login from '@/components/Login';
import styles from '@/styles/Home.module.scss';

const Home = () => {
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