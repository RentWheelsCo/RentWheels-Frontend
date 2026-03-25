const ASSETS = {
  // From the provided Figma design (node 1:4).
  brandLogo:
    "https://www.figma.com/api/mcp/asset/5d15e4b7-59fa-4782-b5fc-3f1a19528a94",
  searchIcon:
    "https://www.figma.com/api/mcp/asset/f655dc66-d14b-4e34-b654-2eda563ba435",
};

function renderHeader(activeKey) {
  const navItems = [
    { key: "home", label: "Home", href: "index.html" },
    { key: "vehicle", label: "Vehicle", href: "vehicle.html" },
    { key: "my-bookings", label: "My Bookings", href: "my-bookings.html" },
    { key: "dashboard", label: "Dashboard", href: "dashboard.html" },
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
      <div class="rw-brand" aria-label="RentWheels">
        <img src="${ASSETS.brandLogo}" alt="RentWheels logo" />
      </div>

      <nav class="rw-nav" aria-label="Primary navigation">
        ${navHtml}
      </nav>

      <div class="rw-actions">
        <div class="rw-search" role="search">
          <img src="${ASSETS.searchIcon}" alt="" />
          <input type="text" placeholder="Search vehicles" aria-label="Search vehicles" />
        </div>
        <a class="rw-login" href="#" role="button" aria-label="Log in">Log in</a>
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="rw-footer">
      <div class="rw-footer-inner">
        <div class="rw-footer-col">
          <div class="rw-footer-title">Quick Links</div>
          <a class="rw-footer-item" href="index.html">Home</a>
          <a class="rw-footer-item" href="vehicle.html">Browse Vehicle</a>
          <a class="rw-footer-item" href="my-bookings.html">Bookings</a>
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

