import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import styles from './Login.module.scss';
import { useAuth } from '@/contexts/AuthContext';
import GlobalLoader from './GlobalLoader';
import SignUp from './SignUp';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ashPassword, setAshPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginMode, setLoginMode] = useState('email'); // 'ash' or 'email'
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleAshLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (ashPassword === 'ashoo') {
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

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        setError('Please verify your email address before logging in. Check your inbox for the verification link.');
        await auth.signOut();
        setLoading(false);
        return;
      }
      
      router.push('/dashboard');
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          setError('Wrong email or password.');
          break;
        default:
          setError('Failed to login. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      setError('Failed to sign in with Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset link has been sent to your email.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isSignUp) {
    return <SignUp onToggleMode={() => setIsSignUp(false)} />;
  }

  return (
    <>
      {loading && <GlobalLoader message="Logging in..." />}
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.logoSection}>
            <h1 className={styles.logo}>SyncNote</h1>
            <p className={styles.tagline}>Your collaborative workspace</p>
          </div>

          <div className={styles.loginModeToggle}>
            <button
              className={`${styles.modeButton} ${loginMode === 'ash' ? styles.activeMode : ''}`}
              onClick={() => setLoginMode('ash')}
            >
              Ash Login
            </button>
            <button
              className={`${styles.modeButton} ${loginMode === 'email' ? styles.activeMode : ''}`}
              onClick={() => setLoginMode('email')}
            >
              Email Login
            </button>
          </div>

          {loginMode === 'ash' ? (
            <form onSubmit={handleAshLogin} className={styles.form}>
              <div className={styles.inputGroup}>
                <FiLock className={styles.inputIcon} />
                <input
                  type="password"
                  value={ashPassword}
                  onChange={(e) => setAshPassword(e.target.value)}
                  placeholder="Enter password for Ash"
                  className={styles.input}
                  required
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
          ) : (
            <>
              <form onSubmit={handleEmailLogin} className={styles.form}>
                <div className={styles.inputGroup}>
                  <FiMail className={styles.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <FiLock className={styles.inputIcon} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={styles.input}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className={styles.primaryButton}
                  disabled={loading}
                >
                  Login
                </button>
                <div className={styles.forgotPassword}>
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className={styles.forgotPasswordButton}
                  >
                    Forgot Password?
                  </button>
                </div>

                {error && (
                  <div className={styles.error}>
                    {error}
                  </div>
                )}

                {success && (
                  <div className={styles.success}>
                    {success}
                  </div>
                )}
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

              <p className={styles.switchMode}>
                Don't have an account?{' '}
                <button 
                  onClick={() => setIsSignUp(true)} 
                  className={styles.switchButton}
                >
                  Sign Up
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;