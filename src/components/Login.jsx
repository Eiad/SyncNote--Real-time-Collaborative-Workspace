import { useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import styles from './Login.module.scss';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const correctPassword = process.env.NEXT_PUBLIC_PASSWORD;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      Cookies.set('isAuthenticated', 'true', { expires: 30 });
      router.push('/dashboard');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1>SyncNote</h1>
      <p>Enter password to access the application</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className={styles.input}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login; 