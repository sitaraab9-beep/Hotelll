import { useCallback } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

export const useGoogleLogin = () => {
  const handleGoogleLogin = useCallback(async (onSuccess: (token: string) => void, onError: (error: string) => void) => {
    if (!window.google) {
      onError('Google Sign-In not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your_google_client_id_here',
      callback: async (response: any) => {
        try {
          const res = await fetch('http://localhost:5001/api/auth/google-auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credential: response.credential }),
          });

          const data = await res.json();
          if (data.success) {
            onSuccess(data.token);
          } else {
            onError(data.message || 'Google login failed');
          }
        } catch (error) {
          onError('Network error during Google login');
        }
      },
    });

    window.google.accounts.id.prompt();
  }, []);

  const renderGoogleButton = useCallback((elementId: string) => {
    if (window.google) {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
        }
      );
    }
  }, []);

  return { handleGoogleLogin, renderGoogleButton };
};