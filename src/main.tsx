
  import axios from 'axios';
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  axios.defaults.baseURL =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD ? 'https://quib-app-backend-944587700647.europe-west1.run.app' : '');
  axios.defaults.withCredentials = true;

  axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
    const rawUrl = typeof config.url === 'string' ? config.url : '';
    const resolvedUrl = new URL(
      rawUrl,
      config.baseURL || axios.defaults.baseURL || window.location.origin,
    );
    const isAuthCookieEndpoint = resolvedUrl.pathname.startsWith('/api/auth/google')
      || resolvedUrl.pathname.startsWith('/api/auth/logout');

    const existingAuth =
      (typeof config.headers?.get === 'function' ? config.headers.get('Authorization') : null)
      ?? (config.headers as Record<string, string> | undefined)?.Authorization;

  if (token && !isAuthCookieEndpoint && !existingAuth) {
    if (config.headers?.set) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
        const nextHeaders = (config.headers as Record<string, string> | undefined) ?? {};
        nextHeaders.Authorization = `Bearer ${token}`;
        config.headers = nextHeaders as never;
    }
  }

  return config;
});

  createRoot(document.getElementById("root")!).render(<App />);
  
