import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top
 * when the route location changes
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // For smooth scrolling
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
