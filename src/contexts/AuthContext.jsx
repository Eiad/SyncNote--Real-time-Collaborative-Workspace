import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Check for Ash's login first
      const isAshLoggedIn = localStorage.getItem('isAshLoggedIn');
      
      if (isAshLoggedIn) {
        setUser({ 
          uid: 'ash',
          displayName: 'Ash',
          email: 'ash@example.com'
        });
        setLoading(false);
        return;
      }

      if (user) {
        // Check if user is verified or is a Google user
        if (user.emailVerified || user.providerData[0].providerId === 'google.com') {
          setUser(user);
        } else {
          // If not verified, sign them out
          await auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);