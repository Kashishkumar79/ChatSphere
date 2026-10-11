import axios from "axios";

// Backend ka URL. Local dev ke liye .env mein VITE_API_URL=http://localhost:5002 rakh sakte ho.
export const API_URL = import.meta.env.VITE_API_URL || "https://chatsphere-qkvb.onrender.com";

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("ChatApp");
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Har request ke saath token bhejo
api.interceptors.request.use((config) => {
  const token = getStoredUser()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token expire ho jaye to login par bhejo
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && !url.includes("/login") && !url.includes("/signup")) {
      localStorage.removeItem("ChatApp");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (error, fallback = "Kuch galat ho gaya") =>
  error?.response?.data?.error || fallback;

export default api;
