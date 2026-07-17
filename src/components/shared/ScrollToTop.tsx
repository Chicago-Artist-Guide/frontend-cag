import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollToTop component that scrolls the window to the top when the route changes.
 * This component doesn't render anything, it just performs the scroll effect.
 */
const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when the route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
