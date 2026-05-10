import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export async function logEvent(eventKey, properties = {}) {
  try {
    await api.post("/events", { event_key: eventKey, properties });
  } catch {}
}
