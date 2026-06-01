import { useEffect, useRef } from 'react';

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          const delay = target.getAttribute('data-delay');
          const show = () => target.classList.add('visible');
          if (delay) {
            setTimeout(show, Number(delay));
          } else {
            show();
          }
          observer.unobserve(target);
        });
      },
      { threshold: 0 }
    );

    const observeReveals = () => {
      el.querySelectorAll('.reveal:not(.visible)').forEach((child) => {
        observer.observe(child);
      });
    };

    observeReveals();

    const mo = new MutationObserver(() => {
      observeReveals();
    });

    mo.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, []);

  return ref;
}
