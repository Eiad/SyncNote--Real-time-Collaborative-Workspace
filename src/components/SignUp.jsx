import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import styles from './Login.module.scss';
import GlobalLoader from './GlobalLoader';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const SignUp = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!isDevelopment) {
        if (!executeRecaptcha) {
          throw new Error('reCAPTCHA not initialized');
        }

        const token = await executeRecaptcha('signup');
        const recaptchaResponse = await fetch('/api/verify-recaptcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const recaptchaData = await recaptchaResponse.json();
        if (!recaptchaData.success || recaptchaData.score < 0.5) {
          throw new Error('Security check failed. Please try again.');
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      const userData = {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        provider: 'email',
        uid: userCredential.user.uid
      };

      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, userData);
      
      await sendEmailVerification(userCredential.user);
      
      await auth.signOut();
      
      setSuccess('Account created! Please check your email to verify your account before logging in.');
      setTimeout(() => {
        onToggleMode();
      }, 3000);
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please login instead.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        default:
          setError('Failed to create account: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <GlobalLoader message="Creating Account..." />}
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.logoSection}>
            <h1 className={styles.logo}>SyncNote</h1>
            <p className={styles.tagline}>Your collaborative workspace</p>
          </div>

          <h2 className={styles.formTitle}>Create Account</h2>

          <form onSubmit={handleSignUp} className={styles.form}>
            <div className={styles.inputGroup}>
              <FiUser className={styles.inputIcon} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <FiMail className={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <FiLock className={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className={styles.input}
              />
            </div>

            <button 
              type="submit" 
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

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

          <p className={styles.switchMode}>
            Already have an account?{' '}
            <button onClick={onToggleMode} className={styles.switchButton}>
              Login
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUp;
