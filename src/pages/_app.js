import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import '@/styles/globals.scss';
import '@fontsource/caveat';
import '@fontsource/poppins';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = Cookies.get('isAuthenticated');
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