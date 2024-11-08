import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase';
import { applyActionCode } from 'firebase/auth';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import styles from '@/styles/VerifyEmail.module.scss';

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const router = useRouter();
  const { oobCode } = router.query;

  useEffect(() => {
    const verifyEmail = async () => {
      if (!oobCode) return;

      try {
        await applyActionCode(auth, oobCode);
        setVerificationStatus('success');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
      }
    };

    verifyEmail();
  }, [oobCode, router]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoSection}>
          <h1 className={styles.logo}>SyncNote</h1>
          <p className={styles.tagline}>Your collaborative workspace</p>
        </div>

        {verificationStatus === 'verifying' && (
          <div className={styles.status}>
            <div className={styles.spinner} />
            <h2>Verifying your email...</h2>
            <p>Please wait while we verify your email address.</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className={styles.status}>
            <FiCheckCircle className={styles.successIcon} />
            <h2>Email Verified!</h2>
            <p>Your email has been successfully verified.</p>
            <p className={styles.redirect}>Redirecting to login page...</p>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className={styles.status}>
            <FiXCircle className={styles.errorIcon} />
            <h2>Verification Failed</h2>
            <p>The verification link may have expired or is invalid.</p>
            <button 
              onClick={() => router.push('/')} 
              className={styles.returnButton}
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
