/**
 * Smooth scroll utility function
 * Provides smooth scrolling to elements with offset for fixed headers
 */
export const smoothScrollTo = (elementId, offset = 80) => {
  const element = document.getElementById(elementId.replace('#', ''));

  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
};

/**
 * Handle click events for smooth scrolling
 */
export const handleSmoothScroll = (e, targetId, offset = 80) => {
  e.preventDefault();
  smoothScrollTo(targetId, offset);
};
