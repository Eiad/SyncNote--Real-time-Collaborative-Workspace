import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { FiLogOut, FiEdit3, FiImage, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import TextShare from '@/components/TextShare';
import MediaShare from '@/components/MediaShare';
import styles from '@/styles/Home.module.scss';

const Dashboard = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('isAshLoggedIn');
      window.location.href = '/'; 
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
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
  );
};

export default Dashboard; 