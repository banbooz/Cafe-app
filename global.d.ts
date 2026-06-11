export {};

declare global {
  interface Window {
    removeEventListener(type: "popstate"): void;
  }
}
