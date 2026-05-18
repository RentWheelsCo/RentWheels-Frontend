
'use strict';


let BOOKINGS_DATA = [];

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

const ICONS = {
  calendar: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
    <path d="M2 7h12" stroke="currentColor" stroke-width="1.3"/>
    <path d="M5 2v2M11 2v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`,
  pin: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2C5.79 2 4 3.79 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.21-1.79-4-4-4z" stroke="currentColor" stroke-width="1.3"/>
    <circle cx="8" cy="6" r="1.5" stroke="currentColor" stroke-width="1.3"/>
  </svg>`,
  shield: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L3 4v4c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6V4L8 2z" stroke="currentColor" stroke-width="1.3"/>
  </svg>`,
};


const STATUS_LABELS = { confirmed: 'confirmed', pending: 'pending', cancelled: 'cancelled' };

function statusBadgeHTML(status) {
  const label = STATUS_LABELS[status] ?? status;
  return `<span class="status-badge status-badge--${status}">${label}</span>`;
}

function logout() {
  window.RW_API?.auth?.logout?.().catch(() => { });
  document.cookie = "authToken=; Max-Age=0; path=/";
  window.location.href = "login.html";
}

function formatDateShort(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function statusKeyFromApi(status) {
  const s = String(status || "").toUpperCase();
  if (s === "PENDING") return "pending";
  if (s === "CANCELLED") return "cancelled";
  return "confirmed";
}

function setListMessage(message) {
  const list = document.getElementById('bookingsList');
  const emptyState = document.getElementById('emptyState');
  if (!list || !emptyState) return;
  emptyState.classList.add('hidden');
  list.classList.remove('hidden');
  list.innerHTML = `<div style="color:#7b8292;font-size:14px;padding:10px 2px;">${message}</div>`;
}

function renderBookingSkeletonRows(rowCount = 6) {
  const list = document.getElementById('bookingsList');
  const emptyState = document.getElementById('emptyState');
  if (!list) return;
  if (emptyState) emptyState.classList.add('hidden');

  list.innerHTML = Array.from({ length: rowCount }).map(() => `
    <article class="booking-card" aria-hidden="true">
      <div class="booking-card__left">
        <div class="booking-card__img-wrap">
          <div class="rw-skeleton rw-skeleton--img rw-skeleton--block"></div>
        </div>
        <div class="booking-card__vehicle">
          <div class="rw-skeleton rw-skeleton--block" style="height:12px;width:180px;border-radius:10px;"></div>
          <div class="rw-skeleton rw-skeleton--block" style="height:10px;width:140px;margin-top:10px;border-radius:999px;"></div>
        </div>
      </div>

      <div class="booking-card__details">
        <div class="booking-card__top-row">
          <div class="rw-skeleton rw-skeleton--block" style="height:12px;width:120px;border-radius:10px;"></div>
          <div class="rw-skeleton rw-skeleton--block" style="height:16px;width:90px;border-radius:999px;"></div>
        </div>
        <div class="rw-skeleton rw-skeleton--block" style="height:10px;width:220px;margin-top:12px;border-radius:10px;"></div>
        <div class="rw-skeleton rw-skeleton--block" style="height:10px;width:180px;margin-top:8px;border-radius:10px;"></div>
      </div>

      <div class="booking-card__price-col">
        <div class="rw-skeleton rw-skeleton--block" style="height:10px;width:120px;border-radius:10px;"></div>
        <div class="rw-skeleton rw-skeleton--block" style="height:14px;width:140px;margin-top:10px;border-radius:10px;"></div>
        <div class="rw-skeleton rw-skeleton--block" style="height:10px;width:160px;margin-top:8px;border-radius:10px;"></div>
      </div>
    </article>
  `).join('');
}

async function loadBookings() {
  renderBookingSkeletonRows(6);

  const list = document.getElementById('bookingsList');
  const emptyState = document.getElementById('emptyState');
  if (emptyState) emptyState.classList.add('hidden');
  if (list) list.classList.remove('hidden');


  try {
    const payload = await window.RW_API.bookings.getMyBookings({ limit: 50 });
    const rows = Array.isArray(payload?.data?.bookings) ? payload.data.bookings : [];

    BOOKINGS_DATA = rows.map((b) => {
      const v = b?.vehicle || null;
      const image =
        (Array.isArray(v?.photos) && v.photos.length ? v.photos[0] : null) || VEHICLE_PLACEHOLDER;

      return {
        id: b.id,
        bookingNumber: `Booking #${b.id}`,
        status: statusKeyFromApi(b.status),
        vehicle: {
          name: v?.name || "Vehicle",
          year: String(v?.year ?? ""),
          type: v?.type?.value || v?.category?.value || "",
          location: v?.location?.value || null,
          image,
        },
        rentalPeriod: { from: formatDateShort(b.pickupDate), to: formatDateShort(b.returnDate) },
        pickupLocation: null,
        returnLocation: null,
        insuranceType: b.insuranceType || "",
        totalPrice: Number(b.totalAmount || 0),
        bookedOn: formatDateShort(b.createdAt),
      };
    });

    renderBookings(BOOKINGS_DATA);
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
    setListMessage(message);
  }
}


function buildDetailRow(icon, label, value) {
  if (!value) return '';
  return `
    <div class="detail-row">
      <span class="detail-row__label">${ICONS[icon]} ${label}</span>
      <span class="detail-row__value">${value}</span>
    </div>`;
}


function buildBookingCard(booking, index) {
  const { vehicle, rentalPeriod, pickupLocation, returnLocation, insuranceType } = booking;

  // Meta line: year · type  (· location only if present)
  const metaParts = [vehicle.year, vehicle.type, vehicle.location].filter(Boolean);
  const vehicleMeta = metaParts.join(' · ');

  let detailsHTML = buildDetailRow('calendar', 'Rental Period',
    `${rentalPeriod.from} - ${rentalPeriod.to}`);
  if (pickupLocation) detailsHTML += buildDetailRow('pin', 'Pick-up Location', pickupLocation);
  if (returnLocation) detailsHTML += buildDetailRow('pin', 'Return Location', returnLocation);
  if (insuranceType) detailsHTML += buildDetailRow('shield', 'Insurance Type', insuranceType);

  const delay = (index * 0.1).toFixed(1);

  return `
    <article class="booking-card" data-id="${booking.id}" style="animation-delay:${delay}s">

      <!-- LEFT: image stacked above vehicle name -->
      <div class="booking-card__left">
        <div class="booking-card__img-wrap">
          <img
            src="${vehicle.image}"
            alt="${vehicle.name}"
            class="booking-card__img"
            loading="lazy"
            onerror="this.src='${VEHICLE_PLACEHOLDER}'"
          />
        </div>
        <div class="booking-card__vehicle">
          <p class="booking-card__vehicle-name">${vehicle.name}</p>
          <p class="booking-card__vehicle-meta">${vehicleMeta}</p>
        </div>
      </div>

      <!-- MIDDLE: booking details -->
      <div class="booking-card__details">
        <div class="booking-card__top-row">
          <span class="booking-card__number">${booking.bookingNumber}</span>
          ${statusBadgeHTML(booking.status)}
        </div>
        ${detailsHTML}
      </div>

      <!-- RIGHT: price -->
      <div class="booking-card__price-col">
        <span class="price-label">Total Price</span>
        <span class="price-amount">Rs ${booking.totalPrice}</span>
        <span class="price-booked-on">Booked on ${booking.bookedOn}</span>
      </div>

    </article>`;
}


function renderBookings(data) {
  const list = document.getElementById('bookingsList');
  const emptyState = document.getElementById('emptyState');

  if (!data || data.length === 0) {
    list.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  list.innerHTML = data.map((b, i) => buildBookingCard(b, i)).join('');
  emptyState.classList.add('hidden');
}


document.addEventListener('DOMContentLoaded', () => {
  loadBookings();

  document.getElementById('bookingsList').addEventListener('click', e => {
    const card = e.target.closest('.booking-card');
    if (!card) return;
    console.log(`[RentWheels] Open booking id=${card.dataset.id}`);
  });
});
