import React, { Suspense, useEffect, useState, useRef } from 'react';
import Spline from '@splinetool/react-spline';

export default function Robot() {
  const [isVisible, setIsVisible] = useState(true);
  const [canLoadSpline, setCanLoadSpline] = useState(null); // null = unknown, true = ok, false = fail
  const containerRef = useRef(null);

  // Try to prefetch the Spline scene to detect network issues and avoid uncaught errors
  useEffect(() => {
    let isMounted = true;
    const sceneUrl = 'https://prod.spline.design/OIObz2Hkucw6JwXb/scene.splinecode';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    fetch(sceneUrl, { method: 'GET', signal: controller.signal })
      .then((res) => {
        if (!isMounted) return;
        if (res.ok) setCanLoadSpline(true);
        else setCanLoadSpline(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Spline scene prefetch failed:', err.message || err);
        setCanLoadSpline(false);
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only show if intersecting. 
        // We use a small buffer or 0 to aggressive unload.
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{ filter: 'brightness(1.3) sepia(1) hue-rotate(300deg) saturate(4)' }}>
      {isVisible ? (
        <>
          {canLoadSpline === null && (
            <div className="text-white/30 text-xs tracking-widest">LOADING 3D...</div>
          )}

          {canLoadSpline === true && (
            <Suspense fallback={<div className="text-white/30 text-xs tracking-widest">LOADING 3D...</div>}>
              <div className="w-[120%] h-[120%] flex items-center justify-center -mb-10 -mr-10">
                <Spline scene="https://prod.spline.design/OIObz2Hkucw6JwXb/scene.splinecode" />
              </div>
            </Suspense>
          )}

          {canLoadSpline === false && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white/40 text-sm">3D preview unavailable — network blocked.</div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full" /> // Placeholder to maintain layout
      )}
    </div>
  );
}
