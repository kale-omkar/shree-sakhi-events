import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * In React Router SPAs, navigating to a new route doesn't reload
 * the browser, so the previous scroll position is preserved.
 * 
 * This component listens for URL pathname changes and resets
 * the scroll position back to the very top (0, 0).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

