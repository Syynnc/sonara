'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Returns a ref and a boolean `visible` flag that flips to `true`
 * when the element enters the viewport (via IntersectionObserver).
 *
 * Pair with the `[data-reveal]` CSS classes in globals.css:
 *   <div ref={ref} data-reveal={visible ? 'visible' : 'hidden'} />
 */
export function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}
