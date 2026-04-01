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

const clipboard = `
  <img src="../assets/clipboard.png" alt="Dropdown" width="25" height="25">`;

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
      <div class="booking-icon-wrap">${clipboard}</div>
      <div class="booking-meta">
        <div class="booking-name">${b.vehicle}</div>
        <div class="booking-date">${b.date}</div>
      </div>
      <span class="booking-price">$${b.price}</span>
      <span class="badge ${badgeClass(b.status)}">${b.status}</span>
    </div>
  `).join("");
}

const DISABLED_PAGES = ["add-vehicle", "manage-bookings"];

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

    // Navigate to Manage Vehicle page
    if (page === "manage-vehicle") {
      window.location.href = "../html/Manage_vehicle.html";
      return;
    }

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
// Modal controls
function openModal() {
  showMainOptions();
  document.getElementById("editProfileModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("editProfileModal").style.display = "none";
}
function showMainOptions() {
  document.getElementById("mainOptions").style.display = "block";
  document.getElementById("photoEdit").style.display   = "none";
  document.getElementById("licenseEdit").style.display = "none";
}
function showPhotoEdit() {
  document.getElementById("mainOptions").style.display = "none";
  document.getElementById("photoEdit").style.display   = "block";
  document.getElementById("licenseEdit").style.display = "none";
}
function showLicenseEdit() {
  document.getElementById("mainOptions").style.display  = "none";
  document.getElementById("photoEdit").style.display    = "none";
  document.getElementById("licenseEdit").style.display  = "block";
}

function previewLicense(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById("licensePreview");
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

function saveLicense() {
  const licenseInput  = document.getElementById("licenseNumber");
  const expiryInput   = document.getElementById("expiryDate");
  let valid = true;

  // Reset
  licenseInput.style.borderColor = "";
  expiryInput.style.borderColor  = "";
  licenseInput.style.color       = "";
  expiryInput.style.color        = "";

  if (!licenseInput.value.trim()) {
    licenseInput.style.borderColor = "#dc2626";
    licenseInput.style.color       = "#dc2626";
    licenseInput.placeholder       = "License number is required";
    valid = false;
  }

  if (!expiryInput.value) {
    expiryInput.style.borderColor = "#dc2626";
    expiryInput.style.color       = "#dc2626";
    valid = false;
  }

  if (!valid) return;

  // success — close or show toast
  closeModal();
}
function previewPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById("photoPreview");
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}
function savePhoto() {
  const preview = document.getElementById("photoPreview");
  if (preview.src) {
    document.querySelector(".avatar img").src = preview.src;
  }
  closeModal();
}

// Close modal on backdrop click
document.getElementById("editProfileModal").addEventListener("click", function(e) {
  if (e.target === this) closeModal();
});