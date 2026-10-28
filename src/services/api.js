
const API_URL = "https://task-management-api-qu4h.onrender.com/api";

const api = {
  async request(method, path, body) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined
        ? { body: JSON.stringify(body) }
        : {}),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        data?.message || "Request failed"
      );
      error.response = { data };
      throw error;
    }

    return { data };
  },

  get(path) {
    return this.request("GET", path);
  },

  post(path, body) {
    return this.request("POST", path, body);
  },

  put(path, body) {
    return this.request("PUT", path, body);
  },

  delete(path) {
    return this.request("DELETE", path);
  },
};

export default api;
