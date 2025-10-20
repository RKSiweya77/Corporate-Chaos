import '@testing-library/jest-dom'

if (!('matchMedia' in window)) {
  window.matchMedia = (q) => ({
    matches: false,
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false
  })
}

if (!('scrollTo' in window)) {
  window.scrollTo = () => {}
}