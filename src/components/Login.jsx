import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import styles from './Login.module.scss';
import { useAuth } from '@/contexts/AuthContext';
import GlobalLoader from './GlobalLoader';

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

  const withLoadingDelay = async (callback) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      await callback();
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(1500 - elapsedTime, 0);
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    await withLoadingDelay(async () => {
      try {
        if (password === 'ashoo') {
          localStorage.setItem('isAshLoggedIn', 'true');
          window.location.href = '/dashboard';
        } else {
          setError('Invalid password');
        }
      } catch (error) {
        setError('Login failed: ' + error.message);
      }
    });
  };

  const handleGoogleLogin = async () => {
    await withLoadingDelay(async () => {
      try {
        setError('');
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          prompt: 'select_account'
        });
        await signInWithPopup(auth, googleProvider);
        router.push('/dashboard');
      } catch (error) {
        console.error('Google Sign In Error:', error);
        if (error.code === 'auth/unauthorized-domain') {
          setError('This domain is not authorized for authentication. Please contact the administrator.');
        } else if (error.code === 'auth/popup-closed-by-user') {
          setError('Sign in was cancelled. Please try again.');
        } else {
          setError(`Failed to sign in with Google: ${error.message}`);
        }
      }
    });
  };

  return (
    <>
      {loading && <GlobalLoader message="Logging in..." />}
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.logoSection}>
            <h1 className={styles.logo}>SyncNote</h1>
            <p className={styles.tagline}>Your collaborative workspace</p>
          </div>

          <form onSubmit={handlePasswordLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <FiLock className={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password for Ash"
                className={styles.input}
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.primaryButton}
              disabled={loading}
            >
              Login as Ash
            </button>
          </form>

          <div className={styles.divider}>
            <span>or continue with</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={styles.googleButton}
          >
            <FcGoogle />
            Sign in with Google
          </button>
          
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Login; 