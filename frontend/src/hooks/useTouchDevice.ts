import { useState, useEffect } from 'react';

function isMobileDevice(): boolean {
  return navigator.maxTouchPoints > 0;
}

export function useTouchDevice(): boolean {
  const [mobile, setMobile] = useState(isMobileDevice);

  useEffect(() => {
    function handleResize() {
      setMobile(isMobileDevice());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return mobile;
}
