import { useEffect, useRef } from 'react';
import { A11Y } from '../utils/a11y';

export const useFocusTrap = (
  isActive: boolean = true,
  onEscape?: () => void
): React.RefObject<HTMLDivElement | null> => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const focusableElements = A11Y.getAllFocusableElements(containerRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape?.();
        return;
      }

      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);

    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);

      if (previouslyFocusedElement.current && previouslyFocusedElement.current.focus) {
        try {
          previouslyFocusedElement.current.focus();
        } catch (e) {
          console.warn('Could not restore focus', e);
        }
      }
    };
  }, [isActive, onEscape]);

  return containerRef;
};
