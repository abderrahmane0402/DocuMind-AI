// Centralized API configuration for DocuMind AI
// When deployed under a subpath (e.g. /DocuMindAi/), automatically resolve relative to the current subpath
const getBaseApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.startsWith('/api')) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    // e.g. pathname = "/DocuMindAi/" -> basePrefix = "/DocuMindAi"
    const pathSegments = window.location.pathname.replace(/\/+$/, '');
    return `${window.location.origin}${pathSegments}/api/v1`;
  }
  
  return 'http://localhost:8000/api/v1';
};

export const API_BASE_URL = getBaseApiUrl();
