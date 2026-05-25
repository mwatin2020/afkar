export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const TOKEN_KEY = "private-vault-token";
const USER_KEY = "private-vault-user";

type RequestOptions = RequestInit & { auth?: boolean };

export type User = {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user: User) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (options.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(`Cannot reach the backend at ${API_BASE}. Make sure the API server is running.`);
  }

  if (response.status === 401 && typeof window !== "undefined") {
    clearToken();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    try {
      const data = await response.json();
      throw new Error(data.detail ?? "Request failed.");
    } catch {
      throw new Error("Request failed.");
    }
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  setupStatus: () => api<{ requires_setup: boolean }>("/auth/setup-status", { auth: false }),
  setup: (payload: unknown) =>
    api<{ user: User; token: { access_token: string } }>("/auth/setup", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    }),
  login: (payload: unknown) =>
    api<{ user: User; token: { access_token: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    }),
  me: () => api<User>("/auth/me"),
};
