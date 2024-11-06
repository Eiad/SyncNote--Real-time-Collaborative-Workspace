import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Cookies from 'js-cookie';
import '@/styles/globals.scss';
import '@fontsource/caveat';
import '@fontsource/poppins';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = Cookies.get('isCodeSynceAuthenticated');
    if (!isAuthenticated && router.pathname !== '/') {
      router.push('/');
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>SyncNote - Real-time Collaborative Text & Media Sharing</title>
        <meta name="description" content="SyncNote is a real-time collaborative platform for sharing text and media with others. Share notes, images, and collaborate in real-time." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#171717" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://syncnote.vercel.app/" />
        <meta property="og:title" content="SyncNote - Real-time Collaborative Text & Media Sharing" />
        <meta property="og:description" content="SyncNote is a real-time collaborative platform for sharing text and media with others. Share notes, images, and collaborate in real-time." />
        <meta property="og:image" content="https://syncnote.vercel.app/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://syncnote.vercel.app/" />
        <meta property="twitter:title" content="SyncNote - Real-time Collaborative Text & Media Sharing" />
        <meta property="twitter:description" content="SyncNote is a real-time collaborative platform for sharing text and media with others. Share notes, images, and collaborate in real-time." />
        <meta property="twitter:image" content="https://syncnote.vercel.app/og-image.jpg" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </Head>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
} 