'use strict';

/* =============================================
   SVG ICON HELPERS
   ============================================= */
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

/* =============================================
   STATUS BADGE
   ============================================= */
const STATUS_LABELS = { confirmed: 'confirmed', pending: 'pending', cancelled: 'cancelled' };

function statusBadgeHTML(status) {
  const label = STATUS_LABELS[status] ?? status;
  return `<span class="status-badge status-badge--${status}">${label}</span>`;
}

/* =============================================
   DETAIL ROW HELPER
   ============================================= */
function buildDetailRow(icon, label, value) {
  if (!value) return '';
  return `
    <div class="detail-row">
      <span class="detail-row__label">${ICONS[icon]} ${label}</span>
      <span class="detail-row__value">${value}</span>
    </div>`;
}

/* =============================================
   CARD BUILDER
   ============================================= */
function buildBookingCard(booking, index) {
  const { vehicle, rentalPeriod, pickupLocation, returnLocation, insuranceType } = booking;

  // Meta line: year · type  (· location only if present)
  const metaParts  = [vehicle.year, vehicle.type, vehicle.location].filter(Boolean);
  const vehicleMeta = metaParts.join(' · ');

  // Build detail rows
  let detailsHTML = buildDetailRow('calendar', 'Rental Period',
    `${rentalPeriod.from} - ${rentalPeriod.to}`);
  if (pickupLocation)  detailsHTML += buildDetailRow('pin', 'Pick-up Location', pickupLocation);
  if (returnLocation)  detailsHTML += buildDetailRow('pin', 'Return Location',  returnLocation);
  if (insuranceType)   detailsHTML += buildDetailRow('shield', 'Insurance Type', insuranceType);

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
            onerror="this.src='https://placehold.co/220x155/e5e7eb/9ca3af?text=No+Image'"
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
        <span class="price-amount">Rs${booking.totalPrice}</span>
        <span class="price-booked-on">Booked on ${booking.bookedOn}</span>
      </div>

    </article>`;
}

/* =============================================
   RENDER
   ============================================= */
function renderBookings(data) {
  const list       = document.getElementById('bookingsList');
  const emptyState = document.getElementById('emptyState');

  if (!data || data.length === 0) {
    list.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  list.innerHTML = data.map((b, i) => buildBookingCard(b, i)).join('');
  emptyState.classList.add('hidden');
}

function normalizeStatus(raw) {
  const s = String(raw || '').toUpperCase();
  if (s === 'CONFIRMED') return 'confirmed';
  if (s === 'PENDING') return 'pending';
  if (s === 'CANCELLED') return 'cancelled';
  if (s === 'COMPLETED') return 'confirmed';
  return 'pending';
}

function formatDateShort(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}

async function loadMyBookings() {
  const list = document.getElementById('bookingsList');
  if (list) {
    list.classList.remove('hidden');
    list.innerHTML = `<div style="color:#7b8292;font-size:13px;">Loading bookings…</div>`;
  }

  try {
    const payload = await window.RW_API.bookings.getMyBookings({ limit: 50 });
    const rows = Array.isArray(payload?.data?.bookings) ? payload.data.bookings : [];
    const mapped = rows.map((b) => {
      const v = b.vehicle || {};
      const photo =
        Array.isArray(v.photos) && v.photos.length
          ? v.photos[0]
          : 'https://placehold.co/600x420/e5e7eb/9ca3af?text=No+Image';
      const year = v.year ? String(v.year) : '';
      const type = v.category?.value || v.type?.value || '';
      const location = v.location?.value || '';
      return {
        id: b.id,
        bookingNumber: `Booking #${b.id}`,
        status: normalizeStatus(b.status),
        vehicle: {
          name: v.name || 'Vehicle',
          year,
          type,
          location,
          image: photo,
        },
        rentalPeriod: { from: formatDateShort(b.pickupDate), to: formatDateShort(b.returnDate) },
        pickupLocation: null,
        returnLocation: null,
        insuranceType: b.insuranceType || '',
        totalPrice: Number(b.totalAmount || 0),
        bookedOn: formatDateShort(b.createdAt),
      };
    });

    renderBookings(mapped);
  } catch (err) {
    console.error('My bookings load error:', err);
    renderBookings([]);
  }
}

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  // COOKIE AUTH IMPLEMENTED: protected by 401 redirect in api.js
  loadMyBookings();

  document.getElementById('bookingsList').addEventListener('click', e => {
    const card = e.target.closest('.booking-card');
    if (!card) return;
    console.log(`[RentWheels] Open booking id=${card.dataset.id}`);
    // TODO: navigate to /bookings/:id
  });
});