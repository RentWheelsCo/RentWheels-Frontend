const ASSETS = {
  brandLogo: "../assets/rentwheels.png",
  searchIcon: "../assets/search_icon.png",
};

function renderHeader(activeKey) {
  const navItems = [
    { key: "home", label: "Home", href: "../html/home.html" },
    { key: "vehicle", label: "Vehicle", href: "../html/vehicle.html" },
    {
      key: "my-bookings",
      label: "My Bookings",
      href: "../html/my-bookings.html",
    },
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
          <input type="text" placeholder="Search vehicles" aria-label="Search vehicles" />
        </div>
        <a class="rw-login" href="#" role="button" aria-label="Log out">Log out</a>
      </div>
    </header>
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
          <a class="rw-footer-item" href="../html/my-bookings.html">Bookings</a>
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
});
