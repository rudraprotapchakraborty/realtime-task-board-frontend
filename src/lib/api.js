import axios from "axios";

export const TOKEN_KEY = "tb_token";
export const USER_KEY = "tb_user";
export const SESSION_EXPIRED_EVENT = "tb:session-expired";

/** Identifies this browser tab so it can ignore the live-update echo of its own changes. */
export const CLIENT_ID = Math.random().toString(36).slice(2, 12);

const api = axios.create({
  // Development goes through the Vite proxy; production talks to the deployed API unless VITE_API_URL says otherwise
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "https://realtime-task-board-backend.vercel.app/api"),
  timeout: 20_000,
});

export const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
export const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the session lasts until the tab closes */
  }
};

api.interceptors.request.use((config) => {
  config.headers["X-Client-Id"] = CLIENT_ID;
  if (!config.headers.Authorization) {
    const token = read(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// An expired token, a deleted account or a block ends the session everywhere.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const isAuthCall = url.startsWith("/auth/");
    const blocked = status === 403 && /blocked/i.test(String(error.response?.data?.message ?? ""));
    if (!isAuthCall && (status === 401 || blocked)) window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    return Promise.reject(error);
  }
);

/** Turns any thrown API error into a message that can be shown to the user. */
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (err?.code === "ERR_NETWORK" || (err?.isAxiosError && !err.response)) {
    return "Unable to reach the server. Please check your connection.";
  }
  const data = err?.response?.data;
  const fieldErrors = data?.details?.fieldErrors;
  if (fieldErrors && typeof fieldErrors === "object") {
    const parts = Object.entries(fieldErrors).flatMap(([field, msgs]) =>
      (Array.isArray(msgs) ? msgs : [msgs]).map((m) => `${field}: ${m}`)
    );
    if (parts.length) return parts.join(" | ");
  }
  return data?.message || fallback;
}

export default api;
