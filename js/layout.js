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
    { key: "home", label: "Home", href: "../html/home.html" },
    { key: "vehicle", label: "Vehicle", href: "../html/vehicle.html" },
    { key: "my-bookings", label: "My Bookings", href: "../html/bookings.html" },
    { key: "dashboard", label: "Dashboard", href: "../html/dashboard.html" },
  ];

  const navHtml = navItems
    .map((item) => {
      const isActive = item.key === activeKey;
      const activeClass = isActive ? "active" : "";
      const aria = isActive ? ' aria-current="page"' : "";
      return `<a href="${item.href}" class="${activeClass}" data-nav="${item.key}"${aria}>${item.label}</a>`;
    })
    .join("");

  // On home page, login button opens modal; elsewhere it navigates
  const isHomePage = activeKey === "home";
  const authActionHtml = isAuthed()
    ? `<button type="button" class="rw-login" id="rw-logout-btn" aria-label="Log out">Log out</button>`
    : isHomePage
      ? `<button type="button" class="rw-login" id="rw-login-modal-btn" aria-label="Log in">Log in</button>`
      : `<a class="rw-login" href="../html/login.html" role="button" aria-label="Log in">Log in</a>`;

  return `
    <header class="rw-header">
      <a class="rw-brand" href="../html/home.html" aria-label="RentWheels">
        <img src="${ASSETS.brandLogo}" alt="RentWheels logo" />
      </a>

      <nav class="rw-nav" aria-label="Primary navigation">
        ${navHtml}
      </nav>

      <div class="rw-actions">
        <div class="rw-search" role="search">
          <img src="${ASSETS.searchIcon}" alt="" />
          <input type="text" placeholder="Search vehicles" aria-label="Search vehicles" id="headerSearchInput" />
        </div>
        ${authActionHtml}
      </div>

      <button class="rw-hamburger" id="rw-hamburger" aria-label="Toggle navigation" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </header>

    <nav class="rw-mobile-nav" id="rw-mobile-nav" aria-label="Mobile navigation">
      ${navHtml}
      <div class="rw-search" role="search" style="width:100%;max-width:none;">
        <img src="${ASSETS.searchIcon}" alt="" />
        <input type="text" placeholder="Search vehicles" aria-label="Search vehicles" />
      </div>
      ${authActionHtml.replace('id="rw-login-modal-btn"', 'id="rw-login-modal-btn-mobile"').replace('id="rw-logout-btn"', 'id="rw-logout-btn-mobile"')}
    </nav>
  `;
}

function renderFooter() {
  return `
    <footer class="rw-footer">
      <div class="rw-footer-inner">
        <a class="rw-brand" href="../html/home.html" aria-label="RentWheels Home">
          <img src="${ASSETS.brandLogo}" alt="RentWheels logo" />
        </a>
        <div class="rw-footer-col">
          <div class="rw-footer-title">Quick Links</div>
          <a class="rw-footer-item" href="../html/home.html">Home</a>
          <a class="rw-footer-item" href="../html/vehicle.html">Browse Vehicle</a>
          <a class="rw-footer-item" href="../html/bookings.html">Bookings</a>
        </div>

        <div class="rw-footer-col">
          <div class="rw-footer-title">Contact</div>
          <div class="rw-footer-text">CodeCruiser</div>
          <div class="rw-footer-text">Naxal, Kathmandu</div>
          <div class="rw-footer-text">+01-4964333</div>
          <div class="rw-footer-text">rentwheels@gmail.com</div>
        </div>
      </div>

      <div class="rw-footer-bottom">© 2026 RentWheels. All rights reserved.</div>
    </footer>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const pageKey = document.body?.dataset?.page || "home";

  const headerTarget = document.getElementById("rw-header");
  const footerTarget = document.getElementById("rw-footer");

  if (headerTarget) headerTarget.innerHTML = renderHeader(pageKey);
  if (footerTarget) footerTarget.innerHTML = renderFooter();

  // Logout buttons
  ["rw-logout-btn", "rw-logout-btn-mobile"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", logout);
  });

  // Hamburger toggle
  const hamburger = document.getElementById("rw-hamburger");
  const mobileNav = document.getElementById("rw-mobile-nav");
  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", String(open));
    });
  }

  // Header search → navigate to vehicle page
  const headerSearchInput = document.getElementById("headerSearchInput");
  if (headerSearchInput) {
    headerSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = headerSearchInput.value.trim();
        if (q) window.location.href = `../html/vehicle.html?search=${encodeURIComponent(q)}`;
      }
    });
  }

  // Login modal trigger (home page only)
  ["rw-login-modal-btn", "rw-login-modal-btn-mobile"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        const modal = document.getElementById("loginModal");
        if (modal) {
          modal.style.display = "flex";
          document.body.style.overflow = "hidden";
          if (mobileNav) mobileNav.classList.remove("open");
          if (hamburger) { hamburger.classList.remove("open"); hamburger.setAttribute("aria-expanded", "false"); }
        }
      });
    }
  });
});
