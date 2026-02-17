import { useEffect, useRef } from "react";

export const useIntersectionObserver = ({
  root = null,
  rootMargin = "0px",
  threshold = 1.0,
  onIntersect,
}: {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  onIntersect: () => void;
}) => {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersect();
          }
        });
      },
      { root, rootMargin, threshold }
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [root, rootMargin, threshold, onIntersect]);

  return { loadMoreRef: targetRef };
};
