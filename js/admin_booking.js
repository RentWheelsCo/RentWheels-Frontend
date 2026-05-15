function formatDateISO(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toISOString().split("T")[0];
}

function formatNpr(value) {
  const amount = Number(value || 0);
  return `NPR ${amount.toLocaleString()}`;
}

function statusClass(status) {
  const s = String(status || "").toUpperCase();
  if (s === "CONFIRMED") return "status-confirmed";
  if (s === "COMPLETED") return "status-completed";
  if (s === "CANCELLED") return "status-cancelled";
  return "status-pending";
}

function renderBookings(rows) {
  const list = document.getElementById("bookingsList");
  const empty = document.getElementById("emptyState");

  if (!list) return;

  if (!rows.length) {
    list.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    return;
  }

  if (empty) empty.classList.add("hidden");

  list.innerHTML = rows
    .map((b) => {
      const vehicleName = b?.vehicle?.name || "Vehicle";
      const ownerName = b?.vehicle?.owner?.name || "-";
      const renterName = b?.renter?.name || "-";
      const pickup = formatDateISO(b.pickupDate);
      const ret = formatDateISO(b.returnDate);
      const ins = b.insuranceType || "-";
      const total = formatNpr(b.totalAmount);

      return `
        <article class="booking-card">
          <div class="booking-card__top">
            <div class="booking-card__title">
              <h3>${vehicleName}</h3>
              <div class="booking-card__meta">#${b.id} • ${pickup} → ${ret}</div>
            </div>
            <span class="booking-status ${statusClass(b.status)}">${b.status || "PENDING"}</span>
          </div>

          <div class="booking-card__grid">
            <div class="booking-field">
              <div class="booking-field__label">Owner</div>
              <div class="booking-field__value">${ownerName}</div>
            </div>
            <div class="booking-field">
              <div class="booking-field__label">Renter</div>
              <div class="booking-field__value">${renterName}</div>
            </div>
            <div class="booking-field">
              <div class="booking-field__label">Insurance</div>
              <div class="booking-field__value">${ins}</div>
            </div>
            <div class="booking-field">
              <div class="booking-field__label">Total</div>
              <div class="booking-field__value">${total}</div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadBookings() {
  const list = document.getElementById("bookingsList");
  const empty = document.getElementById("emptyState");
  if (!list) return;

  list.innerHTML = `<div style="color:#7b8292;font-size:13px;">Loading bookings…</div>`;
  if (empty) empty.classList.add("hidden");

  const payload = await window.RW_API.request("/admin/bookings", { params: { page: 1, limit: 50 } });
  const rows = Array.isArray(payload?.data?.bookings) ? payload.data.bookings : [];
  renderBookings(rows);
}

document.addEventListener("DOMContentLoaded", () => {
  loadBookings().catch((err) => {
    console.error("Admin bookings load error:", err);
    const list = document.getElementById("bookingsList");
    const empty = document.getElementById("emptyState");
    if (list) list.innerHTML = `<div style="color:#b91c1c;font-size:13px;">${err?.message || "Failed to load bookings."}</div>`;
    if (empty) empty.classList.add("hidden");
  });
});

