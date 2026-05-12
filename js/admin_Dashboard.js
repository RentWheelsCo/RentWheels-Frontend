// ── RenWheels Admin Dashboard ──

// ── BOOKING DATA ──
let bookings = [
  { id: 1, car: "Toyota Fortuner",  owner: "Ramesh Sharma",  bookedBy: "Anita KC",     start: "2025-04-01", due: "2025-04-05", insurance: "Half Insurance", price: "NPR 12,500" },
  { id: 2, car: "Honda City",       owner: "Sita Thapa",     bookedBy: "Bikash Rai",   start: "2025-04-03", due: "2025-04-06", insurance: "No Insurance",   price: "NPR 6,800"  },
  { id: 3, car: "Hyundai i20",      owner: "Gopal Magar",    bookedBy: "Priya Joshi",  start: "2025-04-07", due: "2025-04-10", insurance: "Half Insurance",    price: "NPR 9,200"  },
  { id: 4, car: "Suzuki Swift",     owner: "Nisha Gurung",   bookedBy: "Roshan Oli",   start: "2025-04-09", due: "2025-04-11", insurance: "No Insurance",   price: "NPR 5,400"  },
  { id: 5, car: "Kia Seltos",       owner: "Dipak Lama",     bookedBy: "Sunita Ale",   start: "2025-04-12", due: "2025-04-15", insurance: "Full Insurance", price: "NPR 14,000" },
];

// ── USER DATA ──
let users = [
  { id: 1, name: "Anita KC",      username: "anita_kc",    phone: "9801234567", email: "anita@mail.com"  },
  { id: 2, name: "Bikash Rai",    username: "bikash_rai",  phone: "9807654321", email: "bikash@mail.com" },
  { id: 3, name: "Priya Joshi",   username: "priya_j",     phone: "9812345678", email: "priya@mail.com"  },
  { id: 4, name: "Roshan Oli",    username: "roshan_oli",  phone: "9856781234", email: "roshan@mail.com" },
  { id: 5, name: "Sunita Ale",    username: "sunita_ale",  phone: "9845671234", email: "sunita@mail.com" },
];

// ── VEHICLE DATA ──
let vehicles = [
  { id: 1, name: "Toyota Fortuner", owner: "Ramesh Sharma",  dailyPrice: "NPR 2,500", booked: true,  icon: "🚙" },
  { id: 2, name: "Honda City",      owner: "Sita Thapa",     dailyPrice: "NPR 1,700", booked: true,  icon: "🚗" },
  { id: 3, name: "Hyundai i20",     owner: "Gopal Magar",    dailyPrice: "NPR 1,400", booked: false, icon: "🚗" },
  { id: 4, name: "Suzuki Swift",    owner: "Nisha Gurung",   dailyPrice: "NPR 1,200", booked: true,  icon: "🚘" },
  { id: 5, name: "Kia Seltos",      owner: "Dipak Lama",     dailyPrice: "NPR 2,800", booked: false, icon: "🛻" },
];

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
        <td><div class="avatar">${initials(r.name)}</div></td>
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
        <td><div class="photo-box">${r.icon}</div></td>
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
    }));

    const vehicleRows = Array.isArray(vehiclesPayload?.data?.vehicles) ? vehiclesPayload.data.vehicles : [];
    vehicles = vehicleRows.map((v) => ({
      id: v.id,
      name: v.name || "Vehicle",
      owner: v?.owner?.name || "-",
      dailyPrice: formatNpr(v.dailyPrice),
      booked: Number(v.activeBookingsCount || 0) > 0,
      icon: "🚗",
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
