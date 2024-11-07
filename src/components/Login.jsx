import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import styles from './Login.module.scss';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (password === 'ashoo') {
        localStorage.setItem('isAshLoggedIn', 'true');
        window.location.href = '/dashboard';
      } else {
        setError('Invalid password');
      }
    } catch (error) {
      setError('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithPopup(auth, googleProvider);
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to sign in with Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1>SyncNote</h1>
      <p>Sign in to access your notes</p>
      
      <form onSubmit={handlePasswordLogin} className={styles.form}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password for Ash"
          className={styles.input}
          disabled={loading}
        />
        <button 
          type="submit" 
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login as Ash'}
        </button>
      </form>

      <div className={styles.divider}>or</div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className={styles.googleButton}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Login; 