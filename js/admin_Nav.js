function renderAdminHeader(activeKey) {
  const navItems = [
    { key: "dashboard", label: "Dashboard", href: "../html/admin_Dashboard.html" },
    { key: "users",     label: "Users",     href: "../html/manage-users.html"     },
    { key: "vehicles",  label: "Vehicles",  href: "../html/admin_vehicles.html"  },
    { key: "bookings",  label: "Bookings",  href: "../html/admin_bookings.html"  },
  ];

  const navHtml = navItems
    .map(({ key, label, href }) => {
      const isActive = key === activeKey;
      return `<a href="${href}" class="nav-link${isActive ? " active" : ""}" data-nav="${key}"${isActive ? ' aria-current="page"' : ""}>${label}</a>`;
    })
    .join("");

  return `
    <header class="admin-header">
      <a class="admin-brand" href="../html/admin_Dashboard.html" aria-label="RentWheels home">
        <img src="../assets/logo.webp" alt="RentWheels" />
      </a>

      <!-- Hamburger toggle (mobile only) -->
      <button
        type="button"
        class="nav-hamburger"
        id="rw-hamburger"
        aria-label="Open navigation"
        aria-expanded="false"
        aria-controls="rw-mobile-menu"
      >
        <span class="ham-bar"></span>
        <span class="ham-bar"></span>
        <span class="ham-bar"></span>
      </button>

      <!-- Desktop nav -->
      <nav class="admin-nav" aria-label="Admin navigation">
        ${navHtml}
        <button type="button" class="nav-logout" id="rw-admin-logout" aria-label="Logout">
          Logout
        </button>
      </nav>

      <!-- Mobile drawer -->
      <div class="mobile-menu" id="rw-mobile-menu" role="dialog" aria-label="Navigation menu" hidden>
        <nav class="mobile-nav" aria-label="Admin navigation mobile">
          ${navHtml}
          <button type="button" class="nav-logout mobile-logout" id="rw-admin-logout-mobile" aria-label="Logout">
            Logout
          </button>
        </nav>
      </div>

      <!-- Overlay -->
      <div class="mobile-overlay" id="rw-overlay" aria-hidden="true"></div>
    </header>
  `;
}

function logout() {
  // COOKIE AUTH IMPLEMENTED
  window.RW_API?.auth?.logout?.().catch(() => {});
  document.cookie = "authToken=; Max-Age=0; path=/";
  window.location.href = "../html/login.html";
}

async function requireAdminOrRedirect() {
  try {
    const payload = await window.RW_API?.auth?.profile?.();
    const role = payload?.data?.role || null;
    if (String(role || "").toLowerCase() !== "admin") {
      window.location.replace("../html/home.html");
    }
  } catch (err) {
    if (err?.status === 401) {
      window.location.replace("../html/login.html");
      return;
    }
    // If profile fails for any other reason, keep the user on page but log it.
    console.error("Admin auth check failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const pageKey = document.body?.dataset?.page || "dashboard";
  const headerTarget = document.getElementById("admin-header");
  if (headerTarget) headerTarget.innerHTML = renderAdminHeader(pageKey);

  requireAdminOrRedirect();

  // Desktop logout
  const logoutBtn = document.getElementById("rw-admin-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // Mobile logout
  const logoutBtnMobile = document.getElementById("rw-admin-logout-mobile");
  if (logoutBtnMobile) logoutBtnMobile.addEventListener("click", logout);

  // Hamburger toggle
  const hamburger  = document.getElementById("rw-hamburger");
  const mobileMenu = document.getElementById("rw-mobile-menu");
  const overlay    = document.getElementById("rw-overlay");

  function openMenu() {
    mobileMenu.hidden = false;
    overlay.classList.add("visible");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    mobileMenu.hidden = true;
    overlay.classList.remove("visible");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });
  }

  if (overlay) overlay.addEventListener("click", closeMenu);

  // Close menu on nav-link click (SPA-friendly)
  document.querySelectorAll(".mobile-nav .nav-link").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
});
