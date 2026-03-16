import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import nprogress from 'nprogress';

// Configure NProgress
nprogress.configure({ 
  showSpinner: false,
  easing: 'ease',
  speed: 500,
  minimum: 0.3
});

export default function ProgressBar() {
  const location = useLocation();

  useEffect(() => {
    // Start progress on route change
    nprogress.start();
    
    // Complete progress after a short delay to simulate page load
    // In a real app with data fetching, you'd complete it when data is ready
    const timer = setTimeout(() => {
      nprogress.done();
    }, 200);

    return () => {
      clearTimeout(timer);
      nprogress.done();
    };
  }, [location.pathname]);

  return null;
}
