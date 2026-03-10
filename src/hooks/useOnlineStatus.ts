// src/hooks/useOnlineStatus.ts
// Single source of truth for online/offline detection
import { useEffect, useState } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        // Fetch own site's favicon — no CORS, blocked by DevTools offline
        const res = await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-store',
          signal: AbortSignal.timeout(2000),
        });
        setIsOnline(res.ok);
      } catch {
        setIsOnline(false);
      }
    };

    check();
    const interval = setInterval(check, 3000);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => clearInterval(interval);
  }, []);

  return isOnline;
};