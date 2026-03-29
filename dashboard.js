const dashboardData = {
  totalVehicles: 8,
  totalBookings: 4,
  monthlyRevenue: 1060,

  bookings: [
    { id: 1, vehicle: "BMW 3 Series",   date: "4/1/2025",  price: 475, status: "Pending"   },
    { id: 2, vehicle: "Ford Explorer",  date: "3/11/2025", price: 425, status: "Completed" },
    { id: 3, vehicle: "Toyota Corolla", date: "4/5/2025",  price: 225, status: "Pending"   },
    { id: 4, vehicle: "Tesla Model 3",  date: "4/6/2025",  price: 360, status: "Confirmed" },
  ]
};

const calendarSVG = `
  <img src="./assests/clipboard.png" alt="Dropdown" width="25" height="25">`;

function badgeClass(status) {
  const map = { Pending: "badge-pending", Completed: "badge-completed", Confirmed: "badge-confirmed" };
  return map[status] || "badge-pending";
}

function renderDashboard() {
  document.getElementById("totalVehicles").textContent = dashboardData.totalVehicles;
  document.getElementById("totalBookings").textContent = dashboardData.totalBookings;
  document.getElementById("monthlyRevenue").textContent =
    "$" + dashboardData.monthlyRevenue.toLocaleString();

  const list = document.getElementById("bookingsList");
  list.innerHTML = dashboardData.bookings.map((b, i) => `
    <div class="booking-row" style="animation-delay: ${i * 80}ms">
      <div class="booking-icon-wrap">${calendarSVG}</div>
      <div class="booking-meta">
        <div class="booking-name">${b.vehicle}</div>
        <div class="booking-date">${b.date}</div>
      </div>
      <span class="booking-price">$${b.price}</span>
      <span class="badge ${badgeClass(b.status)}">${b.status}</span>
    </div>
  `).join("");
}

const DISABLED_PAGES = ["add-vehicle", "manage-vehicle", "manage-bookings"];

function initNav() {
  document.querySelectorAll(".nav-item").forEach(item => {
    const page = item.dataset.page;

    if (DISABLED_PAGES.includes(page)) {
      item.classList.add("nav-disabled");
      item.setAttribute("aria-disabled", "true");
      item.setAttribute("title", "Coming soon");
      return;
    }

    item.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      this.classList.add("active");

      const titles = {
        "dashboard": [
          "Admin Dashboard",
          "Monitor overall platform performance including total vehicles, bookings, revenue, and recent activities"
        ],
      };
      if (titles[page]) {
        document.querySelector(".page-title").textContent    = titles[page][0];
        document.querySelector(".page-subtitle").textContent = titles[page][1];
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
  initNav();
});