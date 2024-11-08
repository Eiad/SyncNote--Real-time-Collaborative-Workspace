import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export function ReCaptchaWrapper({ children }) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
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
