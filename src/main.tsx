
  import axios from 'axios';
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // Empty base URL → relative /api on FE origin (Vite proxy locally, nginx proxy in prod).
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '';
  axios.defaults.withCredentials = true;

  createRoot(document.getElementById("root")!).render(<App />);
