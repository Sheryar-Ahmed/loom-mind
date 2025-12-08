import { useEffect, useState } from 'react';

/**
 * Hook to detect when Zustand store has hydrated from localStorage
 * Prevents flash of unauthenticated state on page refresh
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for next tick to ensure localStorage has been read
    setHydrated(true);
  }, []);

  return hydrated;
}
