"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
  charDelay?: number;
  onComplete?: () => void;
}

export function TypewriterText({ 
  text, 
  className, 
  delay = 0, 
  charDelay = 80,
  onComplete 
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, charDelay);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, charDelay, hasStarted, onComplete]);

  return (
    <span className={cn("relative", className)}>
      {displayedText}
      {hasStarted && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

interface StaggeredTextProps {
  text: string;
  className?: string;
  delay?: number;
  wordDelay?: number;
  charMode?: boolean; // New prop to enable character-by-character animation
  onComplete?: () => void;
}

export function StaggeredText({ 
  text, 
  className, 
  delay = 0, 
  wordDelay = 150,
  charMode = false,
  onComplete 
}: StaggeredTextProps) {
  const elements = charMode ? text.split('') : text.split(' ');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true);
      setCurrentIndex(0);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted || currentIndex === -1) return;

    if (currentIndex < elements.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, wordDelay);

      return () => clearTimeout(timer);
    } else if (currentIndex === elements.length - 1 && onComplete) {
      setTimeout(onComplete, 200);
    }
  }, [currentIndex, elements.length, wordDelay, hasStarted, onComplete]);

  return (
    <span className={className}>
      {elements.map((element, index) => (
        <span
          key={index}
          className={cn(
            "inline-block transition-all duration-300 ease-out",
            index <= currentIndex
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          )}
        >
          {element === ' ' ? '\u00A0' : element}
        </span>
      ))}
    </span>
  );
}