
'use strict';


const BOOKINGS_DATA = [
  {
    id            : 1,
    bookingNumber : 'Booking #1',
    status        : 'confirmed',
    vehicle: {
      name     : 'BMW M4 COMPETITION',
      year     : '2022',
      type     : 'SUV',
      location : 'Kathmandu',
      image    : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80',
    },
    rentalPeriod  : { from: '4/10/2025', to: '4/15/2025' },
    insuranceType : 'Half Insurance',
    totalPrice    : 475,
    bookedOn      : '4/1/2025',
  },
  {
    id            : 2,
    bookingNumber : 'Booking #2',
    status        : 'confirmed',
    vehicle: {
        name     : 'BMW M4 COMPETITION',
        year     : '2022',
        type     : 'SUV',
        location : null,
        image    : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80',
    },
    rentalPeriod  : { from: '4/10/2025', to: '4/15/2025' },
    pickupLocation: null,
    returnLocation: null,
    insuranceType : 'No insurance',
    totalPrice    : 475,
    bookedOn      : '4/1/2026',
  },
  {
    id            : 3,
    bookingNumber : 'Booking #3',
    status        : 'confirmed',
    vehicle: {
      name     : 'BMW M4 COMPETITION',
      year     : '2022',
      type     : 'SUV',
      location : null,
      image    : 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80',
    },
    rentalPeriod  : { from: '4/10/2025', to: '4/15/2025' },
    pickupLocation: null,
    returnLocation: null,
    insuranceType : 'No insurance',
    totalPrice    : 475,
    bookedOn      : '4/1/2026',
  },
];


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
  const metaParts  = [vehicle.year, vehicle.type, vehicle.location].filter(Boolean);
  const vehicleMeta = metaParts.join(' · ');

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
        <span class="price-amount">Rs ${booking.totalPrice}</span>
        <span class="price-booked-on">Booked on ${booking.bookedOn}</span>
      </div>

    </article>`;
}


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


document.addEventListener('DOMContentLoaded', () => {
  renderBookings(BOOKINGS_DATA);

  document.getElementById('bookingsList').addEventListener('click', e => {
    const card = e.target.closest('.booking-card');
    if (!card) return;
    console.log(`[RentWheels] Open booking id=${card.dataset.id}`);
  });
});
