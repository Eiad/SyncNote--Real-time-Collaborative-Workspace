import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { FiLogOut, FiEdit3, FiImage, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import TextShare from '@/components/TextShare';
import MediaShare from '@/components/MediaShare';
import GlobalLoader from '@/components/GlobalLoader';
import styles from '@/styles/Home.module.scss';

const Dashboard = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const startTime = Date.now();
    
    try {
      await auth.signOut();
      localStorage.removeItem('isAshLoggedIn');
      
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(1500 - elapsedTime, 0);
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {loggingOut && <GlobalLoader message="Logging out..." />}
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.syncNote}>SyncNote</h1>
            
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <span className={styles.welcomeText}>Welcome,</span>
                <span className={styles.userName}>{user.displayName}</span>
              </div>
              
              {user.photoURL && (
                <div className={styles.avatarContainer}>
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className={styles.avatar}
                  />
                </div>
              )}
              
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
                title="Sign Out"
              >
                <span className={styles.desktopText}>Sign Out</span>
                <FiLogOut className={styles.logoutIcon} />
              </button>
            </div>
          </div>
        </header>
        <main className={styles.main}>
          <TextShare documentId={`${user.uid}-notes`} />
          <MediaShare documentId={`${user.uid}-media`} />
        </main>
      </div>
    </>
  );
};

export default Dashboard; 