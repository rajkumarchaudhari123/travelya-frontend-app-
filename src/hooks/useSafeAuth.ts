// src/hooks/useSafeAuth.ts
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
export const useSafeAuth = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuthReady = () => {
      // Check if auth instance exists and has necessary methods
      if (auth && typeof auth.signOut === 'function') {
        setIsReady(true);
      } else {
        // Retry after a short delay
        setTimeout(checkAuthReady, 100);
      }
    };

    checkAuthReady();
  }, []);

  return { isReady };
};