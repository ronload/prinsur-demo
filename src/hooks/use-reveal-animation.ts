"use client";

import { useEffect, useRef, useState } from "react";

interface UseRevealAnimationOptions {
  threshold?: number;
  delay?: number;
  duration?: number;
  distance?: number;
}

export function useRevealAnimation(options: UseRevealAnimationOptions = {}) {
  const { threshold = 0.1, delay = 0, duration = 800, distance = 30 } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto trigger for page load animations
    if (delay >= 0 && !hasTriggered) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasTriggered(true);
      }, delay);

      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setTimeout(() => {
            setIsVisible(true);
            setHasTriggered(true);
          }, delay);
        }
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, delay, hasTriggered]);

  const animationStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0px)" : `translateY(${distance}px)`,
    transition: `all ${duration}ms cubic-bezier(0.25, 0.4, 0.25, 1)`,
    willChange: isVisible ? "auto" : "opacity, transform",
  };

  return { ref, isVisible, animationStyle };
}

export function useStaggeredReveal(count: number, baseDelay: number = 100) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger the animation of child items
          for (let i = 0; i < count; i++) {
            setTimeout(() => {
              setVisibleItems((prev) => new Set(prev).add(i));
            }, i * baseDelay);
          }
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [count, baseDelay]);

  const getItemStyle = (index: number) => {
    const isVisible = visibleItems.has(index);
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0px)" : "translateY(12px)",
      transition:
        "opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
      willChange: isVisible ? "auto" : "opacity, transform",
    };
  };

  return { ref, getItemStyle };
}
