(function () {
  const configuredBase = String(window.RW_CONFIG?.API_BASE || "").trim();
  const DEFAULT_REMOTE_API = "https://rentwheels-zr2p.onrender.com/api";
  const DEFAULT_LOCAL_API = "http://localhost:5000/api";

  const hostname = String(window.location?.hostname || "").toLowerCase();
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local");

  const base = (
    configuredBase || (isLocalHost ? DEFAULT_LOCAL_API : DEFAULT_REMOTE_API)
  ).replace(/\/+$/, "");

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

  function getLoginHref() {
    const p = String(window.location?.pathname || "").replace(/\\/g, "/");
    return p.includes("/html/") ? "login.html" : "html/login.html";
  }

  async function request(path, options) {
    const opt = options || {};
    const method = opt.method || "GET";
    const headers = new Headers(opt.headers || {});
    const timeoutMs = Number.isFinite(opt.timeoutMs) ? opt.timeoutMs : 20000;

    let body = opt.body;
    const isBodyObject =
      body &&
      typeof body === "object" &&
      !(body instanceof FormData) &&
      !(body instanceof Blob) &&
      !(body instanceof ArrayBuffer) &&
      !(body instanceof URLSearchParams);
    if (isBodyObject) {
      if (!headers.has("Content-Type"))
        headers.set("Content-Type", "application/json");
      body = JSON.stringify(body);
    }

    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId =
      controller && timeoutMs > 0
        ? setTimeout(() => {
            try {
              controller.abort();
            } catch {}
          }, timeoutMs)
        : null;

    let res;
    try {
      res = await fetch(buildUrl(path, opt.params), {
        method,
        headers,
        body,
        credentials: "include",
        signal: controller ? controller.signal : undefined,
      });
    } catch (err) {
      if (
        err &&
        (err.name === "AbortError" ||
          String(err.message || "").includes("aborted"))
      ) {
        const e = new Error(`Request timed out after ${timeoutMs}ms`);
        e.status = 408;
        e.cause = err;
        throw e;
      }
      throw err;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (res.status === 401) {
      const rawPath = String(path || "");
      // Profile endpoint is used as an "am I logged in?" check on public pages.
      // A 401 here is normal when the user isn't logged in and should not redirect.
      const isProfileCheck =
        rawPath === "/auth/profile" ||
        rawPath.startsWith("/auth/profile?") ||
        rawPath.startsWith("/auth/profile&");
      const isAuthForm =
        rawPath.startsWith("/auth/login") ||
        rawPath.startsWith("/auth/register") ||
        rawPath.startsWith("/auth/forgot-password") ||
        rawPath.startsWith("/auth/reset-password");

      if (!isAuthForm && !isProfileCheck) {
        window.location.href = getLoginHref();
      }
      const err = new Error("Unauthorized");
      err.status = 401;
      err.data = data;
      throw err;
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

  const auth = Object.freeze({
    login(payload) {
      return request("/auth/login", { method: "POST", body: payload });
    },
    register(formData) {
      return request("/auth/register", { method: "POST", body: formData });
    },
    logout() {
      return request("/auth/logout", { method: "POST" });
    },
    profile() {
      return request("/auth/profile");
    },
    uploadDocuments(formData) {
      return request("/auth/documents", { method: "PATCH", body: formData });
    },
    checkEmailExists(email) {
      return request("/auth/check-email", { method: "POST", body: { email } });
    },
  });

  const vehicles = Object.freeze({
    getAll(params) {
      return request("/vehicles", { params });
    },
    search(filters) {
      return request("/vehicles", { params: filters });
    },
    getDetail(id) {
      return request(`/vehicles/${id}`);
    },
    addVehicle(formData) {
      return request("/vehicles", { method: "POST", body: formData });
    },
    getMy(params) {
      return request("/vehicles/my", { params });
    },
    getOptions(params) {
      return request("/vehicles/options", { params });
    },
  });

  const bookings = Object.freeze({
    create(payload) {
      return request("/bookings/checkout", { method: "POST", body: payload });
    },
    getMyBookings(params) {
      return request("/bookings/my", { params });
    },
    getDetail(id) {
      return request(`/bookings/${id}`);
    },
    cancel(id) {
      return request(`/bookings/${id}/cancel`, { method: "POST" });
    },
    return(id) {
      return request(`/bookings/${id}/return`, { method: "POST" });
    },
    getAsOwner(params) {
      return request("/bookings/as-owner", { params });
    },
    getMyVehiclesAvailability(params) {
      return request("/bookings/my-vehicles", { params });
    },
  });

  const payments = Object.freeze({
    processPayment(payload) {
      return request("/bookings/checkout", { method: "POST", body: payload });
    },
  });

  const admin = Object.freeze({
    getDashboardStats() {
      return Promise.all([
        request("/admin/bookings", { params: { limit: 5 } }),
        request("/admin/vehicles", { params: { limit: 5 } }),
        request("/auth/admin/users", { params: { limit: 5 } }),
      ]).then(([bookingsPayload, vehiclesPayload, usersPayload]) => ({
        success: true,
        data: { bookingsPayload, vehiclesPayload, usersPayload },
      }));
    },
    getAllBookings(params) {
      return request("/admin/bookings", { params });
    },
    getBookingDetail(id) {
      return request(`/admin/bookings/${id}`);
    },
    getAllVehicles(params) {
      return request("/admin/vehicles", { params });
    },
    getVehicleDetail(id) {
      return request(`/admin/vehicles/${id}`);
    },
    getAllUsers(params) {
      return request("/auth/admin/users", { params });
    },
    getUserDetail(id) {
      return request(`/auth/admin/users/${id}`);
    },
  });

  const comments = Object.freeze({
    getVehicleComments(vehicleId, params) {
      return request(`/comments/vehicle/${vehicleId}`, { params });
    },
    create(payload) {
      return request("/comments", { method: "POST", body: payload });
    },
    reply(commentId, payload) {
      return request(`/comments/${commentId}/reply`, {
        method: "POST",
        body: payload,
      });
    },
    like(commentId) {
      return request(`/comments/${commentId}/like`, { method: "POST" });
    },
    unlike(commentId) {
      return request(`/comments/${commentId}/like`, { method: "DELETE" });
    },
    update(commentId, payload) {
      return request(`/comments/${commentId}`, {
        method: "PATCH",
        body: payload,
      });
    },
    delete(commentId) {
      return request(`/comments/${commentId}`, { method: "DELETE" });
    },
  });

  const notifications = Object.freeze({
    getMy(params) {
      return request("/notifications", { params });
    },
    markRead(id) {
      return request(`/notifications/${id}/read`, { method: "PATCH" });
    },
    markAllRead() {
      return request("/notifications/read-all", { method: "PATCH" });
    },
  });

  const user = Object.freeze({
    buyerDashboard() {
      return request("/user/buyer/dashboard");
    },
    sellerDashboard() {
      return request("/user/seller/dashboard");
    },
  });

  window.RW_API = Object.freeze({
    base,
    buildUrl,
    request,
    auth,
    vehicles,
    bookings,
    payments,
    admin,
    comments,
    notifications,
    user,
  });
})();
