export const A11Y = {
  generateId: (prefix: string): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  announceToScreenReader: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcer = document.getElementById('sr-announcer') || createAnnouncer();
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  },

  getInitialFocusableElement: (container: HTMLElement | null): HTMLElement | null => {
    if (!container) return null;

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    return container.querySelector(focusableSelector) as HTMLElement | null;
  },

  getAllFocusableElements: (container: HTMLElement | null): HTMLElement[] => {
    if (!container) return [];

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    return Array.from(container.querySelectorAll(focusableSelector)) as HTMLElement[];
  },
};

function createAnnouncer(): HTMLElement {
  const announcer = document.createElement('div');
  announcer.id = 'sr-announcer';
  announcer.className = 'sr-only';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  document.body.appendChild(announcer);
  return announcer;
}
