// ── RenWheels Admin Dashboard ──

// ── BOOKING DATA ──
let bookings = [];

// ── USER DATA ──
let users = [];

// ── VEHICLE DATA ──
let vehicles = [];

// ── Helpers ──
function insClass(type) {
  if (type === "Half Insurance") return "ins-premium";
  if (type === "Full Insurance")    return "ins-full";
  return "ins-basic";
}

function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Render Bookings ──
if (false) document.getElementById("booking-tbody").innerHTML = bookings.slice(0, 5).map(r => `
  <tr>
    <td><span class="id-cell">#${r.id}</span></td>
    <td>${r.car}</td>
    <td>${r.owner}</td>
    <td>${r.bookedBy}</td>
    <td>${r.start}</td>
    <td>${r.due}</td>
    <td><span class="ins ${insClass(r.insurance)}">${r.insurance}</span></td>
    <td class="price-cell">${r.price}</td>
  </tr>
`).join("");

// ── Render Users ──
if (false) document.getElementById("user-tbody").innerHTML = users.slice(0, 5).map(r => `
  <tr>
    <td><span class="id-cell">#${r.id}</span></td>
    <td><div class="avatar">${initials(r.name)}</div></td>
    <td>${r.name}</td>
    <td>${r.username}</td>
    <td>${r.phone}</td>
    <td>${r.email}</td>
  </tr>
`).join("");

// ── Render Vehicles ──
if (false) document.getElementById("vehicle-tbody").innerHTML = vehicles.slice(0, 5).map(r => `
  <tr>
    <td><span class="id-cell">#${r.id}</span></td>
    <td><div class="photo-box">${r.icon}</div></td>
    <td>${r.name}</td>
    <td>${r.owner}</td>
    <td class="price-cell">${r.dailyPrice}</td>
    <td><span class="status ${r.booked ? 'status-booked' : 'status-free'}">${r.booked ? 'Booked' : 'Available'}</span></td>
  </tr>
`).join("");

function logout() {
  window.RW_API?.auth?.logout?.().catch(() => {});
  document.cookie = "authToken=; Max-Age=0; path=/";
  window.location.href = "login.html";
}

function formatDateISO(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function formatNpr(value) {
  const amount = Number(value || 0);
  return `NPR ${amount.toLocaleString()}`;
}

function safeUsername(email) {
  const e = String(email || "");
  const at = e.indexOf("@");
  return at > 0 ? e.slice(0, at) : e || "-";
}

function renderAll() {
  const bookingTbody = document.getElementById("booking-tbody");
  const userTbody = document.getElementById("user-tbody");
  const vehicleTbody = document.getElementById("vehicle-tbody");

  if (bookingTbody) {
    bookingTbody.innerHTML = bookings.slice(0, 5).map(r => `
      <tr>
        <td><span class="id-cell">#${r.id}</span></td>
        <td>${r.car}</td>
        <td>${r.owner}</td>
        <td>${r.bookedBy}</td>
        <td>${r.start}</td>
        <td>${r.due}</td>
        <td><span class="ins ${insClass(r.insurance)}">${r.insurance}</span></td>
        <td class="price-cell">${r.price}</td>
      </tr>
    `).join("");
  }

  if (userTbody) {
    userTbody.innerHTML = users.slice(0, 5).map(r => `
      <tr>
        <td><span class="id-cell">#${r.id}</span></td>
        <td>
          ${r.avatar
            ? `<img src="${r.avatar}" class="dashboard-user-avatar" alt="${r.name}"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
              /><div class="avatar" style="display:none">${initials(r.name)}</div>`
            : `<div class="avatar">${initials(r.name)}</div>`
          }
        </td>
        <td>${r.name}</td>
        <td>${r.username}</td>
        <td>${r.phone}</td>
        <td>${r.email}</td>
      </tr>
    `).join("");
  }

  if (vehicleTbody) {
    vehicleTbody.innerHTML = vehicles.slice(0, 5).map(r => `
      <tr>
        <td><span class="id-cell">#${r.id}</span></td>
        <td>
          ${r.photo
            ? `<img src="${r.photo}" class="dashboard-vehicle-photo" alt="${r.name}"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
              /><div class="photo-box dashboard-vehicle-placeholder">🚗</div>`
            : `<div class="photo-box dashboard-vehicle-placeholder">🚗</div>`
          }
        </td>
        <td>${r.name}</td>
        <td>${r.owner}</td>
        <td class="price-cell">${r.dailyPrice}</td>
        <td><span class="status ${r.booked ? 'status-booked' : 'status-free'}">${r.booked ? 'Booked' : 'Available'}</span></td>
      </tr>
    `).join("");
  }
}

async function loadAdminDashboard() {
  try {
    const [bookingsPayload, vehiclesPayload, usersPayload] = await Promise.all([
      window.RW_API.request("/admin/bookings", { params: { limit: 5 } }),
      window.RW_API.request("/admin/vehicles", { params: { limit: 5 } }),
      window.RW_API.request("/auth/admin/users", { params: { limit: 5 } }),
    ]);

    const bookingRows = Array.isArray(bookingsPayload?.data?.bookings) ? bookingsPayload.data.bookings : [];
    bookings = bookingRows.map((b) => ({
      id: b.id,
      car: b?.vehicle?.name || "Vehicle",
      owner: b?.vehicle?.owner?.name || "-",
      bookedBy: b?.renter?.name || "-",
      start: formatDateISO(b.pickupDate),
      due: formatDateISO(b.returnDate),
      insurance: b.insuranceType || "-",
      price: formatNpr(b.totalAmount),
    }));

    const userRows = Array.isArray(usersPayload?.data?.users) ? usersPayload.data.users : [];
    users = userRows.map((u) => ({
      id: u.id,
      name: u.name || "-",
      username: safeUsername(u.email),
      phone: u.phone || "-",
      email: u.email || "-",
      avatar: u.avatar || "",
    }));

    const vehicleRows = Array.isArray(vehiclesPayload?.data?.vehicles) ? vehiclesPayload.data.vehicles : [];
    vehicles = vehicleRows.map((v) => ({
      id: v.id,
      name: v.name || "Vehicle",
      owner: v?.owner?.name || "-",
      dailyPrice: formatNpr(v.dailyPrice),
      booked: Number(v.activeBookingsCount || 0) > 0,
      photo: Array.isArray(v.photos) && v.photos.length ? v.photos[0] : "",
    }));
  } catch (err) {
    if (err?.status === 401) {
      logout();
      return;
    }
    console.error("Admin dashboard load error:", err);
  }

  renderAll();
}

document.addEventListener("DOMContentLoaded", () => {
  // COOKIE AUTH IMPLEMENTED: protected by 401 redirect in api.js
  loadAdminDashboard();
});
