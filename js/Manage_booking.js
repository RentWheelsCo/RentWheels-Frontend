



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

const VEHICLE_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
      <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f3f4f6"/><stop offset="1" stop-color="#e5e7eb"/></linearGradient></defs>
      <rect width="640" height="420" rx="24" fill="url(#g)"/>
      <path d="M220 250c0-18 14-32 32-32h150c14 0 26 9 31 21l10 29h22c18 0 33 15 33 33v16h-28c-6 19-23 33-44 33s-38-14-44-33H288c-6 19-23 33-44 33s-38-14-44-33h-28v-32c0-21 17-38 38-38h26l8-22c5-14 17-23 32-23h135" fill="none" stroke="#9ca3af" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="244" cy="318" r="18" fill="none" stroke="#9ca3af" stroke-width="10"/>
      <circle cx="440" cy="318" r="18" fill="none" stroke="#9ca3af" stroke-width="10"/>
    </svg>`,
  );

function getStatusBadge(status) {
  const map = {
    "Confirmed": "badge-confirmed",
    "Pending": "badge-pending",
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

function renderBookingSkeletonRows(rowCount = 6) {
  const tbody = document.getElementById("bookingTableBody");
  if (!tbody) return;

  tbody.innerHTML = Array.from({ length: rowCount })
    .map(
      () => `
        <tr aria-hidden="true">
          <td>
            <div class="vehicle-cell">
              <div class="rw-skeleton rw-skeleton--block rw-skeleton--img rw-table-skel-img"></div>
              <div>
                <div class="rw-skeleton rw-skeleton--block" style="height:12px;width:160px;margin-top:6px;border-radius:10px"></div>
              </div>
            </div>
          </td>
          <td><div class="rw-skeleton rw-skeleton--block" style="height:10px;width:160px;border-radius:999px"></div></td>
          <td><div class="rw-skeleton rw-skeleton--block" style="height:10px;width:90px;border-radius:999px"></div></td>
          <td><div class="rw-skeleton rw-skeleton--block" style="height:14px;width:110px;border-radius:999px"></div></td>
          <td>
            <div style="display:flex;justify-content:flex-start;gap:10px;">
              <div class="rw-skeleton rw-skeleton--block" style="height:34px;width:92px;border-radius:12px"></div>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

async function loadBookings() {
  renderBookingSkeletonRows(6);
  const tbody = document.getElementById('bookingTableBody');
  if (tbody) tbody.classList.remove('hidden');



  try {
    const payload = await window.RW_API.request("/bookings/as-owner", {
      params: { limit: 50 },
    });

    const rows = Array.isArray(payload?.data?.bookings) ? payload.data.bookings : [];
    bookingData = rows.map((b) => ({
      id: b.id,
      vehicleName: b?.vehicle?.name || "Vehicle",
      image: (Array.isArray(b?.vehicle?.photos) && b.vehicle.photos.length ? b.vehicle.photos[0] : null) || VEHICLE_PLACEHOLDER,
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
  document.getElementById("photoEdit").style.display = "none";
  document.getElementById("licenseEdit").style.display = "none";
}
function showPhotoEdit() {
  document.getElementById("mainOptions").style.display = "none";
  document.getElementById("photoEdit").style.display = "block";
  document.getElementById("licenseEdit").style.display = "none";
}
function showLicenseEdit() {
  document.getElementById("mainOptions").style.display = "none";
  document.getElementById("photoEdit").style.display = "none";
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
  const expiryInput = document.getElementById("expiryDate");
  let valid = true;
  licenseInput.style.borderColor = "";
  expiryInput.style.borderColor = "";
  licenseInput.style.color = "";
  expiryInput.style.color = "";
  if (!licenseInput.value.trim()) {
    licenseInput.style.borderColor = "#dc2626";
    licenseInput.style.color = "#dc2626";
    licenseInput.placeholder = "License number is required";
    valid = false;
  }
  if (!expiryInput.value) {
    expiryInput.style.borderColor = "#dc2626";
    expiryInput.style.color = "#dc2626";
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
  // COOKIE AUTH IMPLEMENTED: protected by 401 redirect in api.js
  bindLogout();
  loadBookings();
  initNav();
});

