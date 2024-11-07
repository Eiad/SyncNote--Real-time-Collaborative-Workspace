import { AuthProvider } from '@/contexts/AuthContext';
import Head from 'next/head';
import '@fontsource/mynerve/400.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@/styles/globals.scss';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>SyncNote - Real-time Collaborative Text & Media Sharing</title>
        <meta name="description" content="SyncNote is a real-time collaborative platform for sharing text and media with others." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
} 