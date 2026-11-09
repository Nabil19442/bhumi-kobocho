import '@testing-library/jest-dom';

// Mocks for JSDOM
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};

if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
