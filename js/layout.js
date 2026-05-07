const ASSETS = {
  brandLogo: "../assets/rentwheels.png",
  searchIcon: "../assets/search_icon.png",
};

function isAuthed() {
  return Boolean(localStorage.getItem("authToken"));
}

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  window.location.href = "../html/login.html";
}

function renderHeader(activeKey) {
  const navItems = [
    { key: "home",        label: "Home",        href: "../html/home.html"        },
    { key: "vehicle",     label: "Vehicle",     href: "../html/vehicle.html"     },
    { key: "my-bookings", label: "My Bookings", href: "../html/my-bookings.html" },
  ];

  const navHtml = navItems
    .map((item) => {
      const isActive = item.key === activeKey;
      return `<a href="${item.href}"
                 class="rw-nav-link${isActive ? " active" : ""}"
                 data-nav="${item.key}"
                 ${isActive ? 'aria-current="page"' : ""}>${item.label}</a>`;
    })
    .join("");

  const notificationBellHtml = `
    <button class="rw-notification" aria-label="Notifications" type="button" id="rw-notification-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/>
      </svg>
      <span class="rw-notification-dot" aria-hidden="true"></span>
    </button>
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

  const logoutBtn = document.getElementById("rw-logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});