(function () {
  const configuredBase = String(window.RW_CONFIG?.API_BASE || "").trim();
  const base = (configuredBase || "http://localhost:5000/api").replace(/\/+$/, "");

  function buildUrl(path, params) {
    const raw = String(path || "");
    const full = /^https?:\/\//i.test(raw)
      ? raw
      : base + (raw.startsWith("/") ? raw : `/${raw}`);
    const url = new URL(full);
    if (params && typeof params === "object") {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        url.searchParams.set(key, String(value));
      });
    }
    return url.toString();
  }

  function getToken() {
    return localStorage.getItem("authToken");
  }

  async function request(path, options) {
    const opt = options || {};
    const method = opt.method || "GET";
    const headers = new Headers(opt.headers || {});

    if (opt.auth) {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }

    let body = opt.body;
    const isBodyObject =
      body &&
      typeof body === "object" &&
      !(body instanceof FormData) &&
      !(body instanceof Blob) &&
      !(body instanceof ArrayBuffer) &&
      !(body instanceof URLSearchParams);
    if (isBodyObject) {
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      body = JSON.stringify(body);
    }

    const res = await fetch(buildUrl(path, opt.params), {
      method,
      headers,
      body,
      credentials: opt.credentials || "omit",
    });

    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const message = data && typeof data === "object" ? data.message : null;
      const err = new Error(message || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  window.RW_API = Object.freeze({
    base,
    buildUrl,
    request,
    getToken,
  });
})();

