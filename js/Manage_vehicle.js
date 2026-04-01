const vehicleData = [
  {
    id: 1,
    name: "Toyota Corolla",
    seats: 5,
    transmission: "automatic",
    category: "Economy",
    price: 45,
    status: "Available",
    image: "../assets/bmwm3.png"
  },
  {
    id: 2,
    name: "Honda Civic",
    seats: 5,
    transmission: "automatic",
    category: "Economy",
    price: 48,
    status: "Not Available",
    image: "../assets/TeslaModelX.png"
  },
  {
    id: 3,
    name: "BMW 3 Series",
    seats: 5,
    transmission: "automatic",
    category: "Luxury",
    price: 95,
    status: "Available",
    image: "../assets/bmwm3.png"
  },
  {
    id: 4,
    name: "Tesla Model 3",
    seats: 5,
    transmission: "automatic",
    category: "Luxury",
    price: 120,
    status: "Available",
    image: "../assets/TeslaModelX.png"
  }
];

let pendingDeleteId = null;

function getStatusBadge(status) {
  if (status === "Available") {
    return `<span class="badge badge-available">Available</span>`;
  }
  return `<span class="badge badge-not-available">Not Available</span>`;
}



function renderVehicles() {
  const tbody = document.getElementById("vehicleTableBody");
  tbody.innerHTML = vehicleData.map((v, i) => `
    <tr data-id="${v.id}" style="animation-delay: ${i * 80}ms">
      <td>
        <div class="vehicle-cell">
          ${v.image
            ? `<img class="vehicle-img" src="${v.image}" alt="${v.name}">`
            : getCarSVG()
          }
          <div>
            <div class="vehicle-name">${v.name}</div>
            <div class="vehicle-meta">${v.seats} seats • ${v.transmission}</div>
          </div>
        </div>
      </td>
      <td>${v.category}</td>
      <td>$${v.price}/day</td>
      <td>${getStatusBadge(v.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon toggle-eye" title="Toggle availability" onclick="toggleStatus(${v.id})">
            <img src="${v.status === 'Available' ? '../assets/eye.png' : '../assets/eyeClose.png'}" width="20" height="20">
          </button>
          <button class="btn-icon delete" title="Remove vehicle" onclick="openDeleteModal(${v.id})">
            <img src="../assets/delete.png" width="20" height="20">
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

// ── View Modal ──
function openViewModal(id) {
  const v = vehicleData.find(x => x.id === id);
  if (!v) return;
  document.getElementById("viewVehicleContent").innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Vehicle</span>
      <span class="detail-value">${v.name}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Category</span>
      <span class="detail-value">${v.category}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Price</span>
      <span class="detail-value">$${v.price}/day</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Seats</span>
      <span class="detail-value">${v.seats}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Transmission</span>
      <span class="detail-value" style="text-transform:capitalize">${v.transmission}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Status</span>
      <span>${getStatusBadge(v.status)}</span>
    </div>
  `;
  document.getElementById("viewVehicleModal").style.display = "flex";
}
function closeViewModal() {
  document.getElementById("viewVehicleModal").style.display = "none";
}

// ── Delete Modal ──
function openDeleteModal(id) {
  const v = vehicleData.find(x => x.id === id);
  if (!v) return;
  pendingDeleteId = id;
  document.getElementById("deleteVehicleName").textContent = v.name;
  document.getElementById("deleteModal").style.display = "flex";
}
function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById("deleteModal").style.display = "none";
}
function confirmDelete() {
  if (pendingDeleteId === null) return;
  const idx = vehicleData.findIndex(x => x.id === pendingDeleteId);
  if (idx !== -1) vehicleData.splice(idx, 1);
  closeDeleteModal();
  renderVehicles();
}

// ── Nav ──
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

      if (page === "dashboard") {
        window.location.href = "../html/dashboard.html";
        return;
      }

      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

// ── Edit Profile Modal (same as dashboard) ──
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
  const licenseInput = document.getElementById("licenseNumber");
  const expiryInput  = document.getElementById("expiryDate");
  let valid = true;
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

// Close modals on backdrop click
["editProfileModal", "viewVehicleModal", "deleteModal"].forEach(id => {
  document.getElementById(id).addEventListener("click", function(e) {
    if (e.target === this) {
      this.style.display = "none";
      if (id === "deleteModal") pendingDeleteId = null;
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  renderVehicles();
  initNav();
});

function toggleStatus(id) {
  const v = vehicleData.find(x => x.id === id);
  if (!v) return;

  v.status = v.status === "Available" ? "Not Available" : "Available";

  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  // Update badge
  const badgeCell = row.cells[3];
  badgeCell.innerHTML = getStatusBadge(v.status);

  // Update eye icon
  const eyeImg = row.querySelector(".btn-icon.toggle-eye img");
  eyeImg.src = v.status === "Available" ? "../assets/eye.png" : "../assets/eyeClose.png";
}
