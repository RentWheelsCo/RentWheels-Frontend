const bookingData = [
  {
    id: 1,
    vehicleName: "Toyota Corolla",
    image: "../assets/bmwm3.png",
    dateFrom: "4/10/2025",
    dateTo: "4/15/2025",
    total: 447,
    status: "Confirmed",
    renterPhone: "+977-9801234567"
  },
  {
    id: 2,
    vehicleName: "Honda Civic",
    image: "../assets/TeslaModelX.png",
    dateFrom: "4/10/2025",
    dateTo: "4/15/2025",
    total: 447,
    status: "Confirmed",
    renterPhone: "+977-9807654321"
  },
  {
    id: 3,
    vehicleName: "BMW 3 Series",
    image: "../assets/bmwm3.png",
    dateFrom: "4/10/2025",
    dateTo: "4/15/2025",
    total: 447,
    status: "Confirmed",
    renterPhone: "+977-9812345678"
  },
  {
    id: 4,
    vehicleName: "Tesla Model 3",
    image: "../assets/TeslaModelX.png",
    dateFrom: "4/10/2025",
    dateTo: "4/15/2025",
    total: 447,
    status: "Confirmed",
    renterPhone: "+977-9898765432"
  }
];

let pendingCallId = null;

function getStatusBadge(status) {
  const map = {
    "Confirmed": "badge-confirmed",
    "Pending":   "badge-pending",
    "Cancelled": "badge-cancelled"
  };
  const cls = map[status] || "badge-confirmed";
  return `<span class="badge ${cls}">${status}</span>`;
}

function renderBookings() {
  const tbody = document.getElementById("bookingTableBody");
  tbody.innerHTML = bookingData.map((b, i) => `
    <tr data-id="${b.id}" style="animation-delay: ${i * 80}ms">
      <td>
        <div class="vehicle-cell">
          <img class="vehicle-img" src="${b.image}" alt="${b.vehicleName}">
          <div class="vehicle-name">${b.vehicleName}</div>
        </div>
      </td>
      <td>${b.dateFrom} To ${b.dateTo}</td>
      <td>$${b.total}</td>
      <td>${getStatusBadge(b.status)}</td>
      <td>
        <button class="btn-call-outline" onclick="openCallModal(${b.id})">Call</button>
      </td>
    </tr>
  `).join("");
}

// ── Call Modal ──
function openCallModal(id) {
  const b = bookingData.find(x => x.id === id);
  if (!b) return;
  pendingCallId = id;
  document.getElementById("callVehicleName").textContent = b.vehicleName;
  document.getElementById("callNumber").textContent = b.renterPhone;
  document.getElementById("callModal").style.display = "flex";
}
function closeCallModal() {
  pendingCallId = null;
  document.getElementById("callModal").style.display = "none";
}

// ── Nav ──
function initNav() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", function (e) {
      const page = this.dataset.page;

      if (page === "dashboard") {
        window.location.href = "dashboard.html";
        return;
      }
      if (page === "add-vehicle") {
        window.location.href = "Add_vehicle.html";
        return;
      }
      if (page === "manage_vehicle") {
        window.location.href = "Manage_vehicle.html";
        return;
      }

      e.preventDefault();
      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

// ── Edit Profile Modal ──
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
  document.getElementById("mainOptions").style.display = "none";
  document.getElementById("photoEdit").style.display   = "none";
  document.getElementById("licenseEdit").style.display = "block";
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
["editProfileModal", "callModal"].forEach(id => {
  document.getElementById(id).addEventListener("click", function (e) {
    if (e.target === this) {
      this.style.display = "none";
      if (id === "callModal") pendingCallId = null;
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  renderBookings();
  initNav();
});