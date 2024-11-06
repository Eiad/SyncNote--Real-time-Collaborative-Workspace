import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const ProtectedPage = () => {
  const router = useRouter();

  useEffect(() => {
    const loggedIn = Cookies.get('isCodeSynceAuthenticated');
    if (!loggedIn) {
      router.push('/login'); // Redirect to login if not logged in
    }
  }, [router]);

  return (
    <div>
      <h1>Protected Page</h1>
      <p>This page is protected and requires a password to access.</p>
    </div>
  );
};

export default ProtectedPage; 