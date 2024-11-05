import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '@/styles/globals.scss';
import '@fontsource/poppins';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (!isAuthenticated && router.pathname !== '/') {
      router.push('/');
    }
  }, [router]);

  return (
    <main>
      <Component {...pageProps} />
    </main>
  );
} 