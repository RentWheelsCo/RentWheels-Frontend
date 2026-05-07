const clipboard = `<img src="../assets/clipboard.png" alt="Booking" width="25" height="25">`;

function getToken() { return localStorage.getItem("authToken"); }

function bindLogout() {
  const logoutLink = document.getElementById("rw-sidebar-logout");
  if (!logoutLink) return;
  logoutLink.addEventListener("click", (e) => { e.preventDefault(); logout(); });
}

function badgeClass(status) {
  const normalized = String(status || "").toUpperCase();
  const map = { PENDING: "badge-pending", CONFIRMED: "badge-confirmed", COMPLETED: "badge-completed" };
  return map[normalized] || "badge-pending";
}

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "numeric", day: "numeric" });
}

function setProfileName() {
  const el = document.querySelector(".profile-name");
  if (!el) return;
  try {
    const user = JSON.parse(localStorage.getItem("authUser") || "null");
    if (user?.name) el.textContent = user.name;
  } catch { /* ignore */ }
}

function drawDonutChart() {
  requestAnimationFrame(() => {
    const canvas = document.getElementById("fleetChart");
    if (!canvas) return;

    canvas.width  = 180;
    canvas.height = 180;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 180, 180);

    ctx.beginPath();
    ctx.arc(90, 90, 76, 0, 2 * Math.PI);
    ctx.fillStyle = "#e2e5ec";
    ctx.fill();

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(90, 90, 50, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
  });
}

function renderDashboard(data) {
  document.getElementById("totalVehicles").textContent = data?.totalVehicles ?? 0;
  document.getElementById("totalBookings").textContent = data?.totalBookings ?? 0;

  const revenue = Number(data?.monthlyRevenue || 0);
  document.getElementById("monthlyRevenue").textContent = "Rs " + revenue.toLocaleString();

  drawDonutChart();

  const list   = document.getElementById("bookingsList");
  const bookings = Array.isArray(data?.recentBookings) ? data.recentBookings : [];
  const recent = bookings.slice(0, 4);

  if (recent.length === 0) {
    list.innerHTML = `<div style="color:#7b8292;font-size:13px;">No recent bookings yet.</div>`;
    return;
  }

  list.innerHTML = recent.map((b, i) => `
    <div class="booking-row" style="animation-delay:${i * 80}ms">
      <div class="booking-icon-wrap">${clipboard}</div>
      <div class="booking-meta">
        <div class="booking-name">${b.vehicleName || "Booking"}</div>
        <div class="booking-date">${formatDate(b.pickupDate) || ""}</div>
      </div>
      <span class="booking-price">$${Number(b.totalAmount || 0).toLocaleString()}</span>
      <span class="badge ${badgeClass(b.status)}">${b.status || ""}</span>
    </div>
  `).join("");
}

async function loadDashboard() {
  let payload;
  try {
    payload = await window.RW_API.request("/user/seller/dashboard", { auth: true });
  } catch (err) {
    if (err?.status === 401) { logout(); return; }
    const msg = (err?.data && typeof err.data === "object" ? err.data.message : null) || err?.message || "Failed to load dashboard data.";
    throw new Error(msg);
  }

  const data    = payload?.data || {};
  const monthly = Array.isArray(data.monthlyRevenue) ? data.monthlyRevenue : [];
  const now     = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const current    = monthly.find(m => m?.month === currentKey);
  const fallback   = monthly.length ? monthly[monthly.length - 1] : null;

  renderDashboard({
    totalVehicles:  data.totalVehicles,
    totalBookings:  data.totalBookings,
    monthlyRevenue: current?.revenue ?? fallback?.revenue ?? 0,
    recentBookings: data.recentBookings,
  });
}

function initNav() {
  document.querySelectorAll(".nav-item").forEach(item => {
    if (item.classList.contains("nav-logout")) return;
    item.addEventListener("click", function () {
      const page = this.dataset.page;
      if (page === "add-vehicle")    { window.location.href = "Add_vehicle.html";    return; }
      if (page === "manage_vehicle") { window.location.href = "Manage_vehicle.html"; return; }
      if (page === "manage_booking") { window.location.href = "Manage_booking.html"; return; }
      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  bindLogout();
  setProfileName();
  initNav();
  drawDonutChart();
  loadDashboard().catch((err) => {
    console.error("Dashboard load error:", err);
    const list = document.getElementById("bookingsList");
    if (list) list.innerHTML = `<div style="color:#b91c1c;font-size:13px;">${err?.message || "Failed to load dashboard."}</div>`;
  });

  // ✅ FIX 1: Attach avatar edit button click via JS (not inline onclick)
  document.querySelector(".avatar-edit-btn")?.addEventListener("click", function (e) {
    e.stopPropagation();
    openModal();
  });

  // ✅ FIX 2: Modal backdrop click to close — moved inside DOMContentLoaded to avoid null crash
  document.getElementById("editProfileModal")?.addEventListener("click", function (e) {
    if (e.target === this) closeModal();
  });
});

/* ── Modal controls ── */
function openModal()       { showMainOptions(); document.getElementById("editProfileModal").style.display = "flex"; }
function closeModal()      { document.getElementById("editProfileModal").style.display = "none"; }
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
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { const p = document.getElementById("licensePreview"); p.src = e.target.result; p.style.display = "block"; };
  reader.readAsDataURL(file);
}
function saveLicense() {
  const licenseInput = document.getElementById("licenseNumber");
  const expiryInput  = document.getElementById("expiryDate");
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