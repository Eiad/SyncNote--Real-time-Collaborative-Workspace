import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { useRouter } from 'next/router';

export function ReCaptchaWrapper({ children }) {
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Only show reCAPTCHA on login/signup pages
  const shouldShowRecaptcha = router.pathname === '/' || router.pathname === '/signup';

  if (isDevelopment || !shouldShowRecaptcha) {
    return children;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'body',
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
