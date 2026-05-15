const ASSETS = {
  brandLogo: "../assets/rentwheels.png",
  searchIcon: "../assets/search_icon.png",
};

function readCachedProfile() {
  try {
    return JSON.parse(sessionStorage.getItem("rw_profile") || "null");
  } catch {
    return null;
  }
}

function writeCachedProfile(profile) {
  try {
    sessionStorage.setItem("rw_profile", JSON.stringify(profile || null));
  } catch {
    // ignore storage errors
  }
}

function applyProfileToPage(profile) {
  const p = profile || readCachedProfile() || null;
  if (!p) return;
  document.querySelectorAll(".profile-name").forEach((el) => {
    if (p.name) el.textContent = p.name;
  });
}

function isAuthed() {
  // COOKIE AUTH IMPLEMENTED: HttpOnly cookie not readable in JS
  return Boolean(readCachedProfile()?.id);
}

function logout() {

  window.RW_API?.auth?.logout?.().catch(() => {});
  document.cookie = "authToken=; Max-Age=0; path=/";
  window.location.href = "../html/login.html";
}

/** Returns notification list from localStorage (or empty array) */
function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem("rw_notifications") || "[]");
  } catch {
    return [];
  }
}

function renderHeader(activeKey) {
  const navItems = [
    { key: "home",        label: "Home",        href: "../html/home.html",        protected: false },
    { key: "vehicle",     label: "Vehicle",     href: "../html/vehicle.html",     protected: false },
    { key: "my-bookings", label: "My Bookings", href: "../html/my-bookings.html", protected: true  },
  ];

  const navHtml = navItems
    .map((item) => {
      const isActive = item.key === activeKey;
      return `<a href="${item.href}"
                 class="rw-nav-link${isActive ? " active" : ""}"
                 data-nav="${item.key}"
                 data-protected="${item.protected}"
                 ${isActive ? 'aria-current="page"' : ""}>${item.label}</a>`;
    })
    .join("");

  const notifications = getNotifications();
  const notifCount = notifications.length;

  const notifItemsHtml = notifCount === 0
    ? `<div class="rw-notif-panel__empty">No notifications</div>`
    : notifications
        .map(n => `<div class="rw-notif-panel__item">${n.message || n}</div>`)
        .join("");

  const notificationBellHtml = `
    <div class="rw-notification-wrap">
      <button class="rw-notification" aria-label="Notifications" aria-expanded="false" type="button" id="rw-notification-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/>
        </svg>
        <span class="rw-notification-badge${notifCount === 0 ? " hidden" : ""}"
              id="rw-notif-badge"
              aria-label="${notifCount} notifications">${notifCount}</span>
      </button>
      <div class="rw-notif-panel" id="rw-notif-panel" role="dialog" aria-label="Notifications panel">
        <div class="rw-notif-panel__header">Notifications</div>
        <div id="rw-notif-list">${notifItemsHtml}</div>
      </div>
    </div>
  `;

  const authActionHtml = isAuthed()
    ? `<button type="button" class="rw-btn-login" id="rw-logout-btn" aria-label="Log out">Log out</button>`
    : `<a class="rw-btn-login" href="../html/login.html" role="button" aria-label="Log in">Log in</a>`;

  return `
    <header class="rw-header">
      <!-- Brand -->
      <a class="rw-brand" href="../html/home.html" aria-label="RentWheels home">
        <img src="${ASSETS.brandLogo}" alt="RentWheels logo" />
      </a>

      <!-- Centre nav -->
      <nav class="rw-nav" aria-label="Primary navigation">
        ${navHtml}
      </nav>

      <!-- Actions: notification, dashboard link, login/logout -->
      <div class="rw-actions">
        ${notificationBellHtml}

        <a class="rw-dashboard-link${activeKey === "dashboard" ? " active" : ""}"
           href="../html/dashboard.html"
           id="rw-dashboard-link"
           data-protected="true"
           aria-label="Dashboard">Dashboard</a>

        ${authActionHtml}
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="rw-footer">
      <div class="rw-footer-inner">

        <!-- Brand Column -->
        <div class="rw-footer-brand-col">
          <a class="rw-footer-logo" href="../html/home.html" aria-label="RentWheels Home">
            <img src="${ASSETS.brandLogo}" alt="RentWheels logo" />
          </a>
          <p class="rw-footer-tagline">
            Premium vehicle rental service with a wide selection of luxury and
            everyday vehicles for all your driving needs.
          </p>
        </div>

        <!-- Quick Links Column -->
        <div class="rw-footer-col">
          <p class="rw-footer-title">Quick Links</p>
          <nav aria-label="Footer navigation">
            <a class="rw-footer-link" href="../html/home.html">Home</a>
            <a class="rw-footer-link" href="../html/vehicle.html">Browse Vehicle</a>
            <a class="rw-footer-link" href="../html/bookings.html">Bookings</a>
          </nav>
        </div>

        <!-- Contact Column -->
        <div class="rw-footer-col">
          <p class="rw-footer-title">Contact</p>
          <div class="rw-footer-contact">
            <span>CodeCruiser</span>
            <span>Naxal, Kathmandu</span>
            <span>+01-4964333</span>
            <a href="mailto:rentwheels@gmail.com" class="rw-footer-contact-email">rentwheels@gmail.com</a>
          </div>
        </div>

      </div>

      <div class="rw-footer-divider"></div>

      <div class="rw-footer-bottom">
        <span>© 2026 RentWheels. All rights reserved.</span>
      </div>
    </footer>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const pageKey = document.body?.dataset?.page || "home";

  const headerTarget = document.getElementById("rw-header");
  const footerTarget = document.getElementById("rw-footer");

  if (headerTarget) headerTarget.innerHTML = renderHeader(pageKey);
  if (footerTarget) footerTarget.innerHTML = renderFooter();

  // ── Logout ────────────────────────────────────────────────────
  const logoutBtn = document.getElementById("rw-logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // COOKIE AUTH IMPLEMENTED: hydrate session auth + notifications
  window.RW_API?.auth?.profile?.()
    .then((p) => {
      if (p?.data?.id) {
        writeCachedProfile(p.data);
        applyProfileToPage(p.data);
      }
      if (headerTarget) headerTarget.innerHTML = renderHeader(pageKey);

      return window.RW_API?.notifications?.getMy?.({ page: 1, pageSize: 20, unreadOnly: true });
    })
    .then((n) => {
      const rows = Array.isArray(n?.data?.notifications) ? n.data.notifications : [];
      const mapped = rows.map((r) => ({ message: r.title || r.message || "Notification" }));
      localStorage.setItem("rw_notifications", JSON.stringify(mapped));

      if (headerTarget) headerTarget.innerHTML = renderHeader(pageKey);
    })
    .catch(() => {
      // keep existing header as-is
    });


  // ── Notification panel toggle ────────────────────────────────
  const notifBtn   = document.getElementById("rw-notification-btn");
  const notifPanel = document.getElementById("rw-notif-panel");

  if (notifBtn && notifPanel) {
    // Toggle panel on bell click (works whether logged in or not)
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = notifPanel.classList.toggle("open");
      notifBtn.setAttribute("aria-expanded", String(isOpen));
    });

    // Close panel when clicking anywhere outside
    document.addEventListener("click", (e) => {
      const wrap = document.querySelector(".rw-notification-wrap");
      if (wrap && !wrap.contains(e.target)) {
        notifPanel.classList.remove("open");
        notifBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Close panel on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        notifPanel.classList.remove("open");
        notifBtn.setAttribute("aria-expanded", "false");
      }
    });
  }
});
