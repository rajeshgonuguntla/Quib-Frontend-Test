
  import axios from 'axios';
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  axios.defaults.baseURL = import.meta.env.PROD
    ? 'https://quib-app-backend-944587700647.europe-west1.run.app'
    : 'http://localhost:8451';

  axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const isApiCall = typeof config.url === 'string' && config.url.startsWith('/api/');
  const isGoogleAuthEndpoint = typeof config.url === 'string' && config.url.startsWith('/api/auth/google');

  if (token && isApiCall && !isGoogleAuthEndpoint) {
    if (config.headers?.set) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = {
        ...(config.headers as Record<string, string> | undefined),
        Authorization: `Bearer ${token}`,
      } as never;
    }
  }

  return config;
});

  createRoot(document.getElementById("root")!).render(<App />);
  