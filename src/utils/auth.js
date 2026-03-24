const CURRENT_USER_KEY = "bbb_current_user";
const TOKEN_KEY = "bbb_token";
const API_URL = "https://bebrandby-backend.onrender.com/api";


export function getCurrentUser() {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function registerUser(payload) {
  try {
    const res = await import(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) return { ok: false, message: data.message || "Register failed" };
    setCurrentUser(data.user);
    setAuthToken(data.token);
    return { ok: true, user: data.user };
  } catch {
    return { ok: false, message: "Register failed" };
  }
}

export async function loginUser({ usernameOrEmail, password }) {
  try {
    const res = await import(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    const data = await res.json();
    if (!data.ok) return { ok: false, message: data.message || "Invalid credentials" };
    setCurrentUser(data.user);
    setAuthToken(data.token);
    return { ok: true, user: data.user };
  } catch {
    return { ok: false, message: "Login failed" };
  }
}

export function logoutUser() {
  setCurrentUser(null);
  setAuthToken(null);
}
