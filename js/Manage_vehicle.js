



function bindLogout() {
  const logoutLink = document.getElementById("rw-sidebar-logout");
  if (!logoutLink) return;
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

let vehicleData = [];
let pendingDeleteId = null;

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
  if (status === "Available") {
    return `<span class="badge badge-available">Available</span>`;
  }
  return `<span class="badge badge-not-available">Not Available</span>`;
}

function setTableMessage(message) {
  const tbody = document.getElementById("vehicleTableBody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#7b8292;padding:18px;">${message}</td></tr>`;
}

function uiStatusFromAvailability(status) {
  return String(status || "").toUpperCase() === "AVAILABLE" ? "Available" : "Not Available";
}

function renderVehicleSkeletonRows(rowCount = 6) {
  const tbody = document.getElementById("vehicleTableBody");
  if (!tbody) return;

  tbody.innerHTML = Array.from({ length: rowCount })
    .map(
      () => `
        <tr aria-hidden="true">
          <td>
            <div class="vehicle-cell">
              <div class="rw-skeleton rw-skeleton--block rw-skeleton--img rw-table-skel-img"></div>
              <div>
                <div class="rw-skeleton rw-skeleton--block" style="height:12px;width:140px;margin-top:6px;border-radius:10px"></div>
                <div class="rw-skeleton rw-skeleton--block" style="height:10px;width:190px;margin-top:10px;border-radius:999px"></div>
              </div>
            </div>
          </td>
          <td><div class="rw-skeleton rw-skeleton--block" style="height:10px;width:120px;border-radius:999px"></div></td>
          <td><div class="rw-skeleton rw-skeleton--block" style="height:10px;width:90px;border-radius:999px"></div></td>
          <td><div class="rw-skeleton rw-skeleton--block" style="height:10px;width:120px;border-radius:999px"></div></td>
          <td>
            <div style="display:flex;gap:10px;align-items:center;justify-content:flex-start">
              <div class="rw-skeleton rw-skeleton--block" style="height:32px;width:32px;border-radius:10px"></div>
              <div class="rw-skeleton rw-skeleton--block" style="height:32px;width:32px;border-radius:10px"></div>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

async function loadVehicles() {
  renderVehicleSkeletonRows(6);

  try {
    const [availabilityPayload, myVehiclesPayload] = await Promise.all([
      window.RW_API.request("/bookings/my-vehicles"),
      window.RW_API.request("/vehicles/my", { params: { limit: 50 } }),
    ]);

    const mine = Array.isArray(myVehiclesPayload?.data?.vehicles) ? myVehiclesPayload.data.vehicles : [];
    const mineById = new Map(mine.map((v) => [v.id, v]));

    const availability = Array.isArray(availabilityPayload?.data?.vehicles) ? availabilityPayload.data.vehicles : [];
    vehicleData = availability.map((row) => {
      const full = mineById.get(row.id);
      const photo = Array.isArray(full?.photos) && full.photos.length ? full.photos[0] : null;
      return {
        id: row.id,
        name: row.name || "Vehicle",
        seats: row.seatingCapacity || "",
        transmission: row.transmission || "",
        category: row.category || "",
        price: Number(row.dailyPrice || 0),
        status: uiStatusFromAvailability(row.availabilityStatus),
        image: photo || VEHICLE_PLACEHOLDER,
      };
    });

    renderVehicles();
  } catch (err) {
    if (err?.status === 401) { logout(); return; }
    const message =
      (err?.data && typeof err.data === "object" ? err.data.message : null) ||
      err?.message || "Failed to load vehicles.";
    console.error("Load vehicles error:", err);
    setTableMessage(message);
  }
}

function renderVehicles() {
  const tbody = document.getElementById("vehicleTableBody");
  if (!tbody) return;
  if (!vehicleData.length) { setTableMessage("No vehicles yet."); return; }

  tbody.innerHTML = vehicleData.map((v, i) => `
    <tr data-id="${v.id}" style="animation-delay: ${i * 80}ms">
      <td>
        <div class="vehicle-cell">
          <img class="vehicle-img" src="${v.image}" alt="${v.name}">
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
          <button class="btn-icon toggle-eye" title="${v.status === 'Available' ? 'Mark as Unavailable' : 'Mark as Available'}" onclick="toggleStatus(${v.id}, this)">
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

async function toggleStatus(id, btn) {
  const v = vehicleData.find(x => x.id === id);
  if (!v) return;

  const newStatus = v.status === "Available" ? "Not Available" : "Available";
  const apiStatus = newStatus === "Available" ? "AVAILABLE" : "NOT_AVAILABLE";

  v.status = newStatus;
  const img = btn.querySelector("img");
  if (img) img.src = newStatus === "Available" ? "../assets/eye.png" : "../assets/eyeClose.png";
  btn.title = newStatus === "Available" ? "Mark as Unavailable" : "Mark as Available";

  const row = btn.closest("tr");
  if (row) {
    const badgeCell = row.cells[3];
    if (badgeCell) badgeCell.innerHTML = getStatusBadge(newStatus);
  }

  try {
    await window.RW_API.request(`/vehicles/${id}`, {
      method: "PATCH",
      body: { availabilityStatus: apiStatus },
    });
  } catch (err) {
    if (err?.status === 401) { logout(); return; }
    v.status = newStatus === "Available" ? "Not Available" : "Available";
    if (img) img.src = v.status === "Available" ? "../assets/eye.png" : "../assets/eyeClose.png";
    btn.title = v.status === "Available" ? "Mark as Unavailable" : "Mark as Available";
    if (row) {
      const badgeCell = row.cells[3];
      if (badgeCell) badgeCell.innerHTML = getStatusBadge(v.status);
    }
    alert(err?.message || "Failed to update availability.");
  }
} function openViewModal(id) {
  const v = vehicleData.find(x => x.id === id);
  if (!v) return;
  document.getElementById("viewVehicleContent").innerHTML = `
    <div class="detail-row"><span class="detail-label">Vehicle</span><span class="detail-value">${v.name}</span></div>
    <div class="detail-row"><span class="detail-label">Category</span><span class="detail-value">${v.category}</span></div>
    <div class="detail-row"><span class="detail-label">Price</span><span class="detail-value">$${v.price}/day</span></div>
    <div class="detail-row"><span class="detail-label">Seats</span><span class="detail-value">${v.seats}</span></div>
    <div class="detail-row"><span class="detail-label">Transmission</span><span class="detail-value" style="text-transform:capitalize">${v.transmission}</span></div>
    <div class="detail-row"><span class="detail-label">Status</span><span>${getStatusBadge(v.status)}</span></div>
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
async function confirmDelete() {
  if (pendingDeleteId === null) return;
  const id = pendingDeleteId;

  try {
    await window.RW_API.request(`/vehicles/${id}`, { method: "DELETE" });
    const idx = vehicleData.findIndex(x => x.id === id);
    if (idx !== -1) vehicleData.splice(idx, 1);
    closeDeleteModal();
    renderVehicles();
  } catch (err) {
    if (err?.status === 401) { logout(); return; }
    const message =
      (err?.data && typeof err.data === "object" ? err.data.message : null) ||
      err?.message || "Failed to delete vehicle.";
    console.error("Delete vehicle error:", err);
    alert(message);
  }
}

// ── Nav ──
function initNav() {
  document.querySelectorAll(".nav-item").forEach(item => {
    if (item.classList.contains("nav-logout")) return;
    if (item.classList.contains("nav-logout")) return;
    item.addEventListener("click", function (e) {
      const page = this.dataset.page;
      if (page === "dashboard") { window.location.href = "dashboard.html"; return; }
      if (page === "add-vehicle") { window.location.href = "Add_vehicle.html"; return; }
      if (page === "manage_booking") { window.location.href = "Manage_booking.html"; return; }
      e.preventDefault();
      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

// ── Edit Profile Modal ──
function openModal() { showMainOptions(); document.getElementById("editProfileModal").style.display = "flex"; }
function closeModal() { document.getElementById("editProfileModal").style.display = "none"; }
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
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { const p = document.getElementById("licensePreview"); p.src = e.target.result; p.style.display = "block"; };
  reader.readAsDataURL(file);
}
function saveLicense() {
  const licenseInput = document.getElementById("licenseNumber");
  const expiryInput = document.getElementById("expiryDate");
  let valid = true;
  licenseInput.style.borderColor = ""; expiryInput.style.borderColor = "";
  licenseInput.style.color = ""; expiryInput.style.color = "";
  if (!licenseInput.value.trim()) { licenseInput.style.borderColor = "#dc2626"; licenseInput.style.color = "#dc2626"; licenseInput.placeholder = "License number is required"; valid = false; }
  if (!expiryInput.value) { expiryInput.style.borderColor = "#dc2626"; expiryInput.style.color = "#dc2626"; valid = false; }
  if (!valid) return;
  closeModal();
}
function previewPhoto(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { const p = document.getElementById("photoPreview"); p.src = e.target.result; p.style.display = "block"; };
  reader.readAsDataURL(file);
}
function savePhoto() {
  const preview = document.getElementById("photoPreview");
  if (preview.src) document.querySelector(".avatar img").src = preview.src;
  closeModal();
}

["editProfileModal", "viewVehicleModal", "deleteModal"].forEach(id => {
  document.getElementById(id).addEventListener("click", function (e) {
    if (e.target === this) {
      this.style.display = "none";
      if (id === "deleteModal") pendingDeleteId = null;
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // COOKIE AUTH IMPLEMENTED: protected by 401 redirect in api.js
  bindLogout();
  loadVehicles();
  initNav();
});





