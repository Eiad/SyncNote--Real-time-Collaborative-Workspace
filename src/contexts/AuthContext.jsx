import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext({});

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
        // Create or update user document
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString()
          });
        }
        
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);