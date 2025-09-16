// Helper module to safely handle localStorage in Next.js
// This prevents errors during server-side rendering

const isBrowser = typeof window !== 'undefined';

export const storage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    return localStorage.getItem(key);
  },
  
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    localStorage.setItem(key, value);
  },
  
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }
};