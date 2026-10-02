const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = "adtric_admin_token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const EMAIL_KEY = "adtric_admin_email";

export const setToken = (token, email = "") => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
  } catch {}
};

export const getEmail = () => {
  try {
    return localStorage.getItem(EMAIL_KEY) || "";
  } catch {
    return "";
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  } catch {}
};

// Returns { ok, status, body }. A 401 on any protected call clears the token
// and sends the admin back to the login page.
export const adminFetch = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(`${baseUrl}/api/admin${path}`, {
      method: options.method || "GET",
      headers,
      body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
    });
  } catch {
    return { ok: false, status: 0, body: { message: "Could not reach the server. Try again." } };
  }

  let body = {};
  try {
    body = await response.json();
  } catch {}

  if (response.status === 401 && path !== "/login") {
    clearToken();
    window.location.href = "/admin/login";
  }
  return { ok: response.ok, status: response.status, body };
};
