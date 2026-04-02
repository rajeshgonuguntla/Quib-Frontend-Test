
  import axios from 'axios';
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  axios.defaults.baseURL = import.meta.env.PROD
    ? 'https://quib-app-backend-944587700647.europe-west1.run.app'
      : '';

  axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
    const rawUrl = typeof config.url === 'string' ? config.url : '';
    const resolvedUrl = new URL(
      rawUrl,
      config.baseURL ?? axios.defaults.baseURL ?? window.location.origin,
    );
    const isGoogleAuthEndpoint = resolvedUrl.pathname.startsWith('/api/auth/google');

  if (token && !isGoogleAuthEndpoint) {
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
  