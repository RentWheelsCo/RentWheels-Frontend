



function bindLogout() {
  const logoutLink = document.getElementById("rw-sidebar-logout");
  if (!logoutLink) return;
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

let bookingData = [];

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

function setTableMessage(message) {
  const tbody = document.getElementById("bookingTableBody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#7b8292;padding:18px;">${message}</td></tr>`;
}

function formatDateShort(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function uiStatusFromApi(status) {
  const s = String(status || "").toUpperCase();
  if (s === "PENDING") return "Pending";
  if (s === "CANCELLED") return "Cancelled";
  return "Confirmed";
}

async function loadBookings() {
  setTableMessage("Loading bookings...");

  try {
    const payload = await window.RW_API.request("/bookings/as-owner", {
      auth: true,
      params: { limit: 50 },
    });

    const rows = Array.isArray(payload?.data?.bookings) ? payload.data.bookings : [];
    bookingData = rows.map((b) => ({
      id: b.id,
      vehicleName: b?.vehicle?.name || "Vehicle",
      image: (Array.isArray(b?.vehicle?.photos) && b.vehicle.photos.length ? b.vehicle.photos[0] : null) || "../assets/bmwm3.png",
      dateFrom: formatDateShort(b.pickupDate),
      dateTo: formatDateShort(b.returnDate),
      total: Number(b.totalAmount || 0),
      status: uiStatusFromApi(b.status),
      renterPhone: b?.renter?.phone || "N/A",
    }));

    renderBookings();
  } catch (err) {
    if (err?.status === 401) {
      logout();
      return;
    }
    const message =
      (err?.data && typeof err.data === "object" ? err.data.message : null) ||
      err?.message ||
      "Failed to load bookings.";
    console.error("Load bookings error:", err);
    setTableMessage(message);
  }
}

function renderBookings() {
  const tbody = document.getElementById("bookingTableBody");
  if (!tbody) return;
  if (!bookingData.length) {
    setTableMessage("No bookings yet.");
    return;
  }
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
    if (item.classList.contains("nav-logout")) return;
    if (item.classList.contains("nav-logout")) return;
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
  requireAuth();
  bindLogout();
  loadBookings();
  initNav();
});

