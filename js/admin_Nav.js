/**
 * admin_Nav.js
 * Renders the RentWheels admin top navigation bar.
 * Set data-page on <body> to one of:
 *   "dashboard" | "users" | "vehicles" | "bookings"
 */

function renderAdminHeader(activeKey) {
  const navItems = [
    { key: "dashboard", label: "Dashboard", href: "admin-dashboard.html" },
    { key: "users",     label: "Users",     href: "admin-users.html"     },
    { key: "vehicles",  label: "Vehicles",  href: "admin-vehicles.html"  },
    { key: "bookings",  label: "Bookings",  href: "admin-bookings.html"  },
  ];

  const navHtml = navItems
    .map(({ key, label, href }) => {
      const isActive = key === activeKey;
      return `<a href="${href}" class="nav-link${isActive ? " active" : ""}" data-nav="${key}"${isActive ? ' aria-current="page"' : ""}>${label}</a>`;
    })
    .join("");

  return `
    <header class="admin-header">
      <a class="admin-brand" href="admin-dashboard.html" aria-label="RentWheels home">
        <img src="../assets/logo.webp" alt="RentWheels" />
      </a>
      <nav class="admin-nav" aria-label="Admin navigation">
        ${navHtml}
        <button type="button" class="nav-logout" id="rw-admin-logout" aria-label="Logout">
          <img src="../assets/logout.png" alt="RentWheels" width="20" height="20" />
          Logout
        </button>
      </nav>
    </header>
  `;
}

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const pageKey = document.body?.dataset?.page || "dashboard";
  const headerTarget = document.getElementById("admin-header");
  if (headerTarget) headerTarget.innerHTML = renderAdminHeader(pageKey);

  const logoutBtn = document.getElementById("rw-admin-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});
